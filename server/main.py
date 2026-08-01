from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from interface import CustomerDetails, CustomerRegistration , EventDetails
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

    return {"event": event}


@app.post("/api/insert-customer-for-event/{event_id}")
def insert_customer_for_event(customer: CustomerDetails, event_id: str):

    # check if the customer details are invalid or not provided, if so return a message to the user
    if not customer.customerId or not customer.fullName or not customer.paymentFile:
        return {"message": "Missing required customer details."}

    # if customer info is completed , insert the customer details into the DynamoDB table for the specific event
    else:
        try:

            faceFile_path = f"faces/{customer.customerId}/{customer.faceFile}"

            dynamodb.put_item(
                TableName="my-bucket-table",
                Item={
                    "id": {"S": event_id},
                    "name": {"S": customer.fullName},
                    "customerId": {"S": customer.customerId},
                    "paymentFile": {"S": customer.paymentFile},
                    "faceFile": {"S": faceFile_path}
                }
            )

            if dynamodb:

                try:
                    s3.put_object(
                        Bucket="my-app-bucket",
                        Key=faceFile_path,
                        Body=b"Dummy face file content"
                    )
                    print(f"Face file '{customer.faceFile}' uploaded to S3 for customer '{customer.fullName}'.")

                except Exception as e:
                    print(f"Error occurred while uploading face file to S3: {str(e)}")
                    return {"message": f"Error occurred while uploading face file to S3: {str(e)}"}

            else:
                print("Failed to insert customer details into DynamoDB.")
                return {"message": "Failed to insert customer details into DynamoDB."}

            # if successful , print the message to the console for logging and ruturn a success message to the user
            print(f"Customer '{customer.fullName}' inserted successfully for event '{event_id}'.")
            return {"message": f"Customer '{customer.fullName}' inserted successfully for event '{event_id}'."}

        # if there is an error while inserting the customer details into the DynamoDB table, return an error message to the user
        except Exception as e:
            return {"message": f"Error occurred while inserting customer for event: {str(e)}"}

    

