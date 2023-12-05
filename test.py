import requests
import json

url = "http://localhost:8000/question-stream"

response = requests.get(url, headers={"Connection": "keep-alive"}, stream=True)

if response.status_code == 200:
    for chunk in response.iter_content(chunk_size=10):
        if chunk:
            # Assuming the content is JSON
            try:
                print(chunk.decode("utf-8"))
            except json.JSONDecodeError as e:
                print(
                    f"Error decoding JSON: {e}. Chunk content: {chunk.decode('utf-8')}"
                )
else:
    print(f"Failed to connect. Status code: {response.status_code}")
