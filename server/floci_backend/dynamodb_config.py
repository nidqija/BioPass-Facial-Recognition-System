from .config.floci_config import dynamodb

try:
    response = dynamodb.create_table(
        TableName="my-bucket-table",
        KeySchema=[
            {"AttributeName": "id", "KeyType": "HASH"},  # Partition key for table , we define this as id
            {"AttributeName": "name", "KeyType": "RANGE"},  # we add another attributes which is name
        ],
        # Required by DynamoDB for any key in KeySchema
        AttributeDefinitions=[
            {"AttributeName": "id", "AttributeType": "S"},  # we define the type of the attribute as string , we can also use N for number and B for binary
            {"AttributeName": "name", "AttributeType": "S"},
        
        ],
        BillingMode="PAY_PER_REQUEST", # add billing mode as pay per request , as this is the standard mode for dynamodb , we can also use provisioned mode which is more cost effective for large scale applications
    )

    # log the table name to the console for debugging
    print("Table created:", response["TableDescription"]["TableName"])

    # if table is already created , catch the exception and log to the console
except dynamodb.exceptions.ResourceInUseException:
    print("Table already exists!")

# list all the tables in the dynamodb and log to the console
tables = dynamodb.list_tables()
print("All tables in Floci:", tables["TableNames"])