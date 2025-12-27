"""
FastAPI Main Application - Bill Detection Service
"""
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Dict
import os
from dotenv import load_dotenv
from bill_detector import BillDetector

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Bill Detection Service",
    description="AI-powered ingredient detection from bills/receipts",
    version="1.0.0"
)

# CORS middleware
allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:8080').split(',')
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize detector
print("🚀 Starting Bill Detection Service...")
detector = BillDetector(languages=['en'], gpu=False)
print("✅ Service ready!")


@app.get("/")
async def root():
    """Service info"""
    return {
        "service": "Bill Detection Service",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "/detect": "POST - Detect ingredients from bill image",
            "/health": "GET - Health check"
        }
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "bill-detection",
        "ocr_loaded": detector.reader is not None
    }


@app.post("/detect")
async def detect_ingredients(file: UploadFile = File(...)):
    """
    Detect ingredients from uploaded bill/receipt image
    
    Args:
        file: Image file (JPEG, PNG, etc.)
    
    Returns:
        List of detected ingredients with quantities and units
    """
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400,
                detail="File must be an image (JPEG, PNG, etc.)"
            )
        
        # Validate file size (max 10MB)
        max_size = int(os.getenv('MAX_IMAGE_SIZE', 10485760))
        content = await file.read()
        
        if len(content) > max_size:
            raise HTTPException(
                status_code=400,
                detail=f"File size exceeds {max_size / 1024 / 1024}MB limit"
            )
        
        # Detect ingredients
        detected_items = detector.detect_ingredients(content)
        
        # Merge similar items
        merged_items = detector.merge_similar_items(detected_items)
        
        return {
            "success": True,
            "total_detected": len(merged_items),
            "items": merged_items
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error during detection: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Detection failed: {str(e)}"
        )


@app.post("/detect-with-conversion")
async def detect_and_convert(
    file: UploadFile = File(...),
):
    """
    Detect ingredients and return with conversion info
    This endpoint is used by the backend to get raw detections
    Backend will handle matching with database and unit conversion
    """
    try:
        # Validate file
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read content
        content = await file.read()
        
        # Detect
        detected_items = detector.detect_ingredients(content)
        merged_items = detector.merge_similar_items(detected_items)
        
        return {
            "success": True,
            "total_detected": len(merged_items),
            "items": merged_items
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Run with: uvicorn main:app --host 0.0.0.0 --port 5001 --reload
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv('PORT', 5001))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
