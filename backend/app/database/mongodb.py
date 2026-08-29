from motor.motor_asyncio import AsyncIOMotorClient
import certifi
from app.config import settings

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

db_client = MongoDB()

async def connect_to_mongo():
    uri = settings.MONGODB_URI
    kwargs = {
        "serverSelectionTimeoutMS": 10000,
        "connectTimeoutMS": 10000,
        "retryWrites": True
    }
    if "mongodb+srv://" in uri or "ssl=true" in uri.lower():
        kwargs["tlsCAFile"] = certifi.where()
    
    db_client.client = AsyncIOMotorClient(uri, **kwargs)
    db_client.db = db_client.client[settings.MONGODB_DATABASE]
    print(f"Connected to MongoDB: {settings.MONGODB_DATABASE}")

async def close_mongo_connection():
    if db_client.client:
        db_client.client.close()
        print("Closed MongoDB connection")

def get_database():
    return db_client.db
