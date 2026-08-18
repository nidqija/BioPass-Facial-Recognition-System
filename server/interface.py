from pydantic import BaseModel
# pyrefly: ignore [missing-import]
from fastapi import UploadFile, File


class CustomerRegistration(BaseModel):
    fullName: str
    paymentFile: str



class EventDetails(BaseModel):
    eventId: str = ""
    artist: str = ""
    genre: str = ""
    venue: str = ""
    city: str = ""
    date: str = ""
    doorsOpen: str = ""
    price: str = ""
    tier: str = ""
    status: str = "Available"
    accentColor: str = "#D97706"


class CustomerDetails(BaseModel):
    customerId: str
    fullName: str
    paymentFile: str
    faceImage: UploadFile = File(...)  
    
    