import requests
import json
from summarization import summarize_responses
from summary_llm import generate_summary
from split_sentences import split_response_text_and_generate_summary
import sys

try:
   if len(sys.argv) > 1:
        answers_paragraph = sys.argv[1]

        # print(answers_paragraph)
        summary = summarize_responses(answers_paragraph)
        # print("\n\n\n\n\n\n\nsummary:",summary)

        response=split_response_text_and_generate_summary(answers_paragraph)
        print(f"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nGenerated Summary Response:{response}")

except Exception as e:
    print(json.dumps({"status":"error",
    "message":"Error during long term summary generation"
    }))
        