import sys
from pathlib import Path

# Adds the parent directory ('server') to Python's module search path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from floci_backend.dynamodb_config import dynamodb

events = [
    {
        "id": {"S": "event1"},
        "event_name": {"S": "Sample Event"},
        "date": {"S": "2024-06-01"},
        "location": {"S": "New York"},
        "description": {"S": "This is a sample event for testing purposes."}
    },
    {
        "id": {"S": "event2"},
        "event_name": {"S": "Another Event"},
        "date": {"S": "2024-07-15"},
        "location": {"S": "Los Angeles"},
        "description": {"S": "This is another sample event for testing purposes."}
    }
]

# Loop to insert each item individually
for item in events:
    dynamodb.put_item(
        TableName="events_data",
        Item=item
    )