import sys
import json
import logging
import numpy as np
from sentence_transformers import SentenceTransformer
from preprocess import JSONFlattener
from embeddings import EmbeddingGenerator
from search import SemanticSearch, SearchResult
from query_intent import get_classifier
from ollama_integration import (
    OllamaIntegration, 
    ModelParameters, 
    ResponseFormat
)
from coreference_resolution import resolve_references
from calculation_handler import check_if_calculation_or_not, handle_calculation_query

# Custom JSON encoder to handle numpy types
class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (np.float32, np.float64)):
            return float(obj)
        if isinstance(obj, np.int64):
            return int(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super().default(obj)
    
# Configure logging to write to file instead of stdout
logging.basicConfig(
    filename='bank_assistant.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Redirect all other output to the log file
import sys
class LoggerWriter:
    def __init__(self, level):
        self.level = level
    def write(self, message):
        if message != '\n':
            self.level(message)
    def flush(self):
        pass

sys.stdout = LoggerWriter(logger.info)
sys.stderr = LoggerWriter(logger.error)

class BankAssistant:
    def __init__(self):
        try:
            # Initialize SemanticSearch
            self.semantic_search = SemanticSearch(
                model_name='all-mpnet-base-v2',
                top_k=10,
                threshold=0.3
            )
            self.semantic_search.load_index_and_keys()
            logger.info("Search engine initialized successfully")

            # Initialize intent classifier
            self.classifier = get_classifier()
            logger.info("Intent classifier initialized successfully")

            # Initialize Ollama
            self.ollama = OllamaIntegration(
                model_name='llama3.2:3b-instruct-q8_0',
                default_params=ModelParameters(
                    temperature=0.7,
                    top_p=0.9,
                    max_tokens=500,
                    # context_window=True
                )
            )
            logger.info("Ollama integration initialized successfully")

        except Exception as e:
            logger.error(f"Initialization error: {str(e)}")
            raise

    def _extract_query_terms(self, query: str):
        """Extract meaningful terms from the query."""
        stop_words = set(['what', 'are', 'the', 'for', 'in', 'of', 'at', 'is', 'a'])
        terms = query.lower().split()
        terms = [term for term in terms if term not in stop_words]
        return terms

    def _filter_most_relevant_results(self, search_results, query_terms, intent_result):
        """Filter and score search results."""
        scored_results = []
        for result in search_results:
            term_match_score = sum(
                term in result.content.lower() 
                for term in query_terms
            ) / len(query_terms) if query_terms else 0
            
            intent_score = intent_result.get('confidence', 0)
            product_match_score = self._calculate_product_match(result.content, query_terms)
            
            overall_score = (
                result.score * 0.4 +
                term_match_score * 0.3 +
                intent_score * 0.2 +
                product_match_score * 0.1
            )
            
            scored_results.append((result, overall_score))
        
        sorted_results = sorted(scored_results, key=lambda x: x[1], reverse=True)
        return [result for result, score in sorted_results[:10] if score > 0.5]

    def _calculate_product_match(self, content, query_terms):
        """Calculate specific product or service match."""
        product_keywords = {
            'home_loan': ['home', 'loan', 'mortgage', 'housing'],
            'credit_card': ['credit', 'card', 'freedom', 'visa', 'mastercard'],
            'savings_account': ['savings', 'account', 'deposit', 'bachat'],
            'interest_rate': ['interest', 'rate', 'percentage', 'earning']
        }
        
        product_matches = {}
        for product, keywords in product_keywords.items():
            product_matches[product] = sum(
                keyword in content.lower() 
                for keyword in keywords
            )
        
        query_product_matches = sum(
            any(term in keywords for keywords in product_keywords.values())
            for term in query_terms
        )
        
        max_product_match = max(product_matches.values()) if product_matches else 0
        return (max_product_match + query_product_matches) / (len(product_keywords) + 1)

    def query_suggestions(self, query):
        """Generate query suggestions."""
        return [
            f"Detailed {query}",
            f"Comprehensive information about {query}",
            f"Latest updates on {query}"
        ]

    def process_query(self, conversation_context):
        try:
            # Resolve coreferences
            resolved_query = resolve_references(conversation_context)
            logger.info(f"Original query: {conversation_context['follow_up']}")
            logger.info(f"Resolved query: {resolved_query}")
            
            # Get intent
            intent_result = self.classifier.classify_query(resolved_query)
            logger.info(f"Detected Intent: {intent_result['intent']}")
            logger.info(f"Confidence: {intent_result['confidence']:.4f}")

            query_terms = self._extract_query_terms(resolved_query)

            # Perform search
            search_results = self.semantic_search.search(resolved_query, top_k=15, threshold=0.3)

            filtered_results = self._filter_most_relevant_results(
                search_results, query_terms, intent_result
            )

            context_results = filtered_results or search_results
            
            # Prepare search results for JSON serialization
            context = []
            for result in context_results:
                context.append({
                    'content': result.content,
                    'source': result.source,
                    'score': float(result.score),
                    'similarity': float(result.similarity),
                    'rank': int(result.rank)
                })
            
            contextcalc = [
                    json.dumps({
                        'content': result.content,
                        'source': result.source,
                        'score': float(result.score),
                        'similarity': float(result.similarity),
                        'rank': result.rank
                    }) for result in context_results
                ]
            with open("calculationcontext.json", "w", encoding="utf-8") as file:
                json.dump(contextcalc, file, indent=4)

            # Check if it's a calculation query
            if check_if_calculation_or_not(resolved_query):
                search_results_json = [
                    {
                        'content': result.content,
                        'source': result.source,
                        'score': float(result.score),
                        'similarity': float(result.similarity),
                        'rank': idx + 1
                    } for idx, result in enumerate(search_results)
                ]
                
                calculation_result = handle_calculation_query(resolved_query)
                return {
                    "status": "success",
                    "response": calculation_result.get('human_response', 'Calculation completed'),
                    "calculation": calculation_result,
                    "resolved_query": resolved_query,
                    "intent": intent_result['intent'],
                    "confidence": intent_result['confidence'],
                    "search_results": search_results_json
                }

            # Generate response
            prompt = self.ollama.generate_prompt(resolved_query, context)
            model_response = self.ollama.ask_model(prompt)
            
            # Ensure the response is JSON serializable
            response_text = str(model_response) if hasattr(model_response, '__str__') else "Unable to process response"
            
            return {
                "status": "success",
                "response": response_text,
                "resolved_query": resolved_query,
                "intent": intent_result['intent'],
                "confidence": float(intent_result['confidence'])
            }
            
        except Exception as e:
            logger.error(f"Query processing error: {str(e)}")
            return {
                "status": "error", 
                "response": f"Sorry, I couldn't process your query: {str(e)}",
                "error": str(e),
                "resolved_query": conversation_context['follow_up']
            }

def main():
    try:
        # Restore stdout for JSON output
        sys.__stdout__.write("")  # Clear any buffered output
        
        # Read input from stdin
        input_data = sys.stdin.readline().strip()
        
        if not input_data:
            result = {
                "status": "error",
                "response": "Please provide conversation context to process.",
                "error": "No input provided"
            }
        else:
            try:
                conversation_context = json.loads(input_data)
                
                # Validate required fields
                required_fields = ['query', 'response', 'follow_up']
                if not all(field in conversation_context for field in required_fields):
                    raise ValueError("Missing required fields in input JSON")

                assistant = BankAssistant()
                result = assistant.process_query(conversation_context)
                
            except json.JSONDecodeError as e:
                result = {
                    "status": "error",
                    "response": "Invalid JSON input",
                    "error": str(e)
                }
            except Exception as e:
                result = {
                    "status": "error",
                    "response": "An unexpected error occurred",
                    "error": str(e)
                }
        
        # Ensure the result is JSON serializable
        sanitized_result = json.loads(json.dumps(result, cls=NumpyEncoder))
        
        # Write JSON response to original stdout
        sys.__stdout__.write(json.dumps(sanitized_result, ensure_ascii=False) + "\n")
        sys.__stdout__.flush()
        
    except Exception as e:
        error_result = {
            "status": "error",
            "response": "An unexpected error occurred",
            "error": str(e)
        }
        sys.__stdout__.write(json.dumps(error_result, ensure_ascii=False) + "\n")
        sys.__stdout__.flush()

if __name__ == "__main__":
    main()