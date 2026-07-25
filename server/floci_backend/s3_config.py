from .config.floci_config import s3

# create an s3 bucket to upload the file
s3.create_bucket(Bucket="my-app-bucket")

# put an object in the bucket , in this example , it is a text file with the content "Hello, World!"
s3.put_object(
    Bucket="my-app-bucket", Key="test.txt", Body="Hello, World!"
    )

# init the response from the bucket my-app-bucket
response = s3.list_objects_v2(Bucket="my-app-bucket")

# for each object in the response , print the key of the object
for obj in response.get("Contents", []):
    print("The key is:", obj["Key"])

