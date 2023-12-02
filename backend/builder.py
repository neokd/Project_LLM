from langchain.document_loaders import UnstructuredFileLoader

loader = UnstructuredFileLoader("./Source/demo.pdf")

docs = loader.load()

docs[0].page_content[:400]
print(docs[0].page_content[:4000])
