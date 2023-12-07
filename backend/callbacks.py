from typing import Coroutine, Optional, List, Dict, Any, Union
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
import queue
from langchain.schema import LLMResult

from langchain.callbacks.streaming_aiter import AsyncIteratorCallbackHandler

import asyncio
class ThreadedGenerator:
    def __init__(self):
        self.queue = asyncio.Queue()

    async def __aiter__(self):
        return self

    async def __anext__(self):
        item = await self.queue.get()
        if item is StopIteration:
            raise StopAsyncIteration
        return item

    def send(self, data):
        asyncio.create_task(self.queue.put(data))

    def close(self):
        asyncio.create_task(self.queue.put(StopIteration))

class CustomCallback(AsyncIteratorCallbackHandler):
    def __init__(self):
        super().__init__()
        self.gen = ThreadedGenerator()


    async def on_llm_new_token(self, token: str, **kwargs: Any) -> Coroutine[Any, Any, None]:
        self.gen.send(token)

    async def on_llm_end(self, response: LLMResult, **kwargs: Any) -> Coroutine[Any, Any, None]:
        self.gen.close()

        
    
