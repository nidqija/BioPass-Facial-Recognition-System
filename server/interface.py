from pydantic import BaseModel
from fastapi import UploadFile, File


class CustomerRegistration(BaseModel):
    fullName: str
    paymentFile: str



class EventDetails(BaseModel):
    eventId: str
    artist: str
    genre: str
    venue: str
    city: str
    date: str
    doorsOpen: str
    price: str
    tier: str
    status: str
    accentColor: str


class CustomerDetails(BaseModel):
    customerId: str
    fullName: str
    paymentFile: str
    faceImage: UploadFile = File(...)  
    
    