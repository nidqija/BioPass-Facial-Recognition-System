from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from interface import CustomerRegistration , EventDetails
from floci_backend.dynamodb_config import dynamodb
from floci_backend.s3_config import s3

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

    return {"events": events_list}
    

    

