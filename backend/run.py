import uvicorn
import os

if __name__ == "__main__":
    # Grab the port Render assigns, or default to 8000 for local testing
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
