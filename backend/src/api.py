"""
UCI Marketplace Backend API - Simple with Auth

Basic authentication using sessions (no JWT complexity)
Works with Python 3.13!

To run:
$ python -m uvicorn src.api:app --reload
"""

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session as DBSession
from datetime import datetime
from pathlib import Path
import shutil
import uuid
import secrets
from typing import Optional

# ============================================
# DATABASE SETUP
# ============================================

DATABASE_URL = "sqlite:///./marketplace.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ============================================
# DATABASE MODELS
# ============================================

class User(Base):
    """User table"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    password = Column(String, nullable=False)  # Store plain text for simplicity (NOT for production!)
    session_token = Column(String, unique=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Listing(Base):
    """Listing table"""
    __tablename__ = "listings"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    price = Column(Float, nullable=False)
    category = Column(String)
    image_url = Column(String)
    user_id = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


# Create tables
Base.metadata.create_all(bind=engine)


# ============================================
# PYDANTIC MODELS
# ============================================

class UserSignup(BaseModel):
    email: str
    name: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


# ============================================
# FASTAPI APP
# ============================================

app = FastAPI(title="UCI Marketplace API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Serve images
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# ============================================
# HELPER FUNCTIONS
# ============================================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(authorization: str = Header(None)):
    """Get current user from session token"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Extract token from "Bearer <token>"
    try:
        token = authorization.replace("Bearer ", "")
    except:
        raise HTTPException(status_code=401, detail="Invalid token format")
    
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.session_token == token).first()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid session")
        return user
    finally:
        db.close()


# ============================================
# AUTH ROUTES
# ============================================

@app.post("/auth/signup")
async def signup(user_data: UserSignup):
    """Create new account"""
    db = SessionLocal()
    try:
        # Check if email exists
        existing = db.query(User).filter(User.email == user_data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create user with session token
        session_token = secrets.token_urlsafe(32)
        new_user = User(
            email=user_data.email,
            name=user_data.name,
            password=user_data.password,  # Plain text (for simplicity - NOT for production!)
            session_token=session_token
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return {
            "message": "User created",
            "token": session_token,
            "user": {
                "id": new_user.id,
                "email": new_user.email,
                "name": new_user.name
            }
        }
    finally:
        db.close()


@app.post("/auth/login")
async def login(user_data: UserLogin):
    """Login to account"""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == user_data.email).first()
        if not user or user.password != user_data.password:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Generate new session token
        session_token = secrets.token_urlsafe(32)
        user.session_token = session_token
        db.commit()
        
        return {
            "message": "Login successful",
            "token": session_token,
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name
            }
        }
    finally:
        db.close()


@app.get("/auth/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name
    }


# ============================================
# LISTING ROUTES
# ============================================

@app.get("/")
async def root():
    return {"message": "UCI Marketplace API"}


@app.get("/listings")
async def get_listings():
    """Get all listings"""
    db = SessionLocal()
    try:
        listings = db.query(Listing).order_by(Listing.created_at.desc()).all()
        return [
            {
                "id": l.id,
                "title": l.title,
                "description": l.description,
                "price": l.price,
                "category": l.category,
                "image_url": l.image_url,
                "user_id": l.user_id,
                "created_at": l.created_at.isoformat()
            }
            for l in listings
        ]
    finally:
        db.close()


@app.get("/listings/{listing_id}")
async def get_listing(listing_id: int):
    """Get single listing"""
    db = SessionLocal()
    try:
        listing = db.query(Listing).filter(Listing.id == listing_id).first()
        if not listing:
            raise HTTPException(status_code=404, detail="Not found")
        
        return {
            "id": listing.id,
            "title": listing.title,
            "description": listing.description,
            "price": listing.price,
            "category": listing.category,
            "image_url": listing.image_url,
            "user_id": listing.user_id,
            "created_at": listing.created_at.isoformat()
        }
    finally:
        db.close()


@app.post("/listings")
async def create_listing(
    title: str = Form(...),
    description: str = Form(""),
    price: float = Form(...),
    category: str = Form("Other"),
    image: UploadFile = File(None),
    current_user: User = Depends(get_current_user)
):
    """Create listing (requires auth)"""
    
    image_url = None
    
    if image:
        if not image.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Must be an image")
        
        file_extension = image.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = UPLOAD_DIR / unique_filename
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        
        image_url = f"/uploads/{unique_filename}"
    
    db = SessionLocal()
    try:
        new_listing = Listing(
            title=title,
            description=description,
            price=price,
            category=category,
            image_url=image_url,
            user_id=current_user.id
        )
        
        db.add(new_listing)
        db.commit()
        db.refresh(new_listing)
        
        return {
            "id": new_listing.id,
            "title": new_listing.title,
            "description": new_listing.description,
            "price": new_listing.price,
            "category": new_listing.category,
            "image_url": new_listing.image_url,
            "user_id": new_listing.user_id,
            "created_at": new_listing.created_at.isoformat()
        }
    finally:
        db.close()


@app.delete("/listings/{listing_id}")
async def delete_listing(
    listing_id: int,
    current_user: User = Depends(get_current_user)
):
    """Delete listing (must be owner)"""
    
    db = SessionLocal()
    try:
        listing = db.query(Listing).filter(Listing.id == listing_id).first()
        if not listing:
            raise HTTPException(status_code=404, detail="Not found")
        
        if listing.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        if listing.image_url:
            image_path = Path(listing.image_url.lstrip("/"))
            if image_path.exists():
                image_path.unlink()
        
        db.delete(listing)
        db.commit()
        
        return {"message": "Deleted"}
    finally:
        db.close()


@app.get("/categories")
async def get_categories():
    return ["Textbooks", "Furniture", "Electronics", "Clothing", "Tickets", "Housing", "Other"]