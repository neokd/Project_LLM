import asyncio
from typing import Any
from enum import Enum
import pydantic
from sse_starlette.sse import ServerSentEvent as ServerSentEvent
from sse_starlette.sse import ensure_bytes as ensure_bytes
from langchain.callbacks.base import AsyncCallbackHandler
from langchain.globals import get_llm_cache
from pydantic import BaseModel
from typing import Optional
from starlette.types import Message, Send
from fastapi import status
from sse_starlette.sse import EventSourceResponse , ServerSentEvent , ensure_bytes
from functools import partial
from langchain.chains.base import Chain
from langchain.schema.document import Document


class Events(str, Enum):
    COMPLETION = "completion"
    ERROR = "error"
    END = "end"

class TokenStreamMode(str, Enum):
    TEXT = "text"
    JSON = "json"

class TokenEventData(BaseModel):
    token: str = ""


def model_dump_json(model: pydantic.BaseModel, **kwargs) -> str:
    """Dumps a pydantic model to JSON."""
    PYDANTIC_V2 = pydantic.VERSION.startswith("2.")
    if PYDANTIC_V2:
        return model.model_dump_json(**kwargs)
    else:
        return model.json(**kwargs)


def get_token_data(token: str, mode: TokenStreamMode) -> str:
    """Get token data based on mode.
    Args:
        token: The token to use.
        mode: The stream mode.
    """
    if mode not in list(TokenStreamMode):
        raise ValueError(f"Invalid stream mode: {mode}")

    if mode == TokenStreamMode.TEXT:
        return token
    else:
        return model_dump_json(TokenEventData(token=token))
    

class CallbackHandler(AsyncCallbackHandler):
    """Base callback handler for  applications."""

    def __init__(self, **kwargs: dict[str, Any]) -> None:
        super().__init__(**kwargs)
        self.llm_cache_used = get_llm_cache() is not None

    @property
    def always_verbose(self) -> bool:
        return False


class StreamingCallbackHandler(CallbackHandler):
    """Callback handler for streaming responses."""

    def __init__(
        self,
        *,
        send: Send = None,
        **kwargs: dict[str, Any],
    ) -> None:
        super().__init__(**kwargs)

        self._send = send
        self.streaming = None

    @property
    def send(self) -> Send:
        return self._send

    @send.setter
    def send(self, value: Send) -> None:
        """Setter method for send property."""
        if not callable(value):
            raise ValueError("value must be a Callable")
        self._send = value

    def _construct_message(self, data: str, event: Optional[str] = None) -> Message:
        """Constructs message payload."""
        chunk = ServerSentEvent(data=data, event=event)
        return {
            "type": "http.response.body",
            "body": ensure_bytes(chunk, None),
            "more_body": True,
        }


class _TokenStreamingCallbackHandler(StreamingCallbackHandler):
    """Callback handler for streaming tokens."""

    def __init__(
        self,
        *,
        output_key: str,
        mode: TokenStreamMode = TokenStreamMode.JSON,
        **kwargs: dict[str, Any],
    ) -> None:
        """Constructor method.

        Args:
            output_key: chain output key.
            mode: The stream mode.
            **kwargs: Keyword arguments to pass to the parent constructor.
        """
        super().__init__(**kwargs)

        self.output_key = output_key

        if mode not in list(TokenStreamMode):
            raise ValueError(f"Invalid stream mode: {mode}")
        self.mode = mode

    async def on_chain_start(self, *args: Any, **kwargs: dict[str, Any]) -> None:
        """Run when chain starts running."""
        self.streaming = False

    async def on_llm_new_token(self, token: str, **kwargs: dict[str, Any]) -> None:
        """Run on new LLM token. Only available when streaming is enabled."""
        if not self.streaming:
            self.streaming = True

        if self.llm_cache_used:  # cache missed (or was never enabled) if we are here
            self.llm_cache_used = False

        message = self._construct_message(
            data=get_token_data(token, self.mode), event=Events.COMPLETION
        )
        await self.send(message)

    async def on_chain_end(
        self, outputs: dict[str, Any], **kwargs: dict[str, Any]
    ) -> None:
        """Run when chain ends running.

        Final output is streamed only if LLM cache is enabled.
        """
        if self.llm_cache_used or not self.streaming:
            if self.output_key in outputs:
                message = self._construct_message(
                    data=get_token_data(outputs[self.output_key], self.mode),
                    event=Events.COMPLETION,
                )
                await self.send(message)
            else:
                raise KeyError(f"missing outputs key: {self.output_key}")
               

class TokenStreamingCallbackHandler(_TokenStreamingCallbackHandler):
    async def on_llm_new_token(self, token: str, **kwargs: dict[str, Any]) -> None:
        """Run on new LLM token. Only available when streaming is enabled."""
        if not self.streaming:
            self.streaming = True

        if self.llm_cache_used:  # cache missed (or was never enabled) if we are here
            self.llm_cache_used = False

        message = self._construct_message(
            data=get_token_data(token, self.mode), event=Events.COMPLETION
        )
        task = asyncio.create_task(self._send(message))
        await task


