import simplejson as json
import numpy as np
import torch
import logging
import os
from typing import Dict, Any, List, Tuple

# Attempt safe import
try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    print("Could not import SentenceTransformer. Attempting alternative import.")
    from transformers import AutoModel, AutoTokenizer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('embeddings.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class EmbeddingGenerator:
    def __init__(
        self, 
        model_name: str = 'all-mpnet-base-v2',  # Changed to the specified model
        batch_size: int = 32
    ):
        """
        Initialize the embedding generator with robust error handling
        
        Args:
            model_name: Name of the sentence transformer model
            batch_size: Size of batches for processing
        """
        try:
            # Determine device
            self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
            logger.info(f"Using device: {self.device}")

            # Try SentenceTransformer first
            try:
                self.model = SentenceTransformer(model_name, device=self.device)
                self.use_sentence_transformer = True
                
                # Log model details
                logger.info(f"Loaded SentenceTransformer: {model_name}")
                logger.info(f"Embedding dimension: {self.model.get_sentence_embedding_dimension()}")
            except ImportError:
                # Fallback to manual embedding generation
                logger.warning("Falling back to manual embedding generation")
                self.model = AutoModel.from_pretrained(model_name)
                self.tokenizer = AutoTokenizer.from_pretrained(model_name)
                self.model.to(self.device)
                self.use_sentence_transformer = False

            self.batch_size = batch_size
            logger.info("Model initialized successfully")
        
        except Exception as e:
            logger.error(f"Error initializing embedding model: {str(e)}")
            raise

    def prepare_texts(self, flattened_data: Dict[str, Any]) -> Tuple[List[str], List[Tuple[str, str]]]:
        """
        Prepare texts and keys from flattened data with robust handling
        
        Args:
            flattened_data: The flattened JSON data
            
        Returns:
            Tuple of (texts, keys)
        """
        texts = []
        keys = []
        
        try:
            for full_key, value in flattened_data.items():
                # Ensure value is converted to string
                text = f"{full_key}: {str(value)}"
                texts.append(text)
                keys.append((full_key, str(value)))
            
            logger.info(f"Prepared {len(texts)} texts for embedding")
            return texts, keys
        
        except Exception as e:
            logger.error(f"Error preparing texts: {str(e)}")
            raise

    def generate_embeddings(
        self, 
        texts: List[str], 
        show_progress: bool = True
    ) -> np.ndarray:
        """
        Generate embeddings with batch processing and progress tracking
        
        Args:
            texts: List of texts to embed
            show_progress: Whether to show progress bar
            
        Returns:
            numpy array of embeddings
        """
        try:
            # Use SentenceTransformer method if available
            if self.use_sentence_transformer:
                embeddings = self.model.encode(
                    texts, 
                    batch_size=self.batch_size,
                    show_progress_bar=show_progress,
                    convert_to_numpy=True
                )
            else:
                # Manual embedding generation
                embeddings = []
                for i in range(0, len(texts), self.batch_size):
                    batch = texts[i:i+self.batch_size]
                    
                    # Tokenize batch
                    batch_encoded = self.tokenizer(
                        batch, 
                        padding=True, 
                        truncation=True, 
                        return_tensors='pt'
                    ).to(self.device)
                    
                    # Generate embeddings
                    with torch.no_grad():
                        model_output = self.model(**batch_encoded)
                        batch_embeddings = model_output.last_hidden_state.mean(dim=1)
                    
                    embeddings.append(batch_embeddings.cpu().numpy())
                
                # Concatenate embeddings
                embeddings = np.vstack(embeddings)
            
            logger.info(f"Generated embeddings of shape: {embeddings.shape}")
            return embeddings
        
        except Exception as e:
            logger.error(f"Error generating embeddings: {str(e)}")
            raise

def save_faiss_index(
    embeddings: np.ndarray,
    keys: List[Tuple[str, str]],
    faiss_file: str = 'embeddings/vector_database.faiss',
    key_file: str = 'embeddings/key_mapping.json',
    create_dir: bool = True
) -> None:
    """
    Save FAISS index and keys with comprehensive error handling
    """
    try:
        # Create directories if needed
        if create_dir:
            os.makedirs(os.path.dirname(faiss_file), exist_ok=True)
            os.makedirs(os.path.dirname(key_file), exist_ok=True)

        # Create and save FAISS index
        import faiss
        dimension = embeddings.shape[1]
        index = faiss.IndexFlatL2(dimension)
        index.add(np.array(embeddings))
        faiss.write_index(index, faiss_file)

        # Save keys
        with open(key_file, 'w', encoding='utf-8') as file:
            json.dump(keys, file, ensure_ascii=False, indent=2)

        logger.info(f"FAISS index saved to {faiss_file}")
        logger.info(f"Keys saved to {key_file}")
        
    except Exception as e:
        logger.error(f"Error saving index and keys: {str(e)}")
        raise

def regenerate_embeddings():
    """
    Utility function to regenerate embeddings with the new model
    """
    try:
        # Load flattened data
        with open('data/processed/flattened_data.json', 'r', encoding='utf-8') as file:
            flattened_data = json.load(file)

        # Initialize embedding generator with the new model
        generator = EmbeddingGenerator(
            model_name='all-mpnet-base-v2',
            batch_size=32
        )

        # Prepare texts and keys
        texts, keys = generator.prepare_texts(flattened_data)

        # Generate embeddings
        embeddings = generator.generate_embeddings(
            texts,
            show_progress=True
        )

        # Save FAISS index and keys
        save_faiss_index(embeddings, keys)
        
        logger.info("Embeddings regenerated successfully")
        
    except Exception as e:
        logger.error(f"Embedding regeneration failed: {str(e)}")
        raise

if __name__ == "__main__":
    regenerate_embeddings()