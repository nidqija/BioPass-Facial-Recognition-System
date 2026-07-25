from pydantic import BaseModel


class CustomerRegistration(BaseModel):
    fullName: str
    paymentFile: str



