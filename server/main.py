from datetime import datetime, timedelta, timezone
import secrets

# pyrefly: ignore [missing-import]
from fastapi import FastAPI, File, Form, HTTPException, UploadFile , Request
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
import json

# pyrefly: ignore [missing-import]
from jwt.exceptions import PyJWTError
# pyrefly: ignore [missing-import]
import jwt
from typing import Dict , Set
from interface import CustomerDetails, CustomerRegistration , EventDetails
from mailpit.login_request import LoginRequest, VerifyOTPRequest, hash_code, send_otp_email
from floci_backend.dynamodb_config import dynamodb
from floci_backend.s3_config import BUCKET_NAME, BUCKET_NAME, s3
# pyrefly: ignore [missing-import]
from fastapi.responses import StreamingResponse
from yolo.image_detection_from_floci import load_s3_reference_faces, load_s3_reference_faces, run_live_face_verification
import asyncio
import uuid

from server_side_events.sse_events import event_queue, sse_subscribers, dispatch_events

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(dispatch_events())

SMTP_SERVER = "localhost"
SMTP_PORT = 8025 

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
    
otp_storage: Dict[str, dict] = {}


@app.get("/api/events")
async def sse_events(request: Request):
    client_queue = asyncio.Queue()
    sse_subscribers.add(client_queue)

    async def event_stream():
        try:
            while True:
                if await request.is_disconnected():
                    break
                event_data = await client_queue.get()
                yield f"data: {json.dumps(event_data)}\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            sse_subscribers.discard(client_queue)

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

                

    


    

@app.get("/")
def get_root():


    
    return {"message": "Hello, World!"}


@app.post("/api/insert-name")
def insert_name(customer: CustomerRegistration):


    s3.put_object(

        Bucket="my-app-bucket", 
        Key="faces/user_1001/" + customer.paymentFile, 
        Body=b"Dummy payment file content"

        )

    id = "ticket_1234"  # Replace with your actual ID generation logic

    dynamodb.put_item(
        
        TableName="my-bucket-table",
        Item={
            "id": {"S": id},  # Partition Key
            "name": {"S": customer.fullName},
            "s3_bucket": {"S": "my-app-bucket"},
            "s3_key": {"S": customer.paymentFile}
        }
    )

    if s3 and dynamodb:
        print("Data inserted successfully into S3 and DynamoDB.")

    elif not s3:
        print("Failed to insert data into S3.")

    elif not dynamodb:
        print("Failed to insert data into DynamoDB.")



    return {"message": f"Name '{customer.fullName}' and payment file '{customer.paymentFile}' inserted successfully."}


@app.get("/api/get-events")
# get method dont need a request body, so we can just return the events from dynamodb with a default parameter
def get_events():

    
    # Fetch events from DynamoDB
    response = dynamodb.scan(TableName="events_data")
    items = response.get("Items", [])

    events_list = []
    for item in items:
        event = EventDetails(
            eventId=item.get("id", {}).get("S", ""),
            artist=item.get("artist", {}).get("S", ""),
            genre=item.get("genre", {}).get("S", ""),
            venue=item.get("venue", {}).get("S", ""),
            city=item.get("city", {}).get("S", ""),
            date=item.get("date", {}).get("S", ""),
            doorsOpen=item.get("doorsOpen", {}).get("S", ""),
            price=item.get("price", {}).get("S", ""),
            tier=item.get("tier", {}).get("S", ""),
            status=item.get("status", {}).get("S", ""),
            accentColor=item.get("accentColor", {}).get("S", "")
        )
        events_list.append(event)

    print("Fetched events from DynamoDB:", events_list)

    return {"events": events_list}


@app.get("/api/get-event/{event_id}")
def get_event(event_id: str):

    # Fetch event from DynamoDB based on event_id
    response = dynamodb.query(
        TableName="events_data",
        KeyConditionExpression="#id = :val",
        ExpressionAttributeNames={"#id": "id"},
        ExpressionAttributeValues={":val": {"S": event_id}}
    )
    item = response.get("Items")[0] if response.get("Items") else None

    if not item:
        return {"message": f"Event with ID '{event_id}' not found."}

    event = EventDetails(
        eventId=item.get("id", {}).get("S", ""),
        artist=item.get("artist", {}).get("S", ""),
        genre=item.get("genre", {}).get("S", ""),
        venue=item.get("venue", {}).get("S", ""),
        city=item.get("city", {}).get("S", ""),
        date=item.get("date", {}).get("S", ""),
        doorsOpen=item.get("doorsOpen", {}).get("S", ""),
        price=item.get("price", {}).get("S", ""),
        tier=item.get("tier", {}).get("S", ""),
        status=item.get("status", {}).get("S", ""),
        accentColor=item.get("accentColor", {}).get("S", "")
    )

    # in client side , it is read as eventData.event.artist, eventData.event.venue, etc. so we need to return it as event
    return {"event": event}


