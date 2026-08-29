import asyncio, os
from motor.motor_asyncio import AsyncIOMotorClient
import certifi
from passlib.context import CryptContext
from bson import ObjectId
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv('K:/SAS/backend/.env')

pwd_context = CryptContext(schemes=['argon2'], deprecated='auto')

async def main():
    mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
    db_name = os.getenv('MONGODB_DATABASE', 'sas_db')
    
    kwargs = {}
    if 'mongodb+srv://' in mongo_uri or 'ssl=true' in mongo_uri.lower():
        kwargs['tlsCAFile'] = certifi.where()
    
    client = AsyncIOMotorClient(mongo_uri, **kwargs)
    db = client[db_name]
    
    now = datetime.now(timezone.utc)
    
    # 1. Admin
    await db.users.delete_many({'username': 'admin'})
    await db.users.insert_one({
        'username': 'admin',
        'email': 'admin@sas.edu',
        'password_hash': pwd_context.hash('Admin@SAS2024'),
        'role': 'ADMIN',
        'is_active': True,
        'created_at': now
    })
    print('1. Admin: admin / Admin@SAS2024')
    
    # 2. Faculty: FAC001
    await db.users.delete_many({'username': 'FAC001'})
    fac_user = await db.users.insert_one({
        'username': 'FAC001',
        'email': 'faculty@sas.edu',
        'password_hash': pwd_context.hash('Faculty@123'),
        'role': 'FACULTY',
        'is_active': True,
        'created_at': now
    })
    
    await db.faculty.delete_many({'faculty_id': 'FAC001'})
    fac_doc = await db.faculty.insert_one({
        'faculty_id': 'FAC001',
        'name': 'Dr. Priya Sharma',
        'email': 'faculty@sas.edu',
        'department': 'CSE',
        'user_id': str(fac_user.inserted_id),
        'subject_ids': [],
        'is_active': True,
        'created_at': now
    })
    print('2. Faculty: FAC001 / Faculty@123')
    
    # 3. Subject: ML401
    await db.subjects.delete_many({'subject_code': 'ML401'})
    subj_doc = await db.subjects.insert_one({
        'subject_code': 'ML401',
        'subject_name': 'Machine Learning',
        'department': 'CSE',
        'year': 4,
        'section': 'A',
        'faculty_id': str(fac_doc.inserted_id),
        'created_at': now
    })
    await db.faculty.update_one(
        {'_id': fac_doc.inserted_id},
        {'$set': {'subject_ids': [str(subj_doc.inserted_id)]}}
    )
    print('3. Subject: ML401 (Machine Learning - CSE Y4 Sec A)')
    
    # 4. Student: 23A81A4301
    await db.users.delete_many({'username': '23A81A4301'})
    st_user = await db.users.insert_one({
        'username': '23A81A4301',
        'email': '23a81a4301@sas.edu',
        'password_hash': pwd_context.hash('Student@123'),
        'role': 'STUDENT',
        'is_active': True,
        'created_at': now
    })
    
    await db.students.delete_many({'student_id': '23A81A4301'})
    await db.students.insert_one({
        'student_id': '23A81A4301',
        'roll_number': '23A81A4301',
        'name': 'Arjun Reddy',
        'email': '23a81a4301@sas.edu',
        'phone': '+91 9876543210',
        'department': 'CSE',
        'year': 4,
        'section': 'A',
        'user_id': str(st_user.inserted_id),
        'is_active': True,
        'created_at': now
    })
    print('4. Student: 23A81A4301 / Student@123')
    print('ALL 3 BASELINE LOGINS ACTIVE AND VERIFIED.')

if __name__ == '__main__':
    asyncio.run(main())