class HTTPStatusDetail(str, Enum):
    INTERNAL_SERVER_ERROR = "Internal Server Error"


class _StreamingResponse(EventSourceResponse):

    def __init__(
        self,
        content: Any = iter(()),
        *args: Any,
        **kwargs: dict[str, Any],
    ) -> None:
        """Constructor method.

        Args:
            content: The content to stream.
        """
        super().__init__(content=content, *args, **kwargs)

    async def stream_response(self, send: Send) -> None:
        """Streams data chunks to client by iterating over `content`.

        If an exception occurs while iterating over `content`, an
        internal server error is sent to the client.

        Args:
            send: The send function from the ASGI framework.
        """
        await send(
            {
                "type": "http.response.start",
                "status": self.status_code,
                "headers": self.raw_headers,
            }
        )

        try:
            async for data in self.body_iterator:
                chunk = ensure_bytes(data, self.sep)
                await send(
                    {"type": "http.response.body", "body": chunk, "more_body": True}
                )
        except Exception as e:
            chunk = ServerSentEvent(
                data=dict(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=HTTPStatusDetail.INTERNAL_SERVER_ERROR,
                ),
                event=Events.ERROR,
            )
            await send(
                {
                    "type": "http.response.body",
                    "body": ensure_bytes(chunk, None),
                    "more_body": True,
                }
            )

        await send({"type": "http.response.body", "body": b"", "more_body": False})


class StreamingResponse(_StreamingResponse):
    """StreamingResponse class for LangChain resources."""

    def __init__(
        self,
        chain: Chain,
        config: dict[str, Any],
        *args: Any,
        **kwargs: dict[str, Any],
    ) -> None:
        """Constructor method.

        Args:
            chain: A LangChain instance.
            config: A config dict.
            *args: Positional arguments to pass to the parent constructor.
            **kwargs: Keyword arguments to pass to the parent constructor.
        """
        super().__init__(*args, **kwargs)

        self.chain = chain
        self.config = config

    async def stream_response(self, send: Send) -> None:
        """Stream LangChain outputs.

        If an exception occurs while iterating over the LangChain, an
        internal server error is sent to the client.

        Args:
            send: The ASGI send callable.
        """
        await send(
            {
                "type": "http.response.start",
                "status": self.status_code,
                "headers": self.raw_headers,
            }
        )

        if "callbacks" in self.config:
            for callback in self.config["callbacks"]:
                if hasattr(callback, "send"):
                    callback.send = send

        try:
            loop = asyncio.get_event_loop()
            outputs = await loop.run_in_executor(
                None, partial(self.chain, **self.config)
            )
            if self.background is not None:
                self.background.kwargs.update({"outputs": outputs})
        except Exception as e:
            if self.background is not None:
                self.background.kwargs.update({"outputs": {}, "error": e})
            chunk = ServerSentEvent(
                data=dict(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=HTTPStatusDetail.INTERNAL_SERVER_ERROR,
                ),
                event=Events.ERROR,
            )
            await send(
                {
                    "type": "http.response.body",
                    "body": ensure_bytes(chunk, None),
                    "more_body": True,
                }
            )

        await send({"type": "http.response.body", "body": b"", "more_body": False})


def model_dump(model: pydantic.BaseModel, **kwargs) -> dict[str, Any]:
    """Dump a pydantic model to a dictionary.

    Args:
        model: A pydantic model.
    """
    PYDANTIC_V2= pydantic.VERSION.startswith("2.")
    if PYDANTIC_V2:
        return model.model_dump(**kwargs)
    else:
        return model.dict(**kwargs)


class LangchainEvents(str, Enum):
    SOURCE_DOCUMENTS = "source_documents"

class SourceDocumentsEventData(BaseModel):
    """Event data payload for source documents."""

    source_documents: list[dict[str, Any]]


class SourceDocumentsStreamingCallbackHandler(StreamingCallbackHandler):
    """Callback handler for streaming source documents."""

    async def on_chain_end(
        self, outputs: dict[str, Any], **kwargs: dict[str, Any]
    ) -> None:
        """Run when chain ends running."""
        if "source_documents" in outputs:
            if not isinstance(outputs["source_documents"], list):
                raise ValueError("source_documents must be a list")
            if not isinstance(outputs["source_documents"][0], Document):
                raise ValueError("source_documents must be a list of Document")

            # NOTE: langchain is using pydantic_v1 for `Document`
            source_documents: list[dict] = [
                document.dict() for document in outputs["source_documents"]
            ]
            message = self._construct_message(
                data=model_dump_json(
                    SourceDocumentsEventData(source_documents=source_documents)
                ),
                event=LangchainEvents.SOURCE_DOCUMENTS,
            )
            await self.send(message)