@app.post("/api/insert-customer-for-event/{event_id}")
async def insert_customer_for_event(
    event_id: str,
    customerId: str = Form(...),
    fullName: str = Form(...),
    paymentFile: str = Form(...),
    faceImage: UploadFile = File(...)  # Match parameter name from React FormData
):
    if not customerId or not fullName or not paymentFile:
        return {"message": "Missing required customer details."}

    try:
        # Read the raw binary image bytes from the file stream
        image_bytes = await faceImage.read()
        
        # Build S3 Path key
        faceFile_path = f"faces/{customerId}/{faceImage.filename}"

        # 1. Insert Metadata into DynamoDB
        dynamodb.put_item(
            TableName="my-bucket-table",
            Item={
                "id": {"S": event_id},
                "name": {"S": fullName},
                "customerId": {"S": customerId},
                "paymentFile": {"S": paymentFile},
                "faceFile": {"S": faceFile_path}
            }
        )

        # 2. Upload REAL binary image bytes to S3
        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=faceFile_path,
            Body=image_bytes,
            ContentType=faceImage.content_type or "image/jpeg"
        )
        print(f"Face file '{faceImage.filename}' uploaded to S3 for customer '{fullName}'.")

        # 3. Reload DeepFace reference faces in memory
        load_s3_reference_faces(event_id)

        return {"message": f"Customer '{fullName}' inserted successfully for event '{event_id}'."}

    except Exception as e:
        print(f"Error inserting customer: {e}")
        return {"message": f"Error occurred while inserting customer for event: {str(e)}"}


@app.get("/api/video-verification/{event_id}")
def video_verification(event_id: str):
    return StreamingResponse(
        run_live_face_verification(active_event_id=event_id),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )


# api endpoint for login request from client 
# this function will return a pre_auth_token and send an otp code to the user's email for verification
# check for matching params , then generate uuid , pre auth token and otp code to send to user email
@app.post("/api/auth/login")
async def login(login_request: LoginRequest):

    if login_request.email == "admin@gmail.com" and login_request.password == "admin123":
        user_id = uuid.uuid4().hex  # Generate a unique user ID
    

        otp = str(secrets.randbelow(900000) + 100000)  # Generate a 6-digit OTP


        otp_storage[user_id] = {
            "hash_otp" : hash_code(otp),
            "expires_at" : datetime.now(timezone.utc) + timedelta(minutes=5),
            "attempts" : 0

        }

        # send the otp code to the user's email using the send_otp_email function from mailpit/login_request.py
        send_otp_email(login_request.email, otp)

        pre_auth_token = jwt.encode(
            {
                "sub": user_id, 
                "mfa_pending": True,
                "exp": datetime.now(timezone.utc) + timedelta(minutes=5)
                },


            "your_secret_key",
            algorithm="HS256"
        )

        return {
            "requires_mfa": True,
            "pre_auth_token": pre_auth_token,
            "message" : "OTP sent to your email. Please verify within 5 minutes."
        }


# function to verify otp code sent to user email and pre_auth_token from client
# it is sent through email and stored in memory for 5 minutes, 
# then it is deleted from memory after successful verification or expiration
@app.post("/api/auth/verify-otp")
async def verify_otp(verify_request: VerifyOTPRequest):

    try:
        # jwt function to decode the pre_auth_token from the client and check if it is valid and not expired
        payload = jwt.decode(
            verify_request.pre_auth_token, 
            "your_secret_key" , 
            algorithms=["HS256"]
            )

        # check if the pre auth token has mfa_pending set to true, if not then raise an error
        # we need it to be pending so the system can verify the otp code sent to the user email
        if not payload.get("mfa_pending"):
            raise HTTPException(status_code=400, detail="MFA not pending for this token.")

        # get the user id from the payload of the pre_auth_token to check if it exists in the otp_storage dictionary
        user_id = payload.get("sub")

    except PyJWTError:
        return {"message": "Invalid or expired pre-auth token."}  


    # get the record from the otp_storage dictionary using the user_id as the key
    record = otp_storage.get(user_id)

    # if the record does not exist or the record has expired , return an error message
    if not record or datetime.now(timezone.utc) > record["expires_at"]:
        return {"message": "OTP expired or not found. Please request a new OTP."}


    # if user has exceeded the maximum number of attempts (3), remove the record from otp_storage and return an error message
    if record["attempts"] >= 3:
        otp_storage.pop(user_id, None)  # Remove the record after 3 failed attempts
        raise HTTPException(status_code=400, detail="Maximum OTP attempts exceeded. Please request a new OTP.")


    if hash_code(verify_request.otp_token) != record["hash_otp"]:
        record["attempts"] += 1
        remaining = 3 - record["attempts"]
        return {"message": f"Invalid OTP. You have {remaining} attempts left."}

    otp_storage.pop(user_id, None)  # Remove the record after successful verification

    admin_success_token = jwt.encode(
        {
            "sub": user_id, 
            "exp": datetime.now(timezone.utc) + timedelta(minutes=5)

            },
        "your_secret_key",
        algorithm="HS256"
    )

    print(f"OTP verified successfully, OTP code for {user_id}, Admin is now logged in.")
    return {
        "access_token": admin_success_token,
        "token_type": "bearer",
        "message": "OTP verified successfully. You are now logged in."
    }

