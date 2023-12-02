from fastapi import FastAPI, status

app = FastAPI()

@app.get("/api/test")
def test():
    return {
        "message": "LLM Test API",
        "status": status.HTTP_200_OK
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, reload=True)