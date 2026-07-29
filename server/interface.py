from pydantic import BaseModel


class CustomerRegistration(BaseModel):
    fullName: str
    paymentFile: str



class EventDetails(BaseModel):
    eventId: str
    eventName: str
    eventDate: str
    eventLocation: str
    