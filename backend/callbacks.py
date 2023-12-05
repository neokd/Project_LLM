from typing import Any, Dict, List, Optional, Union
from uuid import UUID

from langchain.callbacks.base import AsyncCallbackHandler, BaseCallbackHandler
from langchain.schema.output import ChatGenerationChunk, GenerationChunk, LLMResult

# from schemas import ChatResponse


# class StreamingLLMCallbackHandler(AsyncCallbackHandler):
#     """Callback handler for streaming LLM responses."""

#     def __init__(self, websocket):
#         self.websocket = websocket

#     async def on_llm_new_token(self, token: str, **kwargs: Any) -> None:
#         try:
#             resp = ChatResponse(sender="bot", message=token, type="stream")
#             await self.websocket.send_json(resp.dict())
#         except Exception as e:
#             print(f"Error in on_llm_new_token: {e}")


# class QuestionGenCallbackHandler(AsyncCallbackHandler):
#     """Callback handler for question generation."""

#     def __init__(self, websocket):
#         self.websocket = websocket

#     async def on_llm_start(
#         self, serialized: Dict[str, Any], prompts: List[str], **kwargs: Any
#     ) -> None:
#         try:
#             resp = ChatResponse(
#                 sender="bot", message="Synthesizing question...", type="info"
#             )
#             await self.websocket.send_json(resp.dict())
#         except Exception as e:
#             print(f"Error in on_llm_start: {e}")


import asyncio
from typing import AsyncGenerator
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

from queue import Queue
import queue
import sys

q = queue.Queue()
stop_item = "###finish###"


class MyCustomHandler(StreamingStdOutCallbackHandler):
    def on_llm_start(
        self, serialized: dict[str, any], prompts: list[str], **kwargs: any
    ) -> None:
        """Run when LLM starts running."""
        with q.mutex:
            q.queue.clear()

    def on_llm_new_token(self, token: str, **kwargs: any) -> None:
        """Run on new LLM token. Only available when streaming is enabled."""
        sys.stdout.write(token)
        sys.stdout.flush()
        q.put(token)
