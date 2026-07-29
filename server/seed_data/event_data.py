import sys
from pathlib import Path

# Adds the parent directory ('server') to Python's module search path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from floci_backend.dynamodb_config import dynamodb

events = [
    {
        "id": {"S": "BP-2607-0842"},
        "artist": {"S": "Midnight Static"},
        "genre": {"S": "Indie / Synthwave"},
        "venue": {"S": "The Grand Hall"},
        "city": {"S": "Main Stage"},
        "date": {"S": "SAT · SEP 12, 2026"},
        "doorsOpen": {"S": "7:00 PM"},
        "price": {"S": "$65.00"},
        "tier": {"S": "GA Fast-Pass"},
        "status": {"S": "Selling Fast"},
        "accentColor": {"S": "#D97706"},
    },
    {
        "id": {"S": "BP-2607-0843"},
        "artist": {"S": "Neon Echoes"},
        "genre": {"S": "Electronic / Cyberpunk"},
        "venue": {"S": "The Warehouse Arena"},
        "city": {"S": "Docklands District"},
        "date": {"S": "FRI · SEP 18, 2026"},
        "doorsOpen": {"S": "8:30 PM"},
        "price": {"S": "$55.00"},
        "tier": {"S": "General Admission"},
        "status": {"S": "Available"},
        "accentColor": {"S": "#059669"},
    },
    {
        "id": {"S": "BP-2607-0844"},
        "artist": {"S": "Velvet Horizons"},
        "genre": {"S": "Alternative Rock"},
        "venue": {"S": "Starlight Amphitheater"},
        "city": {"S": "Skyline Park"},
        "date": {"S": "SAT · OCT 03, 2026"},
        "doorsOpen": {"S": "6:30 PM"},
        "price": {"S": "$80.00"},
        "tier": {"S": "VIP Express"},
        "status": {"S": "Available"},
        "accentColor": {"S": "#3B82F6"},
    },
    {
        "id": {"S": "BP-2607-0845"},
        "artist": {"S": "Acoustic Reverie"},
        "genre": {"S": "Folk / Unplugged"},
        "venue": {"S": "The Underground Club"},
        "city": {"S": "Downtown Vault"},
        "date": {"S": "THU · OCT 15, 2026"},
        "doorsOpen": {"S": "7:30 PM"},
        "price": {"S": "$45.00"},
        "tier": {"S": "General Admission"},
        "status": {"S": "Available"},
        "accentColor": {"S": "#8B5CF6"},
    },
]

# Loop to insert each item individually
for item in events:
    dynamodb.put_item(
        TableName="events_data",
        Item=item
    )