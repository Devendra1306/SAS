from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from app.schemas.auth import LoginRequest, StudentLoginRequest, TokenRefreshRequest, TokenResponse
from app.database.mongodb import get_database
from app.auth.security import verify_password, create_access_token, create_refresh_token
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    db = get_database()
    user = await db.users.find_one({
        "$or": [{"username": request.username_or_email}, {"email": request.username_or_email}]
    })
    if not user or not verify_password(request.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    if user.get("role") not in ["ADMIN", "FACULTY"]:
        raise HTTPException(status_code=403, detail="Not an admin/faculty account")
    
    name = user.get("username", "Admin")
    if user.get("role") == "FACULTY":
        fac = await db.faculty.find_one({"$or": [{"user_id": str(user["_id"])}, {"email": user.get("email")}]})
        if fac:
            name = fac.get("name", name)
    
    access_token = create_access_token(data={"sub": str(user["_id"]), "role": user["role"]})
    refresh_token = create_refresh_token(data={"sub": str(user["_id"]), "role": user["role"]})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        role=user["role"],
        user_id=str(user["_id"]),
        name=name
    )

@router.post("/student-login", response_model=TokenResponse)
async def student_login(request: StudentLoginRequest):
    db = get_database()
    student = await db.students.find_one({
        "$or": [{"student_id": request.student_id_or_email.upper()}, {"student_id": request.student_id_or_email}, {"email": request.student_id_or_email.lower()}]
    })
    if not student:
        raise HTTPException(status_code=401, detail="Student ID or email not found")
        
    user_id_val = student.get("user_id")
    try:
        user_id_obj = ObjectId(str(user_id_val))
    except Exception:
        user_id_obj = None

    user = await db.users.find_one({"$or": [{"_id": user_id_obj}, {"username": student["student_id"]}, {"email": student.get("email")}]})
    if not user or not verify_password(request.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid password")
    
    access_token = create_access_token(data={"sub": str(user["_id"]), "role": "STUDENT"})
    refresh_token = create_refresh_token(data={"sub": str(user["_id"]), "role": "STUDENT"})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        role="STUDENT",
        user_id=str(user["_id"]),
        name=student.get("name", "Student")
    )

@router.post("/refresh")
async def refresh_token(request: TokenRefreshRequest):
    from app.auth.security import jwt, settings
    try:
        payload = jwt.decode(request.refresh_token, settings.JWT_REFRESH_SECRET, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        
        access_token = create_access_token(data={"sub": payload.get("sub"), "role": payload.get("role")})
        return {"access_token": access_token}
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

@router.post("/logout")
async def logout():
    return {"message": "Logged out successfully"}

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    db = get_database()
    current_user["id"] = str(current_user["_id"])
    current_user.pop("password_hash", None)
    
    # Enrich profile with student or faculty data
    if current_user.get("role") == "STUDENT":
        st = await db.students.find_one({
            "$or": [
                {"user_id": str(current_user["_id"])},
                {"student_id": current_user.get("username")},
                {"email": current_user.get("email")}
            ]
        })
        if st:
            current_user["student_id"] = st.get("student_id")
            current_user["roll_number"] = st.get("roll_number")
            current_user["roll_no"] = st.get("roll_number")
            current_user["name"] = st.get("name", current_user.get("username"))
            current_user["department"] = st.get("department")
            current_user["year"] = st.get("year")
            current_user["section"] = st.get("section")
            current_user["phone"] = st.get("phone")
    elif current_user.get("role") == "FACULTY":
        fac = await db.faculty.find_one({
            "$or": [
                {"user_id": str(current_user["_id"])},
                {"faculty_id": current_user.get("username")},
                {"email": current_user.get("email")}
            ]
        })
        if fac:
            current_user["faculty_id"] = fac.get("faculty_id")
            current_user["name"] = fac.get("name", current_user.get("username"))
            current_user["department"] = fac.get("department")
            current_user["subjects"] = fac.get("subject_ids", [])
            
    return current_user
