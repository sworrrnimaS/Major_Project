import simplejson as json
from typing import Any, Dict, List, Union, Optional
from tqdm import tqdm
import psutil
import logging
import sys
import os
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('preprocessing.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class MemoryError(Exception):
    """Custom exception for memory-related errors."""
    pass

class JSONFlattener:
    def __init__(self, memory_threshold: float = 85.0):
        self.memory_threshold = memory_threshold
        self.flattened_data = {}

    def _check_memory_usage(self) -> None:
        memory_percent = psutil.Process().memory_percent()
        if memory_percent > self.memory_threshold:
            raise MemoryError(
                f"Memory usage ({memory_percent:.2f}%) exceeded threshold ({self.memory_threshold}%)"
            )

    def flatten_dict(self, obj: Dict, parent_key: str = '', sep: str = '.') -> None:
        """Recursively flatten a nested dictionary"""
        for key, value in obj.items():
            new_key = f"{parent_key}{sep}{key}" if parent_key else key

            if isinstance(value, dict):
                self.flatten_dict(value, new_key, sep=sep)
            elif isinstance(value, list):
                self.flatten_list(value, new_key, sep=sep)
            else:
                self.flattened_data[new_key] = str(value)

    def flatten_list(self, obj: List, parent_key: str, sep: str = '.') -> None:
        """Flatten a list with its index as part of the key"""
        for i, item in enumerate(obj):
            new_key = f"{parent_key}[{i}]"
            if isinstance(item, dict):
                self.flatten_dict(item, new_key, sep=sep)
            elif isinstance(item, list):
                self.flatten_list(item, new_key, sep=sep)
            else:
                self.flattened_data[new_key] = str(item)

    def chunk_text(self, text: str, chunk_size: int, chunk_overlap: int) -> List[str]:
        """Split text into overlapping chunks"""
        words = text.split()
        chunks = []
        
        for i in range(0, len(words), chunk_size - chunk_overlap):
            chunk = " ".join(words[i:i + chunk_size])
            chunks.append(chunk)
        
        return chunks

    def preprocess_json(
        self, 
        data: Union[Dict, List], 
        chunk_size: int = 200, 
        chunk_overlap: int = 50
    ) -> Dict[str, str]:
        try:
            self.flattened_data = {}  # Reset flattened data
            
            # Handle the banks data structure
            if isinstance(data, dict) and 'banks' in data:
                banks_data = data['banks']
            elif isinstance(data, list):
                banks_data = data
            else:
                raise ValueError("Expected either a dictionary with 'banks' key or a list of banks")

            # Process each bank
            for i, bank in enumerate(banks_data):
                if not isinstance(bank, dict):
                    continue
                
                # Fetch and sanitize the bank name
                raw_bank_name = bank.get('bank_information', {}).get('bank_name', f'Bank_{i}')
                bank_name = raw_bank_name.lower().replace(' ', '_')  # Normalize name
                
                logger.info(f"Processing bank: {raw_bank_name}")
                
                # Flatten the bank data
                self.flatten_dict(bank, parent_key=f"bank_{bank_name}")

            # Post-process long text fields
            chunked_data = {}
            for key, value in self.flattened_data.items():
                if isinstance(value, str) and len(value.split()) > chunk_size:
                    chunks = self.chunk_text(value, chunk_size, chunk_overlap)
                    for i, chunk in enumerate(chunks):
                        chunk_key = f"{key}_chunk_{i}"
                        chunked_data[chunk_key] = chunk
                else:
                    chunked_data[key] = value

            logger.info(f"Flattened {len(banks_data)} banks into {len(chunked_data)} entries")
            return chunked_data

        except Exception as e:
            logger.error(f"Error in preprocessing: {str(e)}")
            raise


def get_memory_usage() -> float:
    return psutil.Process().memory_percent()

if __name__ == "__main__":
    try:
        # Ensure data directory exists
        os.makedirs('data/processed', exist_ok=True)

        # Load JSON data
        input_file = 'data/banks.json'
        logger.info(f"Loading data from {input_file}")
        
        with open(input_file, 'r', encoding='utf-8') as file:
            raw_data = json.load(file)

        # Initialize and run flattener
        flattener = JSONFlattener()
        flattened_data = flattener.preprocess_json(
            raw_data,
            chunk_size=200,
            chunk_overlap=50
        )

        # Save processed data
        output_file = 'data/processed/flattened_data.json'
        logger.info(f"Saving processed data to {output_file}")
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(flattened_data, f, indent=2, ensure_ascii=False)

        # Log statistics
        if isinstance(raw_data, dict):
            num_banks = len(raw_data.get('banks', []))
        else:
            num_banks = len(raw_data) if isinstance(raw_data, list) else 0
            
        logger.info(f"Preprocessing completed successfully")
        logger.info(f"Total banks processed: {num_banks}")
        logger.info(f"Total flattened entries: {len(flattened_data)}")
        
        # Print sample of flattened data
        logger.info("\nSample of flattened data (first 5 entries):")
        for i, (key, value) in enumerate(list(flattened_data.items())[:5]):
            logger.info(f"{key}: {value[:100]}...")

    except Exception as e:
        logger.error(f"Preprocessing failed: {str(e)}")
        raise