from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from interface import CustomerDetails, CustomerRegistration , EventDetails
from floci_backend.dynamodb_config import dynamodb
from floci_backend.s3_config import BUCKET_NAME, BUCKET_NAME, s3
from fastapi.responses import StreamingResponse
from yolo.image_detection_from_floci import load_s3_reference_faces, load_s3_reference_faces, run_live_face_verification

app = FastAPI()



app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
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
        load_s3_reference_faces()

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



    

