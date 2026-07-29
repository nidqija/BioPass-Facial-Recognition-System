from pydantic import BaseModel


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
    