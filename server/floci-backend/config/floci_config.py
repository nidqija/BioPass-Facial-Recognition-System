import boto3

s3 = boto3.client(
    "s3",
    endpoint_url="http://localhost:4566",
    aws_access_key_id="floci",
    aws_secret_access_key="floci",
    region_name="us-east-1",
)


dynamodb = boto3.client(
    "dynamodb",
     endpoint_url="http://localhost:4566",
    aws_access_key_id="floci",
    aws_secret_access_key="floci",
    region_name="us-east-1",
)

FLOCI_URL = "http://localhost:4566"
BUCKET_NAME = "my-app-bucket"
TABLE_NAME = "my-bucket-table"


