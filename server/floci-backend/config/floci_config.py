import boto3

s3 = boto3.client(
    "s3",
    endpoint_url="http://localhost:4566",
    aws_access_key_id="floci",
    aws_secret_access_key="floci",
    region_name="us-east-1",
)


