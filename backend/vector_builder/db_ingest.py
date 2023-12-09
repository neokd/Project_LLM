import os
import logging
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor, as_completed
from config import DOCUMENT_MAP, INGEST_THREADS


class content_loader_class:
    @staticmethod
    def load_single_document(file_path):
        try:
            file_extension = os.path.splitext(file_path)[1]
            print("file extension : ",file_extension)
            loader_class = DOCUMENT_MAP.get(file_extension)
            print("loader class : ",loader_class)
            if loader_class:
                loader = loader_class(file_path)
            else:
                raise ValueError("Document type is undefined")
            return loader.load()[0]
        except Exception:
            return None

    @staticmethod
    def load_document_batch(filepaths):
        logging.info("Loading document batch")
        with ThreadPoolExecutor(len(filepaths)) as exe:
            futures = [exe.submit(content_loader_class.load_single_document, name) for name in filepaths]
            if futures is None:
                return None
            else:
                data_list = [future.result() for future in futures]
                return data_list, filepaths

    @staticmethod
    def load_documents(filepaths_list):
        n_workers = min(INGEST_THREADS, max(len(filepaths_list), 1))
        chunksize = round(len(filepaths_list) / n_workers)
        docs = []
        with ProcessPoolExecutor(n_workers) as executor:
            futures = []
            for i in range(0, len(filepaths_list), chunksize):
                filepaths = filepaths_list[i: (i + chunksize)]
                try:
                    future = executor.submit(content_loader_class.load_document_batch, filepaths)
                except Exception:
                    future = None
                if future is not None:
                    futures.append(future)
            for future in as_completed(futures):
                try:
                    contents, _ = future.result()
                    docs.extend(contents)
                except Exception:
                    pass
        return docs


# if __name__ == "__main__":
#     loader = content_loader_class()
#     filepath = [
#                 "/home/gladwin/Desktop/Project_LLM/backend/source/user2/about2.txt",
#                 "/home/gladwin/Desktop/Project_LLM/backend/source/user2/history.txt"
#             ]
#     docs = loader.load_documents(filepath)
#     print("docs : ", docs)
