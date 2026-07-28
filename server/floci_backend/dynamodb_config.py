from config.floci_config import dynamodb



# put the table names and columns in a list to create the table in dynamodb
tables_to_create = [
    {
        "TableName": "my-bucket-table",
        "KeySchema": [
            {"AttributeName": "id", "KeyType": "HASH"},
            {"AttributeName": "name", "KeyType": "RANGE"}
        ],
        "AttributeDefinitions": [
            {"AttributeName": "id", "AttributeType": "S"},
            {"AttributeName": "name", "AttributeType": "S"}
        ],
        "BillingMode": "PAY_PER_REQUEST"
    },
    {
        "TableName": "events_data",
        "KeySchema": [
            {"AttributeName": "id", "KeyType": "HASH"},
            {"AttributeName": "event_name", "KeyType": "RANGE"}
        ],
        # Only include attributes used in KeySchema here
        "AttributeDefinitions": [
            {"AttributeName": "id", "AttributeType": "S"},
            {"AttributeName": "event_name", "AttributeType": "S"}
        ],
        "BillingMode": "PAY_PER_REQUEST"
    }
]

# iteratively create the tables in dynamodb using the list of table names and columns
for table_config in tables_to_create:
    try:
        response = dynamodb.create_table(**table_config)
        print("Table created:", response["TableDescription"]["TableName"])
    except dynamodb.exceptions.ResourceInUseException:
        print(f"Table '{table_config['TableName']}' already exists!")

# List all tables in DynamoDB
tables = dynamodb.list_tables()
print("All tables in Floci:", tables["TableNames"])