from config.floci_config import dynamodb

try:
    response = dynamodb.create_table(
        TableName="my-bucket-table",
        KeySchema=[
            {"AttributeName": "id", "KeyType": "HASH"},  # Partition key
            {"AttributeName": "name", "KeyType": "RANGE"},  # Sort key
        ],
        # Required by DynamoDB for any key in KeySchema
        AttributeDefinitions=[
            {"AttributeName": "id", "AttributeType": "S"},  # 'S' = String
            {"AttributeName": "name", "AttributeType": "S"},
        
        ],
        BillingMode="PAY_PER_REQUEST",
    )
    print("Table created:", response["TableDescription"]["TableName"])
except dynamodb.exceptions.ResourceInUseException:
    print("Table already exists!")

# Verify table list directly via Python
tables = dynamodb.list_tables()
print("All tables in Floci:", tables["TableNames"])