import hashlib
import secrets
import smtplib
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
from typing import Dict, Optional



# class to represent login request payload from client 
class LoginRequest(BaseModel):
    email : EmailStr
    password : str

# class to represent OTP verification request payload from client
class VerifyOTPRequest(BaseModel):
    pre_auth_token : str
    otp_token : str


# hash code function to hash the otp code using sha256 
# this is used to store the hashed otp code in the database for verification later
def hash_code(code: str) -> str:
    # return a SHA256 hash of the code back to user for verification
    return hashlib.sha256(code.encode()).hexdigest()


def send_otp_email(to_email: str, otp_code:str):
    msg = EmailMessage()
    msg.set_content(f"Your OTP code is: {otp_code}")
    msg['Subject'] = 'Your OTP Code'
    msg['From'] = 'biopass@mailpit.com'
    msg['To'] = to_email

    with smtplib.SMTP('localhost') as server:
        server.send_message(msg)





    


