from datetime import datetime
from app.database.mongodb import get_database


async def create_notification(user_id: str, title: str, message: str, notif_type: str = "INFO"):
    db = get_database()
    await db.notifications.insert_one({
        "user_id": user_id,
        "title": title,
        "message": message,
        "type": notif_type,
        "is_read": False,
        "created_at": datetime.utcnow()
    })


async def get_user_notifications(user_id: str, unread_only: bool = False) -> list:
    db = get_database()
    query = {"user_id": user_id}
    if unread_only:
        query["is_read"] = False
    cursor = db.notifications.find(query).sort("created_at", -1).limit(50)
    notifs = []
    async for doc in cursor:
        notifs.append({
            "id": str(doc["_id"]),
            "title": doc["title"],
            "message": doc["message"],
            "type": doc.get("type", "INFO"),
            "is_read": doc.get("is_read", False),
            "created_at": doc.get("created_at")
        })
    return notifs


async def mark_all_read(user_id: str):
    db = get_database()
    await db.notifications.update_many({"user_id": user_id}, {"$set": {"is_read": True}})
