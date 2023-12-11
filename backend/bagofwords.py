import re

def remove_short_words(filename):
    # Open the file in read mode
    with open(filename, "r") as f:
        # Read the entire text file
        text = f.read()

    # Regular expression to match words with two or fewer letters, including optional punctuation
    pattern = r"\b\w{1,2}(?:[.,;!?]*)\b"

    # Replace matched words with an empty string
    cleaned_text = re.sub(pattern, "", text)

    # Filter out empty lines
    cleaned_lines = filter(None, cleaned_text.splitlines())

    # Join the lines into a single string
    cleaned_text_no_empty_lines = '\n'.join(cleaned_lines)

    # Open the file in write mode
    
    with open(filename, "w") as f:
        # Write the cleaned text back to the file without empty lines
        f.write(cleaned_text_no_empty_lines)

# Specify the filename
filename = "bagofwords.txt"

# Remove short words from the text file and write the result back to the same file without empty lines
remove_short_words(filename)