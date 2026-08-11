import asyncio
import json



event_queue = asyncio.Queue()


async def event_notifier():
    while True:
        event_data = await event_queue.get()

        yield f"data: {json.dumps(event_data)}\n\n"