# fetch events for admin panel 
@app.get("/api/admin/events-list")
async def fetch_events_for_admin():
    try:
        response = dynamodb.scan(TableName="events_data")
        items = response.get("Items", [])

        events_list = []
        for item in items:
            event_id_val = item.get("id", {}).get("S", "") or item.get("eventId", {}).get("S", "")
            if not event_id_val:
                continue
            event = EventDetails(
                eventId=event_id_val,
                artist=item.get("artist", {}).get("S", "") or "Unknown Artist",
                genre=item.get("genre", {}).get("S", "") or "General",
                venue=item.get("venue", {}).get("S", "") or "TBA",
                city=item.get("city", {}).get("S", "") or "TBA",
                date=item.get("date", {}).get("S", "") or "TBA",
                doorsOpen=item.get("doorsOpen", {}).get("S", "") or "7:00 PM",
                price=item.get("price", {}).get("S", "") or "$0.00",
                tier=item.get("tier", {}).get("S", "") or "General Admission",
                status=item.get("status", {}).get("S", "") or "Available",
                accentColor=item.get("accentColor", {}).get("S", "") or "#D97706"
            )
            events_list.append(event)

        print("Fetched events from DynamoDB:", events_list)
        return {"events": events_list}

    except Exception as e:
        print(f"Error fetching events for admin: {e}")
        return {"message": f"Error occurred while fetching events for admin: {str(e)}"}


# post method to add new event to dynamodb for admin panel
@app.post("/api/admin/add-event")
async def add_event(event: EventDetails):
    try:
        event_id = str(event.eventId or f"BP-{uuid.uuid4().hex[:8].upper()}")
        item = {
            "id": {"S": event_id},
            "eventId": {"S": event_id},
            "artist": {"S": str(event.artist or "Unknown Artist")},
            "genre": {"S": str(event.genre or "General")},
            "venue": {"S": str(event.venue or "TBA")},
            "city": {"S": str(event.city or "TBA")},
            "date": {"S": str(event.date or "TBA")},
            "doorsOpen": {"S": str(event.doorsOpen or "7:00 PM")},
            "price": {"S": str(event.price or "$0.00")},
            "tier": {"S": str(event.tier or "General Admission")},
            "status": {"S": str(event.status or "Available")},
            "accentColor": {"S": str(event.accentColor or "#D97706")},
        }

        dynamodb.put_item(
            TableName="events_data",
            Item=item
        )

        print(f"Event '{event.artist}' added successfully to DynamoDB.")
        return {"message": f"Event '{event.artist}' added successfully.", "eventId": event_id}

    except Exception as e:
        print(f"Error adding event: {e}")
        raise HTTPException(status_code=500, detail=f"Error occurred while adding event: {str(e)}")


# put method to update an existing event in dynamodb
@app.put("/api/admin/update-event")
async def update_event(event: EventDetails):
    try:
        event_id = str(event.eventId or "").strip()
        if not event_id:
            raise HTTPException(status_code=400, detail="Missing required eventId for update.")

        accent_color = str(event.accentColor or "#D97706").strip() or "#D97706"
        dynamodb.put_item(
            TableName="events_data",
            Item={
                "id": {"S": event_id},
                "eventId": {"S": event_id},
                "artist": {"S": str(event.artist or "Unknown Artist").strip() or "Unknown Artist"},
                "genre": {"S": str(event.genre or "General").strip() or "General"},
                "venue": {"S": str(event.venue or "TBA").strip() or "TBA"},
                "city": {"S": str(event.city or "TBA").strip() or "TBA"},
                "date": {"S": str(event.date or "TBA").strip() or "TBA"},
                "doorsOpen": {"S": str(event.doorsOpen or "7:00 PM").strip() or "7:00 PM"},
                "price": {"S": str(event.price or "$0.00").strip() or "$0.00"},
                "tier": {"S": str(event.tier or "General Admission").strip() or "General Admission"},
                "status": {"S": str(event.status or "Available").strip() or "Available"},
                "accentColor": {"S": accent_color}
            }
        )

        print(f"Event '{event_id}' updated successfully in DynamoDB.")
        return {"message": f"Event '{event_id}' updated successfully."}

    except Exception as e:
        print(f"Error updating event: {e}")
        raise HTTPException(status_code=500, detail=f"Error occurred while updating event: {str(e)}")


# delete method to remove an event from dynamodb
@app.delete("/api/admin/delete-event/{event_id}")
async def delete_event(event_id: str):
    try:
        dynamodb.delete_item(
            TableName="events_data",
            Key={
                "id": {"S": event_id}
            }
        )
        print(f"Event '{event_id}' deleted successfully from DynamoDB.")
        return {"message": f"Event '{event_id}' deleted successfully."}

    except Exception as e:
        print(f"Error deleting event: {e}")
        raise HTTPException(status_code=500, detail=f"Error occurred while deleting event: {str(e)}")

