import io
import cv2
import numpy as np
from PIL import Image
from deepface import DeepFace

from floci_backend.s3_config import s3
from floci_backend.config.floci_config import BUCKET_NAME

known_faces = {}  

# function to load reference faces from s3 bucket 
def load_s3_reference_faces():

    # init response to list objects in the bucket with the prefix "faces/"
    response = s3.list_objects_v2(Bucket=BUCKET_NAME, Prefix="faces/")

    # iterate through the objects in the response
    for obj in response.get("Contents", []):

        # get the key of the object
        key = obj["Key"]

        # check if the key ends with a valid image extension
        if key.lower().endswith((".jpg", ".jpeg", ".png")):

            # if it is a valid image, extract the person's name from the key
            person_name = key.split("/")[-1].split(".")[0]

            # get the object from s3 and read its bytes
            s3_file = s3.get_object(Bucket=BUCKET_NAME, Key=key)

            # read the bytes and convert to a PIL image
            file_bytes = s3_file["Body"].read()

            # turn it into a PIL image and convert to RGB
            image = Image.open(io.BytesIO(file_bytes)).convert("RGB")

            
            # Ensure array is C-contiguous in memory for DeepFace

            # Convert the PIL image to a NumPy array and then to a contiguous array
            rgb_image = np.ascontiguousarray(np.array(image))

            # store the reference face in the known_faces dictionary
            known_faces[person_name] = rgb_image

            # log the loaded reference face for debugging
            print(f"Loaded reference face for '{person_name}' from S3 path: s3://{BUCKET_NAME}/{key}")


# function to run live face verification using webcam
def run_live_face_verification():

    # get the reference faces from s3 bucket
    load_s3_reference_faces()

    # if the reference faces dictionary is empty, log a message and return
    if not known_faces:
        print("No reference faces found in S3. Please upload reference images first.")
        return

    # init the webcam capture
    cap = cv2.VideoCapture(0)

    # if camera is not opened, log an error message and return
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return

    # log a message to indicate that live face verification has started
    print("Starting live face verification. Press 'q' to quit.")

    # init the frame count as we are doing 5 frame per second verification to reduce processing load
    frame_count = 0
    current_status = "Scanning..."
    status_color = (0, 0, 255)  # Red (BGR)

    # while true , read the frame from the webcam
    while True:

        # read a frame from the webcam
        ret, frame = cap.read()

        # if the frame is not read successfully, break the loop
        if not ret:
            break

        # increment the frame count
        frame_count += 1

        # Run verification every 5 frames
        if frame_count % 5 == 0:
            # Convert frame to RGB and ensure contiguous memory block
            # this can reduce the processing load and improve performance, reduce cpu usage
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            rgb_frame = np.ascontiguousarray(rgb_frame)

            # init the match found flag to false 
            match_found = False

            # for each person name and reference face in the known faces dictionary, verify the face in the current frame
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

                    # if the result if verified and matches ,
                    # set the match found flag to true
                    # update the current status to "Match Found" and 
                    # set the status color to green
                    if result.get("verified"):
                        match_found = True
                        current_status = f"Match Found: {person_name}"
                        status_color = (0, 255, 0)  # Green (BGR)
                        break


                # if there is a value error , set the current status to "No Face Detected" and set the status color to orange
                except ValueError:
                    # Occurs when enforce_detection=False still fails to extract features
                    current_status = "No Face Detected"
                    status_color = (0, 165, 255)  # Orange
                    continue

                # if there is any other exception , log the error and continue to the next reference face
                except Exception as e:
                    print(f"Error during verification for '{person_name}' ({type(e).__name__}): {e}")
                    continue

            # if no match is found and the current status is not "No Face Detected", 
            # update the current status to "No Match Found" and set the status color to red
            if not match_found and current_status != "No Face Detected":
                current_status = "No Match Found"
                status_color = (0, 0, 255)  # Red (BGR)

        # Draw status text on the display frame
        cv2.putText(
            frame,
            current_status,
            (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            status_color,
            2
        )


        # display the frame in a window named "Live Face Verification"
        cv2.imshow("Live Face Verification", frame)

        # add en event listener to break the loop if the user presses the "q" key
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    # release the webcam and destroy all windows
    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    run_live_face_verification()