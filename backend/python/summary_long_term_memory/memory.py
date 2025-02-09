# import requests
# import json
# from summarization import summarize_responses
# from summary_llm import generate_summary
# from split_sentences import split_response_text_and_generate_summary
# import sys

# try:
#    if len(sys.argv) > 1:
#         answers_paragraph = sys.argv[1]

#         # print(answers_paragraph)
#         summary = summarize_responses(answers_paragraph)
#         # print("\n\n\n\n\n\n\nsummary:",summary)

#         # response=split_response_text_and_generate_summary(answers_paragraph)
#         # print(f"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nGenerated Summary Response:{response}")

# except Exception as e:
#     print(json.dumps({"status":"error",
#     "message":"Error during long term summary generation"
#     }))
     

import sys
import os
import json

# Add the parent directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ollama_integration import OllamaIntegration, ModelParameters


def main():
    try:
        if len(sys.argv) > 1:
            answers_paragraph = sys.argv[1]
            
            # Initialize Ollama integration
            ollama = OllamaIntegration()
            
            # Generate summary prompt using answers_paragraph as context
            summary_prompt = ollama.generate_summary_prompt(
                context=[answers_paragraph],  # Pass as a list since function expects List[str]
                summary_type="general",
                max_length=50
            )

            # print("Prompt Generated:", summary_prompt)  # Debugging
            
            # Get the response using ask_model
            model_response = ollama.ask_model(summary_prompt)
            
            # Store the response text
            response = model_response.text
            
            # print(json.dumps({
            #     "status": "success",
            #     "response": response
            # }))

            print(f"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nGenerated Summary Response:{response}")
                
    except Exception as e:
        print(json.dumps({
            "status": "error",
            "message": "Error during text processing"
        }))

if __name__ == "__main__":
    main()