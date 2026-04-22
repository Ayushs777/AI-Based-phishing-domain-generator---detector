import os
import sqlite3
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

def test_connections():
    print("\n" + "="*50)
    print("🛡️  PHISHGUARD SERVICE DIAGNOSTICS (SQLite Mode)")
    print("="*50 + "\n")
    
    # 1. Test SQLite
    db_url = os.getenv("DATABASE_URL")
    print(f"📡 Testing Database at: {db_url}")
    try:
        engine = create_engine(db_url)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✅ Database: SUCCESS (SQLite is ready)")
    except Exception as e:
        print(f"❌ Database: FAILED")
        print(f"   Error: {str(e)[:100]}")

    print("\n" + "-"*30 + "\n")

    # 2. Test Groq API
    api_key = os.getenv("GROQ_API_KEY")
    print(f"📡 Checking Groq API Key...")
    if api_key and api_key.startswith("gsk_"):
        print("✅ Groq API: Key present and formatted correctly.")
    else:
        print("❌ Groq API: Key missing or invalid in .env")

    print("\n" + "="*50)
    print("🏁 Diagnostics Finished - Ready to run!")
    print("="*50 + "\n")
    print("To start the app, run: uvicorn app.main:app --reload")

if __name__ == "__main__":
    test_connections()
