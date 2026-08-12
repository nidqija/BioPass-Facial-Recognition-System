import asyncio
import io
import cv2
import numpy as np
from PIL import Image
from deepface import DeepFace
from server_side_events.sse_events import event_queue
from floci_backend.s3_config import s3
from floci_backend.dynamodb_config import dynamodb
from floci_backend.config.floci_config import BUCKET_NAME

known_faces = {}  

# Function to load reference faces from S3 bucket based on event_id
def load_s3_reference_faces(active_event_id: str):
    global known_faces
    known_faces.clear()
    
    try:
        # Find the corresponding customerid and face file in DynamoDB for active event
        response = dynamodb.query(
            TableName="my-bucket-table",
            KeyConditionExpression="#id = :event_val",
            ExpressionAttributeNames={"#id": "id"},
            ExpressionAttributeValues={":event_val": {"S": active_event_id}}
        )


        # get the items from the response
        # response is in form of a dictionary with key "Items" which contains a list of items from the db data
        items = response.get("Items", [])

        # if there are no items received from the response , log a notice message and return
        if not items:
            print(f"No event found in DynamoDB for event_id '{active_event_id}'. Skipping face loading.")
            return

        # iterate through the items and get the customer id and face_path for each item 
        for item in items:
            customer_id = item.get("customerId", {}).get("S", "")
            face_path = item.get("faceFile", {}).get("S", "")

            if not customer_id or not face_path:
                print(f"Missing customerId or faceFile for event_id '{active_event_id}'. Skipping this entry.")
                continue

            try: 
                # get the image from s3 bucket using face_path retrieved 
                s3_file = s3.get_object(Bucket=BUCKET_NAME, Key=face_path)

                # read the file bytes from the s3 object and convert it to a numpy array for face comparison
                file_bytes = s3_file["Body"].read() 

                # convert the image bytes to a numpy array and then to RGB format for face comparison
                image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
                rgb_image = np.ascontiguousarray(np.array(image))

                # store the reference face in the known faces dictionary with customer_id as key and the rgb_image as value
                known_faces[customer_id] = rgb_image
                print(f"Loaded reference face for '{customer_id}' from S3 path: s3://{BUCKET_NAME}/{face_path}")

            except s3.exceptions.NoSuchKey:
                # if face file is not found in the s3 bucket , log a notice message and continue to next item
                print(f"S3 object key not found for key: {face_path}")
            except Exception as e:

                # if any other error occurs while processing the image from s3 bucket , log the error message and continue to next item     
                print(f"Error processing image for '{customer_id}' from S3 path: s3://{BUCKET_NAME}/{face_path} - {e}")

    except Exception as e:
        print(f"Error loading reference faces for event '{active_event_id}': {e}")


# Function to run live face verification using webcam
def run_live_face_verification(active_event_id: str):

    load_s3_reference_faces(active_event_id)

    if not known_faces:
        print("No reference faces found in S3 for this event. Please upload reference images first.")
        return

    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return

    print("Starting live face verification...")

    frame_count = 0
    current_status = "Scanning..."
    status_color = (0, 0, 255)  

    while True:
        ret, frame = cap.read()

        if not ret:
            break

        frame_count += 1

        if frame_count % 5 == 0:
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            rgb_frame = np.ascontiguousarray(rgb_frame)

            match_found = False

            for person_name, reference_face in known_faces.items():
                try:
                    # Verify target frame against the loaded reference face
                    result = DeepFace.verify(
                        img1_path=rgb_frame,
                        img2_path=reference_face,
                        model_name="Facenet",
                        detector_backend="mtcnn",
                        enforce_detection=False,
                    )

                    if result.get("verified"):
                        match_found = True
                        current_status = f"Match Found: {person_name}"
                        status_color = (0, 255, 0)  # Green (BGR)

                        # Write attendance record
                        dynamodb.put_item(
                            TableName="attendance_data",
                            Item={
                                "eventId": {"S": active_event_id},
                                "customerId": {"S": person_name},
                                "status": {"S": "Verified"}
                            }
                        )

                        event_payload = {
                            "type": "USER_VERIFIED",
                            "eventId": active_event_id,
                            "customerId": person_name,
                            "status" : "Verified",
                        }

                        # call for event notifier to send the event payload to the client
                        loop = asyncio.get_event_loop()

                        # use call_soon_threadsafe to ensure that the event is put into the queue in a thread-safe manner
                        # avoiding potential issues like deadlocks or race conditions
                        loop.call_soon_threadsafe(event_queue.put_nowait, event_payload)

                        print(f"Match found for '{person_name}'. Attendance recorded in DynamoDB for event '{active_event_id}'.")
                        print(f"[Event Notifier] Event payload sent: {event_payload}")
                        break

                except ValueError:
                    current_status = "No Face Detected"
                    status_color = (0, 165, 255)  # Orange
                    continue

                except Exception as e:
                    print(f"Error during verification for '{person_name}' ({type(e).__name__}): {e}")
                    continue

            if not match_found and current_status != "No Face Detected":
                current_status = "No Match Found"
                status_color = (0, 0, 255)  # Red (BGR)

        cv2.putText(
            frame,
            current_status,
            (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            status_color,
            2
        )

        _, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    cap.release()


