import requests
import json
import time
import logging
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum
from tenacity import retry, stop_after_attempt, wait_exponential

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ModelParameters:
    def __init__(
        self,
        temperature: float = 0.5,  # Slightly lowered for more focused responses
        top_p: float = 0.9,
        top_k: int = 50,
        repeat_penalty: float = 1.1,
        max_tokens: int = 3000,  # Increased for more comprehensive responses
        presence_penalty: float = 0.1,
        frequency_penalty: float = 0.1,
        stop_sequences: Optional[List[str]] = None,
        context_window: bool = False 
    ):
        self.temperature = temperature
        self.top_p = top_p
        self.top_k = top_k
        self.repeat_penalty = repeat_penalty
        self.max_tokens = max_tokens
        self.presence_penalty = presence_penalty
        self.frequency_penalty = frequency_penalty
        self.stop_sequences = stop_sequences or [],
        self.context_window = context_window

    def to_dict(self) -> Dict[str, Any]:
        return {k: v for k, v in self.__dict__.items() if v is not None}

@dataclass
class ModelResponse:
    text: str
    tokens_used: int
    generation_time: float
    model_name: str
    parameters: Dict[str, Any]

class ResponseFormat(Enum):
    TEXT = "text"
    JSON = "json"
    MARKDOWN = "markdown"

