import re
from summary_llm import generate_summary

def split_response_text_and_generate_summary(text, max_len=300):
    sentences = re.split(r'(?<=\.)\s+', text)  # Split by sentences based on periods followed by space
    result = []
    current_sentence = ""

    for sentence in sentences:
        # Add the sentence if it doesn't exceed the max length, or start a new chunk
        if len(current_sentence + sentence) <= max_len:
            current_sentence += sentence + " "
        else:
            result.append(current_sentence.strip())
            current_sentence = sentence + " "
    if current_sentence:  # Append any remaining part
        result.append(current_sentence.strip())
    
    sentences = result

    response = " ".join([generate_summary(singlesentence) for singlesentence in sentences ])

    return response


