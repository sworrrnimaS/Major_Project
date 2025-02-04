#pip -q install langchain huggingface_hub transformers sentence_transformers accelerate bitsandbytes
#!pip install langchain_community

import os
from langchain import PromptTemplate, HuggingFaceHub, LLMChain
from langchain_huggingface import *

os.environ['HUGGINGFACEHUB_API_TOKEN'] = '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'


def generate_summary(summary:str)->str:
    # Define the system message
    system_prompt = "You are an AI assistant that specializes in summarization. Given detailed banking information, generate a concise summary that retains the key points."
    # Create the prompt template
    prompt = PromptTemplate(
        input_variables=["user_input"],
        template=f"{system_prompt}\n\nUser: {{user_input}}\nAI:"
    )

    template = """Question: {question}

    Answer: Let's think step by step."""

    prompt = PromptTemplate(template=template, input_variables=["question"])

    llm_chain = LLMChain(
        prompt=prompt,
        llm=HuggingFaceEndpoint(
            repo_id="google/flan-t5-large",
            temperature=0.3,  
            model_kwargs={"max_length": 64},
            task="text-generation"
        )
    )


    question = f"""What was I talking about in this text? Summarize the key points concisely: {summary}"""

    return llm_chain.run(question)

