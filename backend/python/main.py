import contextlib
import io
import sys
import json
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

import logging

# from evaluation import evaluate_retrieval
# from visualize_metrics import visualize_metrics

# Create a custom handler that writes to stderr
class StderrHandler(logging.Handler):
    def emit(self, record):
        msg = self.format(record)
        print(msg, file=sys.stderr, flush=True)

# Configure logging to use our custom handler
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[StderrHandler()]
)
logger = logging.getLogger(__name__)

class BankAssistant:
    def __init__(self):
        try:
            # Initialize SemanticSearch
            self.semantic_search = SemanticSearch(
                model_name='all-mpnet-base-v2',
                top_k=10,
                threshold=0.3,
                semantic_weight=0.6,  # Adjust these weights based on your needs
                keyword_weight=0.4
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
                    max_tokens=500
                )
            )
            logger.info("Ollama integration initialized successfully")

        except Exception as e:
            logger.error(f"Initialization error: {str(e)}")
            raise

    def _extract_query_terms(self, query: str):
        """
        Extract meaningful terms from the query.
        
        Args:
            query: Input query string
        
        Returns:
            List of important terms
        """
        stop_words = set(['what', 'are', 'the', 'for', 'in', 'of', 'at', 'is', 'a'])
        
        # Tokenize and clean query
        terms = query.lower().split()
        terms = [term for term in terms if term not in stop_words]
        
        return terms

    def _filter_most_relevant_results(self, search_results, query_terms, intent_result):
        """
        Advanced filtering of search results.
        
        Args:
            search_results: List of initial search results
            query_terms: Important terms from the query
            intent_result: Intent classification result
        
        Returns:
            Filtered list of most relevant results
        """
        scored_results = []
        for result in search_results:
            term_match_score = sum(
                term in result.content.lower() 
                for term in query_terms
            ) / len(query_terms) if query_terms else 0
            
            intent_score = intent_result.get('confidence', 0)
            product_match_score = self._calculate_product_match(result.content, query_terms)
            
            overall_score = (
                result.score * 0.4 +  # Original semantic search score
                term_match_score * 0.3 +  # Term matching
                intent_score * 0.2 +  # Intent confidence
                product_match_score * 0.1  # Product/service specific match
            )
            
            scored_results.append((result, overall_score))
        
        sorted_results = sorted(
            scored_results, 
            key=lambda x: x[1], 
            reverse=True
        )
        
        return [result for result, score in sorted_results[:10] if score > 0.5]

    def _calculate_product_match(self, content, query_terms):
        """
        Calculate specific product or service match
        
        Args:
            content: Search result content
            query_terms: Query terms
        
        Returns:
            Product match score
        """
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
        """
        Generate query suggestions based on the original query
        
        Args:
            query: Original search query
        
        Returns:
            List of suggested alternative queries
        """
        return [
            f"Detailed {query}",
            f"Comprehensive information about {query}",
            f"Latest updates on {query}"
        ]

    def process_query(self, query):
        """
        Process a user query end-to-end with improved filtering
        
        Args:
            query: User's input query
        
        Returns:
            Ollama model response
        """
        try:
            # Step 1: Classify intent
            intent_result = self.classifier.classify_query(query)
            logger.info(f"Detected Intent: {intent_result['intent']}")
            logger.info(f"Confidence: {intent_result['confidence']:.4f}")

            # Extract query terms
            query_terms = self._extract_query_terms(query)

            # Step 2: Perform semantic search
            search_results = self.semantic_search.search(query, top_k=15, threshold=0.3)

            # Step 3: Advanced result filtering
            filtered_results = self._filter_most_relevant_results(search_results, query_terms, intent_result)

            # Fallback to original results if filtering is too strict
            context_results = filtered_results or search_results

            # Handle no results scenario
            if not context_results:
                suggestions = self.query_suggestions(query)
                logger.warning("No relevant information found.")
                logger.info("Suggesting alternative queries:")
                for suggestion in suggestions:
                    logger.info(f"- {suggestion}")
                return "No relevant information found. Try rephrasing your query."


            # Include ALL search results in the response
            search_results_json = [
                {
                    'content': result.content,
                    'source': result.source,
                    'score': float(result.score),
                    'similarity': float(result.similarity),
                    'rank': idx + 1  # Add rank based on position in results
                } for idx, result in enumerate(search_results)  # Use original search_results to include all
            ]


            context = [
                json.dumps({
                    'content': result.content,
                    'source': result.source,
                    'score': float(result.score),  # Convert to float
                    'similarity': float(result.similarity),  # Convert to float
                    'rank': result.rank
                }) for result in context_results
            ]

            # Generate prompt and get response from Ollama
            prompt = self.ollama.generate_prompt(query, context)
            response = self.ollama.ask_model(prompt)
            # return response
           

            response_dict = {
                "query":query,
                "answer": response.text,
                "tokens_used": response.tokens_used,
                "generation_time": response.generation_time,
                "model_name": response.model_name,
                "parameters": response.parameters
            }
            return {
                "status": "success",
                "response": response_dict,
                "intent": intent_result['intent'],
                "confidence": intent_result['confidence'],
                "search_results": search_results_json
            }


        except Exception as e:
            logger.error(f"Query processing error: {e}")
            return {
                "status": "error",
                "message": f"Sorry, I couldn't process your query: {e}"
            }

def main():
    try:
        if len(sys.argv) <= 1:
            json_response = {
                "status": "error",
                "message": "Please provide a query to process."
            }
        else:
            user_query = sys.argv[1]
            
            # Capture all output during processing
            with io.StringIO() as buf, contextlib.redirect_stdout(buf):
                assistant = BankAssistant()
                response = assistant.process_query(user_query)
                json_response = response

        # Write only the JSON response to stdout
        print(json.dumps(json_response), flush=True)
        
    except Exception as e:
        logger.error(f"Error in main: {str(e)}")
        print(json.dumps({
            "status": "error",
            "message": "Internal server error"
        }), flush=True)

if __name__ == "__main__":
    main()