import cv2
from ultralytics import YOLO

# load the yolo model
# we chose yolo11n.pt because it is the smallest model and can run on CPU
# it can detect 80 classes of objects, including people, cars, and animals
# the bigger the model the more accurate it is, but it also requires more computational resources
model = YOLO("yolo11n.pt") 

# use a sample image to test the model
image_path = "man.jpg"

# log to init the process
print("Running inference on image:", image_path)

# run inference on the image
# inference is a process of using a trained model to make predictions on new data
results = model(image_path)

# log the results based on the detected boxes, class names, and confidence scores
for result in results:
    boxes = result.boxes # get the detected boxes
    print("detected boxes:", boxes)  #print the detected boxes

     # log the class names and confidence scores for each detected box
    for box in boxes: 
        cls_id = int(box.cls[0]) # get the class id of the detected box
        class_name = model.names[cls_id] # get the class name of the detected box
        confidence = box.conf[0] # get the confidence score of the detected box

        print (f"Class: {class_name}, Confidence: {confidence:.2f}") # print the class name and confidence score of the detected box

# log the annotated image with the detected boxes, class names, and confidence scores
annotated_image = results[0].plot() 

# display the annotated image with the detected boxes, class names, and confidence scores
cv2.imshow("Annotated Image", annotated_image)

# wait for a key press to close the window
cv2.waitKey(0)

# destroy all windows
cv2.destroyAllWindows()



