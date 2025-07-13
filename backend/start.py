import uvicorn
import os
from dotenv import load_dotenv
#  
#    pip install -r requirements.txt
#    # Create .env file with your database credentials
#    python start.py

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", 8000))
    
    print(f"Starting Mood Tracker API on {host}:{port}")
    uvicorn.run("main:app", host=host, port=port, reload=True) 