import os
import time
import chromadb
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from vector_builder.folder_structure import folder_structure_class
from vector_builder.db_ingest import content_loader_class
from vector_builder.detect_changes import detect_changes_class
from langchain.text_splitter import RecursiveCharacterTextSplitter
from config import (SOURCE_DIRECTORY,STRUCTURE_DIRECTORY,PERSIST_DIRECTORY)

def create_json_structure(folder_structure_object):
    folder_structure=folder_structure_object.create_folder_structure_json(SOURCE_DIRECTORY)
    folder_structure_object.write_json_file(folder_structure,STRUCTURE_DIRECTORY)
    folder_json_data=folder_structure_object.read_json_file(STRUCTURE_DIRECTORY)
    subfolders, files_paths = folder_structure_object.extract_subfolder_and_files(folder_json_data[root_directory])

    vector_db_files_creation(content_loader_object,subfolders,files_paths)
    print("Json structure is created with necessary files")
    return None

def update_json_structure(content_loader_object):
    class MyHandler(FileSystemEventHandler):
        def __init__(self, stop_flag):
            super().__init__()
            self.stop_observer_flag = stop_flag

        def on_created(self, event):
            if event.is_directory:
                folder = os.path.basename(os.path.normpath(event.src_path))
                print(f"{folder} creation is detected !!!")
                folder=[folder]
                vector_db_collection_creation(folder)
            else:
                file= event.src_path
                directory = os.path.dirname(file)
                folder = os.path.basename(os.path.normpath(directory))
                file=[file]
                lst=[folder,file]
                lst=dict([lst])
                folder=[folder]
                vector_db_files_creation(content_loader_object,folder,lst)
            self.stop_observer_flag[0] = True

        def on_deleted(self, event):
            if event.is_directory:
                folder = os.path.basename(os.path.normpath(event.src_path))
                print(f"{folder} deletion is detected !!!")
                folder=[folder]
                vector_db_deletion(folder)
            self.stop_observer_flag[0] = True

    stop_observer_flag = [False]

    event_handler = MyHandler(stop_observer_flag)
    observer = Observer()
    observer.schedule(event_handler, SOURCE_DIRECTORY, recursive=True)
    print(f"Monitoring changes in: {SOURCE_DIRECTORY}")
    observer.start()

    try:
        while not stop_observer_flag[0]:
            pass
    except KeyboardInterrupt:
        print("Manually stopped !!!")

    observer.stop()
    observer.join()
     

def vector_db_collection_creation(subfolders):
    client = chromadb.PersistentClient(path=PERSIST_DIRECTORY)
    for subfolder in subfolders:
            client.get_or_create_collection(name=subfolder)
            print(f'{subfolder} collection is created !!!')


def vector_db_files_creation(content_loader_object,subfolders,files_paths):
    client = chromadb.PersistentClient(path=PERSIST_DIRECTORY)
    for subfolder in subfolders:
            main_content_only=[]
            metadata_main_content=[]
            document_contents = content_loader_object.load_documents(files_paths[subfolder])
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
            texts = text_splitter.split_documents(document_contents)

            main_content_only=[text.page_content for text in texts]
            metadata_main_content=[text.metadata for text in texts]

            collection = client.get_or_create_collection(subfolder)

            existing_collection_length = len(collection.get()['ids'])

            collection.add(
                            documents=main_content_only,
                            metadatas=metadata_main_content,
                            ids=['id'+str(i) for i in range((existing_collection_length+1),(len(main_content_only)+existing_collection_length+1))]
                        )
            print("Document added to vector DB !!!")
        
def vector_db_deletion(subfolders):
    client = chromadb.PersistentClient(path=PERSIST_DIRECTORY)
    for subfolder in subfolders:
        client.delete_collection(name=subfolder)
        print(f'{subfolder} collection has been deleted !!!')

if __name__ == "__main__":
    folder_structure_object = folder_structure_class()
    content_loader_object = content_loader_class()
    detect_changes_object = detect_changes_class()
    root_directory = os.path.basename(os.path.normpath(SOURCE_DIRECTORY))

    if os.path.exists(STRUCTURE_DIRECTORY):
        update_json_structure(content_loader_object)
    else:
        create_json_structure(folder_structure_object)