class OllamaIntegration:
    def __init__(
        self, 
        model_name: str = "llama3.2:3b-instruct-q8_0",  # Updated model name
        api_url: str = "http://localhost:11434",
        default_params: Optional[ModelParameters] = None
    ):
        self.model_name = model_name
        self.api_url = api_url.rstrip('/')
        self.default_params = default_params or ModelParameters()
        self._validate_model()

    def load_bank_data(self, filepath: str = 'data/banks.json'):
        """
        Load bank data for direct reference
        
        Args:
            filepath: Path to bank data JSON file
        
        Returns:
            Parsed bank data
        """
        try:
            with open(filepath, 'r', encoding='utf-8') as file:
                return json.load(file)
        except Exception as e:
            logger.error(f"Failed to load bank data: {str(e)}")
            return None

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=4, max=10)
    )
    def _validate_model(self) -> None:
        """Validate that the specified model is available"""
        try:
            response = requests.get(f"{self.api_url}/api/tags")
            if response.status_code == 200:
                available_models = [model['name'] for model in response.json().get('models', [])]
                if self.model_name not in available_models:
                    logger.warning(f"Model {self.model_name} not found in available models: {available_models}")
                    # Optional: Suggest closest match or fallback model
                    closest_match = self._find_closest_model(self.model_name, available_models)
                    if closest_match:
                        logger.info(f"Suggested alternative model: {closest_match}")
        except Exception as e:
            logger.error(f"Error validating model: {str(e)}")

    def _find_closest_model(self, target_model: str, available_models: List[str]) -> Optional[str]:
        """
        Find the closest matching model name
        
        Args:
            target_model: Model name to match
            available_models: List of available models
        
        Returns:
            Closest matching model name or None
        """
        # Simple similarity matching
        def similarity_score(s1: str, s2: str) -> int:
            return sum(c1 == c2 for c1, c2 in zip(s1, s2))
        
        return max(available_models, key=lambda x: similarity_score(target_model, x)) if available_models else None

    def _process_context(self, context: List[str]) -> List[str]:
        """
        Process and enhance context for better model understanding
        
        Args:
            context: List of context strings or JSON-like strings
        
        Returns:
            List of processed context strings
        """
        processed_context = []
        for ctx in context:
            try:
                # Try to parse as JSON
                parsed_ctx = json.loads(ctx)
                
                # Enhanced context processing
                if isinstance(parsed_ctx, dict):
                    # Combine all relevant information with smart formatting
                    context_str = ""
                    for key, value in parsed_ctx.items():
                        # Handle nested structures
                        if isinstance(value, (list, dict)):
                            value = json.dumps(value, indent=2)
                        context_str += f"{key.replace('_', ' ').title()}: {value}\n"
                    processed_context.append(context_str.strip())
                else:
                    processed_context.append(str(parsed_ctx))
            
            except (json.JSONDecodeError, TypeError):
                # If not JSON, use the original context
                processed_context.append(str(ctx))
        
        return processed_context

    def generate_prompt(
        self, 
        query: str, 
        context: List[str],
        format: ResponseFormat = ResponseFormat.TEXT
    ) -> str:
        """
        Generate an enhanced, context-aware prompt
        
        Args:
            query: User's query
            context: Relevant search results
            format: Desired response format

        Returns:
            Formatted prompt string
        """
        # Process context with enhanced extraction
        processed_context = self._process_context(context)
        
        # Combine context with numbering and clear separation
        context_text = "\n\n".join(f"[Context {i+1}]\n{ctx}" for i, ctx in enumerate(processed_context))
        
        # Format-specific instructions
        format_instruction = ""
        if format == ResponseFormat.JSON:
            format_instruction = "- Respond in a structured JSON format with clear key-value pairs"
        elif format == ResponseFormat.MARKDOWN:
            format_instruction = "- Use Markdown formatting with headers, lists, and emphasis"

        # Comprehensive, instruction-rich prompt
        prompt = f"""You are an expert banking assistant specializing in Nepalese banking services.

        QUERY: {query}

        CONTEXT:
        {context_text}


        CRITICAL RESPONSE GUIDELINES:
        - If the interpretation is ambiguous or unclear, please ask "Please provide me the name of the bank for the information you are seeking"
        - For any query that doesn't mention a bank and is not a general query please ask "Please provide me the name of the bank for the information you are seeking"
        - Use all the context you get, combine the chunks and provide a relevant reply
        - Provide a direct answer for direct questions. Do not reference context or any other information.
        - Never mention about similarity scores, contexts, or any dataset of RAG pipeline we are using
        - Extract ALL necessary details from the context
        - Carefully analyze the provided context
        - If no exact match is found, state "Relevant data could not be found" clearly
        - Be precise, concise, and directly address the specific query
        - Prioritize accuracy and relevance of information
        - Do not fabricate or assume any details not in the context
        - Analyze the context for necessary suggestions and calculations
        - Normal Description questions must be answered in a clear and concise manner
        - Extract EVERY detail about interest rates
        - If multiple rates or tenure exist, present them in a clear, structured format
        - Include exact percentages and rate structures
        - Names of Individual should be exactly precise
        {format_instruction}

        Detailed Response:"""
        
        return prompt



    def generate_summary_prompt(
        self,
        context: List[str],
        summary_type: str = "general",
        max_length: Optional[int] = None
    ) -> str:
        """
        Generate a prompt for creating summaries of banking information
        
        Args:
            context: List of context strings to summarize
            summary_type: Type of summary to generate ('general', 'technical', 'customer')
            max_length: Optional maximum length for the summary in words
        
        Returns:
            Formatted prompt string for generating a summary
        """
        # Process context with enhanced extraction
        processed_context = self._process_context(context)
        
        # Combine context with clear separation
        context_text = "\n\n".join(f"[Section {i+1}]\n{ctx}" for i, ctx in enumerate(processed_context))
        
        # Define summary type specific instructions
        summary_instructions = {
            "general": """
                - Create a comprehensive overview of the banking information
                - Focus on key services, rates, and policies
                - Use clear, non-technical language
                - Highlight main points that would interest general customers
            """,
            "technical": """
                - Provide detailed analysis of banking products and services
                - Include specific rates, terms, and conditions
                - Use precise banking terminology
                - Focus on technical aspects and compliance requirements
            """,
            "customer": """
                - Emphasize customer-facing features and benefits
                - Highlight competitive advantages
                - Include practical examples where relevant
                - Focus on service accessibility and customer experience
            """
        }
        
        # Get specific instructions based on summary type
        type_instructions = summary_instructions.get(
            summary_type,
            summary_instructions["general"]  # Default to general if type not found
        )
        
        # Add length constraint if specified
        length_instruction = f"\n- Limit the summary to approximately {max_length} words" if max_length else ""
        
        # Create the complete prompt
        prompt = f"""As an expert banking analyst, create a structured summary of the following banking information.

        CONTENT TO SUMMARIZE:
        {context_text}

        SUMMARY GUIDELINES:
        {type_instructions}
        - Organize information in a logical, flowing manner
        - Maintain factual accuracy without adding external information
        - Use clear section breaks for different topics
        - Include all relevant numerical data and statistics
        - Highlight any unique or distinguishing features{length_instruction}

        Please provide a well-structured summary:"""
        
        return prompt



    def ask_model(
        self, 
        prompt: str,
        params: Optional[ModelParameters] = None,
        stream: bool = False
    ) -> ModelResponse:
        """
        Send prompt to Ollama API with comprehensive error handling
        
        Args:
            prompt: The prompt to send
            params: Optional custom parameters for this request
            stream: Whether to stream the response

        Returns:
            ModelResponse object containing the response and metadata
        """
        url = f"{self.api_url}/api/generate"
        
        # Use custom parameters if provided, otherwise use defaults
        current_params = (params or self.default_params).to_dict()
        
        payload = {
            "model": self.model_name,
            "prompt": prompt,
            "stream": stream,
            **current_params
        }

        start_time = time.time()
        try:
            response = requests.post(url, json=payload)
            response.raise_for_status()
            
            result = response.json()
            generation_time = time.time() - start_time
            
            return ModelResponse(
                text=result.get("response", "").strip(),
                tokens_used=result.get("total_tokens", 0),
                generation_time=generation_time,
                model_name=self.model_name,
                parameters=current_params
            )

        except requests.RequestException as e:
            error_msg = f"Network error in model request: {str(e)}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)
        except json.JSONDecodeError:
            error_msg = "Invalid JSON response from Ollama"
            logger.error(error_msg)
            raise RuntimeError(error_msg)
        except Exception as e:
            error_msg = f"Unexpected error in model request: {str(e)}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)