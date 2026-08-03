import io
import cv2
import numpy as np
from PIL import Image
from deepface import DeepFace

from floci_backend.s3_config import s3
from floci_backend.dynamodb_config import dynamodb
from floci_backend.config.floci_config import BUCKET_NAME

known_faces = {}  

# function to load reference faces from s3 bucket 
def load_s3_reference_faces():
    response = s3.list_objects_v2(Bucket=BUCKET_NAME, Prefix="faces/")
    for obj in response.get("Contents", []):
     
     try:
        key = obj["Key"]
        
        if key.lower().endswith((".jpg", ".jpeg", ".png")):
            key_parts = key.split("/")

            if len(key.split("/")) >= 3:
                customer_id = key_parts[1] 

            else:
                continue  

            try: 
                s3_file = s3.get_object(Bucket=BUCKET_NAME, Key=key)
                file_bytes = s3_file["Body"].read() 
                image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
                rgb_image = np.ascontiguousarray(np.array(image))
                known_faces[customer_id] = rgb_image
                print(f"Loaded reference face for '{customer_id}' from S3 path: s3://{BUCKET_NAME}/{key}")

            except Exception as e:
                print(f"Error processing image for '{customer_id}' from S3 path: s3://{BUCKET_NAME}/{key} - {e}")

     except Exception as e:
            print(f"Error loading reference face for '{customer_id}' from S3 path: s3://{BUCKET_NAME}/{key} - {e}")





# function to run live face verification using webcam
def run_live_face_verification(active_event_id: str):

    load_s3_reference_faces()

    if not known_faces:
        print("No reference faces found in S3. Please upload reference images first.")
        return

    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return

    print("Starting live face verification. Press 'q' to quit.")

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
                    # use deepface to verify the face in the current frame against the reference face
                    result = DeepFace.verify(
                        img1_path=rgb_frame, # the first image is the current frame from the webcam
                        img2_path=reference_face, # the second image is the reference face retrieved from the s3 bucket
                        model_name="Facenet", # use facenet model for face verification, it is a good balance between accuracy and speed
                        detector_backend="mtcnn",  # uses MTCNN for face detection, which is robust and accurate
                        enforce_detection=False, # if no face is detected in the current frame, it will not raise an error and will return a result with "verified": False
                    )

                   
                    if result.get("verified"):
                        match_found = True
                        current_status = f"Match Found: {person_name}"
                        status_color = (0, 255, 0)  # Green (BGR)


                        dynamodb.put_item(
                            TableName="attendance_data",
                            Item={
                                "eventId": {"S": active_event_id},
                                "customerId": {"S": person_name},
                                "status": {"S": "Verified"}
                            }
                        )

                        print(f"Match found for '{person_name}'. Attendance recorded in DynamoDB for event '{active_event_id}'.")
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

        # add an event listener to break the loop if the user presses the "q" key
       # if cv2.waitKey(1) & 0xFF == ord("q"):
            #break

    # release the webcam and destroy all windows
    cap.release()
    # cv2.destroyAllWindows()


if __name__ == "__main__":
    run_live_face_verification()


