from typing import Optional, List, Dict, Any, Union
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
import queue
from langchain.schema import LLMResult

class ThreadedGenerator:
    def __init__(self):
        self.queue = queue.Queue()

    def __iter__(self):
        return self

    def __next__(self):
        item = self.queue.get()
        if item is StopIteration:
            raise item
        return item

    def send(self, data):
        self.queue.put(data)

    def close(self):
        self.queue.put(StopIteration)


class ChainStreamHandler(StreamingStdOutCallbackHandler):
    def __init__(self):
        super().__init__()
        # self.gen = gen

    def on_llm_start(self, serialized: Dict[str, Any], prompts: List[str], **kwargs: Any) -> None:
        self.gen = ThreadedGenerator()

    def on_llm_new_token(self, token: str, **kwargs):
        self.gen.send(token)

    def on_llm_end(self, response: LLMResult, **kwargs: Any) -> None:
        return super().on_llm_end(response, **kwargs)

    
