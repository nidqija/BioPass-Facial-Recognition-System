import boto3

# config for s3 client storage bucket
s3 = boto3.client(
    "s3",
    endpoint_url="http://localhost:4566",
    aws_access_key_id="floci",
    aws_secret_access_key="floci",
    region_name="us-east-1",
)

# config for dynamodb client storage table
dynamodb = boto3.client(
    "dynamodb",
     endpoint_url="http://localhost:4566",
    aws_access_key_id="floci",
    aws_secret_access_key="floci",
    region_name="us-east-1",
)

# config for floci url , bucket name and table name
FLOCI_URL = "http://localhost:4566"
BUCKET_NAME = "my-app-bucket"
TABLE_NAME = "my-bucket-table"


