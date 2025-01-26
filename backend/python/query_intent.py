from transformers import pipeline
from functools import lru_cache
import torch

class IntentClassifier:
    def __init__(self):
        # Using a financial/banking specific BERT model
        self.model_name = "yiyanghkust/finbert-tone"
        self._initialize_classifier()

    @lru_cache(maxsize=1)
    def _initialize_classifier(self):
        """
        Initialize the classifier with caching to avoid reloading
        """
        try:
            self.classifier = pipeline(
                "text-classification",
                model=self.model_name,
                device=0 if torch.cuda.is_available() else -1,  # Use GPU if available
                top_k=None  # Return all possible classes with scores
            )
        except Exception as e:
            print(f"Error initializing classifier: {e}")
            raise

    def classify_query(self, query: str, confidence_threshold: float = 0.3):
        """
        Classify query intent using FinBERT model and return intent with confidence score
        
        Args:
            query (str): The input query to classify
            confidence_threshold (float): Minimum confidence score to consider valid
            
        Returns:
            dict: Contains intent label and confidence score
        """
        try:
            # Get classification results
            results = self.classifier(query)
            
            # Sort results by score
            sorted_results = sorted(results[0], key=lambda x: x['score'], reverse=True)
            
            # Get top result
            top_result = sorted_results[0]
            
            # Prepare response
            classification_result = {
                'intent': top_result['label'],
                'confidence': float(top_result['score']),
                'all_intents': [
                    {
                        'label': result['label'],
                        'score': float(result['score'])
                    }
                    for result in sorted_results
                ],
                'is_confident': float(top_result['score']) >= confidence_threshold
            }
            
            return classification_result

        except Exception as e:
            print(f"Error during classification: {e}")
            return {
                'intent': 'unknown',
                'confidence': 0.0,
                'all_intents': [],
                'is_confident': False,
                'error': str(e)
            }

def get_classifier():
    """
    Singleton pattern to ensure we only create one instance of the classifier
    """
    if not hasattr(get_classifier, 'instance'):
        get_classifier.instance = IntentClassifier()
    return get_classifier.instance

if __name__ == "__main__":
    classifier = get_classifier()
    query = "Where is the nearest branch?"
    result = classifier.classify_query(query)
    print(f"Query: {query}")
    print(f"Intent: {result['intent']}")
    print(f"Confidence: {result['confidence']:.4f}")
    print(f"Is Confident: {result['is_confident']}")