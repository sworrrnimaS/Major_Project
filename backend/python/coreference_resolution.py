import logging
from typing import Optional, Dict, List, Tuple
from datetime import datetime
import re

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class QueryContext:
    def __init__(self, query: str, response: str = None):
        self.query = query
        self.response = response
        self.timestamp = datetime.now()
        self.bank = None
        self.product = None
        self.query_type = None
        self.extracted_info = {}
        self.personnel = None
        self.branch = None 

class BankingResolver:
    def __init__(self):
        """Initialize the banking resolver with bank data and conversation history."""
        self.bank_mappings = {
            "NBL": {"name": "Nepal Bank Limited", "aliases": ["nbl", "nepal bank"]},
            "RBBL": {"name": "Rastriya Banijya Bank Limited", "aliases": ["rbb", "rastriya bank"]},
            "ADBL": {"name": "Agriculture Development Bank Limited", "aliases": ["adbl", "agriculture bank"]},
            "NABIL": {"name": "Nabil Bank Limited", "aliases": ["nabil", "nabil bank"]},
            "HBL": {"name": "Himalayan Bank Limited", "aliases": ["hbl", "himalayan bank"]},
            "NIMB": {"name": "Nepal Investment Mega Bank Limited", "aliases": ["nimb", "nepal investment", "mega bank"]},
            "NICA": {"name": "NIC Asia Bank Limited", "aliases": ["nica", "nic asia"]},
            "GIBL": {"name": "Global IME Bank Limited", "aliases": ["gibl", "global ime", "global bank"]},
            "SCBNL": {"name": "Standard Chartered Bank Nepal Limited", "aliases": ["scbnl", "standard chartered", "standard chartered nepal"]},
            "EBL": {"name": "Everest Bank Limited", "aliases": ["ebl", "everest bank"]},
            "NSBL": {"name": "Nepal State Bank of India Bank Limited", "aliases": ["nsbl", "nepal sbi", "state bank nepal"]},
            "PBL": {"name": "Prabhu Bank Limited", "aliases": ["pbl", "prabhu bank"]},
            "NICA": {"name": "NIC Asia Bank Limited", "aliases": ["nica", "nic asia", "nic asia bank"]},
            "CBIL": {"name": "Citizens Bank International Limited", "aliases": ["cbil", "citizens bank"]},
            "LSL": {"name": "Laxmi Sunrise Bank Limited", "aliases": ["lsl", "laxmi bank", "sunrise bank"]},
            "PCBN": {"name": "Prime Commercial Bank Nepal", "aliases": ["pcbn", "prime bank", "prime commercial"]},
            "SBL": {"name": "Siddhartha Bank Limited", "aliases": ["sbl", "siddhartha bank"]},
            "KBL": {"name": "Kumari Bank Limited", "aliases": ["kbl", "kumari bank"]},
            "NMB": {"name": "Nepal Merchant Banking and Finance Limited", "aliases": ["nmb", "nepal merchant", "merchant bank"]},
            "MBL": {"name": "Machhapuchchhre Bank Limited", "aliases": ["mbl", "machhapuchchhre bank"]},
            "SANIMA": {"name": "Sanima Bank Limited", "aliases": ["sanima", "sanima bank"]}
        }
        
        self.name_to_bank = {}
        for code, details in self.bank_mappings.items():
            self.name_to_bank[details['name'].lower()] = code
            for alias in details['aliases']:
                self.name_to_bank[alias.lower()] = code

        self.stop_words = {
            'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being',
            'the', 'a', 'an', 'in', 'on', 'at', 'by', 'to', 'for',
            'of', 'with', 'about', 'features'
        }

        self.product_keywords = {
            'account', 'deposit', 'loan', 'scheme', 'plan', 'card',
            'savings', 'fixed', 'current', 'recurring'
        }

        self.personnel_keywords = {
            "chairman", "department members", "company secretary", 
            "ceo", "director", "board member", "executive", "branch manager"
        }
        
        self.branch_related_keywords = {
            "branch", "branch location", "address", "contact",
            "phone", "email", "branch manager"
        }

        self.conversation_history: List[QueryContext] = []
        
        self.info_patterns = {
            'interest_rate': r'(\d+(?:\.\d+)?%)',
            'amount': r'(?:Rs\.|NPR)\s*(\d+(?:,\d+)*(?:\.\d+)?)',
            'duration': r'(\d+)\s*(year|month|day)s?',
            'percentage': r'(\d+(?:\.\d+)?)\s*%'
        }

    def clean_product_name(self, product_name: str) -> str:
        if not product_name:
            return product_name
            
        prefixes_to_remove = ['features ', 'interest rate ', 'free ']
        product_lower = product_name.lower()
        
        for prefix in prefixes_to_remove:
            if product_lower.startswith(prefix):
                product_name = product_name[len(prefix):]
                
        words = product_name.split()
        while words and words[0].lower() in self.stop_words:
            words = words[1:]
            
        return ' '.join(words)

    def extract_product_name(self, text: str) -> Optional[str]:
        text = text.lower()
        
        product_indicators = ['account', 'deposit', 'loan', 'scheme', 'plan', 'card']
        
        end_pos = -1
        end_word = ""
        for indicator in product_indicators:
            if indicator in text:
                pos = text.find(indicator)
                if pos > end_pos:
                    end_pos = pos + len(indicator)
                    end_word = indicator
        
        if end_pos == -1:
            return None
            
        text_before = text[:end_pos]
        
        start_pos = 0
        for word in self.stop_words:
            pos = text_before.rfind(f" {word} ")
            if pos != -1:
                start_pos = pos + len(word) + 2
        
        product_name = text[start_pos:end_pos].strip()
        product_words = product_name.split()
        product_words = [word for word in product_words if word not in self.stop_words]
        product_name = ' '.join(product_words)
        
        if product_name:
            product_name = self.clean_product_name(product_name.title())
        
        return product_name

    def extract_personnel(self, text: str) -> Optional[str]:
        text = text.lower()
        for keyword in self.personnel_keywords:
            if keyword in text:
                return keyword
        return None

    def extract_information(self, text: str) -> Dict[str, List[str]]:
        extracted_info = {}
        
        for info_type, pattern in self.info_patterns.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                extracted_info[info_type] = matches
        
        return extracted_info

    def extract_branch_name(self, text: str) -> Optional[str]:
        """Extract branch name from text using pattern matching."""
        text_lower = text.lower()
        
        # Pattern to match location followed by branch
        branch_patterns = [
            r'(\w+)\s+branch',  # matches "Ason branch"
            r'branch(?:\s+(?:of|at|in))?\s+(\w+)',  # matches "branch at Ason"
            r'(\w+)(?:\s+(?:branch|location))?(?:\s+(?:of|at|in))',  # matches "Ason of"
        ]
        
        for pattern in branch_patterns:
            matches = re.finditer(pattern, text_lower)
            for match in matches:
                # Get the group that contains the location name
                branch_name = match.group(1) if match.group(1) else match.group(2)
                if branch_name and branch_name not in self.stop_words:
                    return branch_name
        
        # Look for locations in the response if no branch explicitly mentioned
        location_pattern = r'(?:located|situated|found)(?:\s+(?:in|at))?\s+(\w+)'
        match = re.search(location_pattern, text_lower)
        if match and match.group(1) not in self.stop_words:
            return match.group(1)
            
        return None
    
    def get_bank_from_text(self, text: str) -> Optional[str]:
        text = text.lower()
        
        for code, details in self.bank_mappings.items():
            if details['name'].lower() in text:
                return details['name']
            for alias in details['aliases']:
                if alias in text:
                    return details['name']
        return None

    def get_context_from_query(self, query: str, response: str = None) -> QueryContext:
        context = QueryContext(query, response)
        
        context.bank = self.get_bank_from_text(query)
        context.product = self.extract_product_name(query)
        context.personnel = self.extract_personnel(query)
        context.branch = self.extract_branch_name(query)
        
        query_lower = query.lower()
        if any(keyword in query_lower for keyword in self.branch_related_keywords):
            if 'manager' in query_lower:
                context.query_type = 'branch_manager'
            elif 'contact' in query_lower or 'phone' in query_lower or 'email' in query_lower:
                context.query_type = 'branch_contact'
            elif 'location' in query_lower or 'address' in query_lower:
                context.query_type = 'branch_location'
            else:
                context.query_type = 'branch_info'
        elif 'interest' in query_lower or 'rate' in query_lower:
            context.query_type = 'interest_rate'
        elif 'eligibility' in query_lower or 'criteria' in query_lower:
            context.query_type = 'eligibility'
        elif any(word in query_lower for word in ['atm', 'card']):
            context.query_type = 'atm'
        elif any(word in query_lower for word in ['website', 'link', 'url']):
            context.query_type = 'website'
        elif any(word in query_lower for word in ['address', 'location', 'branch']):
            context.query_type = 'location'
        elif any(word in query_lower for word in ['contact', 'phone', 'number']):
            context.query_type = 'contact'
        elif any(word in query_lower for word in self.personnel_keywords):
            context.query_type = 'personnel'
        
        context.extracted_info = self.extract_information(query)
        if response:
            response_info = self.extract_information(response)
            for key, value in response_info.items():
                if key not in context.extracted_info:
                    context.extracted_info[key] = value
                else:
                    context.extracted_info[key].extend(value)
        
        return context

    def add_to_history(self, query: str, response: str = None):
        context = self.get_context_from_query(query, response)
        self.conversation_history.append(context)

    def get_relevant_context(self, current_query: str) -> Tuple[QueryContext, QueryContext]:
        if not self.conversation_history:
            return None, None
        
        current_context = self.get_context_from_query(current_query)
        prev_context = self.conversation_history[-1]
        
        if current_context.query_type:
            for ctx in reversed(self.conversation_history[:-1]):
                if ctx.query_type == current_context.query_type:
                    return prev_context, ctx
        
        return prev_context, None

    def resolve_query(self, current_query: str) -> str:
        try:
            referential_words = {
                'it', 'its', 'they', 'their', 'them', 'this', 'that', 'these', 'those',
                'he', 'his', 'she', 'her', 'such'
            }
            
            query_words = set(current_query.lower().split())
            has_references = any(word in referential_words for word in query_words)
            
            if not has_references:
                logger.info(f"No referential words found in query: '{current_query}'. Returning original.")
                return current_query
                
            prev_context, _ = self.get_relevant_context(current_query)
            if not prev_context:
                return current_query
            
            resolved = current_query.strip()
            current_lower = resolved.lower()
             
            if prev_context.product:
                clean_product = self.clean_product_name(prev_context.product)
                resolved = re.sub(r'\bit\b(?!\s+is)', clean_product, resolved, flags=re.IGNORECASE)
                resolved = re.sub(r'\bits\b', f"{clean_product}'s", resolved, flags=re.IGNORECASE)
                resolved = re.sub(r'\btheir\b', f"{clean_product}'s", resolved, flags=re.IGNORECASE)
                resolved = re.sub(r'\b(this|that)\s+(account|deposit|loan|card)\b', 
                                clean_product, resolved, flags=re.IGNORECASE)
            
            if prev_context.product:
                clean_product = self.clean_product_name(prev_context.product)
                product_variations = [
                    clean_product,
                    clean_product.lower(),
                    clean_product.upper()
                ]
                count = sum(1 for var in product_variations if var in resolved)
                if count > 1:
                    for var in product_variations:
                        if var in resolved:
                            pos = resolved.find(var)
                            resolved = resolved[:pos] + resolved[pos:].replace(var, '', 1)
            
            if prev_context.branch:
                # Check for existing branch references
                branch_variations = [
                    prev_context.branch.lower(),
                    f"{prev_context.branch.lower()} branch",
                    f"{prev_context.branch.lower()}'s"
                ]
                
                branch_mentioned = any(var in current_lower for var in branch_variations)
                
                # Only replace pronouns if branch isn't already mentioned
                if not branch_mentioned:
                    if 'its' in current_lower:
                        resolved = re.sub(r'\bits\b', f"{prev_context.branch}'s", resolved, flags=re.IGNORECASE)
                    elif 'their' in current_lower:
                        resolved = re.sub(r'\btheir\b', f"{prev_context.branch}'s", resolved, flags=re.IGNORECASE)
                    elif 'there' in current_lower:
                        resolved = re.sub(r'\bthere\b', f"at {prev_context.branch}", resolved, flags=re.IGNORECASE)
                    elif any(kw in current_lower for kw in self.branch_related_keywords):
                        if 'the branch' in current_lower:
                            resolved = re.sub(r'\bthe\s+branch\b', f"the {prev_context.branch} branch", resolved, flags=re.IGNORECASE)
            
            if prev_context.personnel:
                resolved = re.sub(r'\bhis\b', prev_context.personnel + "'s", resolved, flags=re.IGNORECASE)
                resolved = re.sub(r'\bher\b', prev_context.personnel + "'s", resolved, flags=re.IGNORECASE)
                resolved = re.sub(r'\btheir\b', prev_context.personnel + "'s", resolved, flags=re.IGNORECASE)
                resolved = re.sub(r'\bthey\b', prev_context.personnel, resolved, flags=re.IGNORECASE)
            
            if prev_context.extracted_info.get('interest_rate'):
                rate = prev_context.extracted_info['interest_rate'][0]
                resolved = re.sub(r'\b(this|that)\s+rate\b', rate, resolved, flags=re.IGNORECASE)
            
            if has_references:
                if prev_context.product and not any(kw in current_lower for kw in self.personnel_keywords):
                    clean_product = self.clean_product_name(prev_context.product)
                    if clean_product.lower() not in resolved.lower():
                        if resolved.endswith('?'):
                            resolved = f"{resolved[:-1]} for {clean_product}?"
                        else:
                            resolved = f"{resolved} for {clean_product}"
                
                # Force add branch name if branch-related keywords are present and branch isn't mentioned
                if prev_context.branch and any(kw in current_lower for kw in self.branch_related_keywords):
                    branch_variations = [
                        prev_context.branch.lower(),
                        f"{prev_context.branch.lower()} branch"
                    ]
                    if not any(var in current_lower for var in branch_variations):
                        if resolved.endswith('?'):
                            resolved = f"{resolved[:-1]} at {prev_context.branch} branch?"
                        else:
                            resolved = f"{resolved} at {prev_context.branch} branch"
                
                if prev_context.bank and prev_context.bank.lower() not in resolved.lower():
                    if resolved.endswith('?'):
                        resolved = f"{resolved[:-1]} at {prev_context.bank}?"
                    else:
                        resolved = f"{resolved} at {prev_context.bank}"
            
            resolved = ' '.join(resolved.split())
            resolved = resolved.replace("'s's", "'s")
            
            logger.info(f"Resolved '{current_query}' to '{resolved}'")
            return resolved

        except Exception as e:
            logger.error(f"Error in resolution: {str(e)}")
            return current_query

def resolve_references(conversation_text: dict) -> str:
    """
    Main function to resolve references from conversation context
    
    Args:
        conversation_text: Dictionary containing query, response, and follow_up
        
    Returns:
        Resolved query string
    """
    try:
        resolver = BankingResolver()
        
        # Add previous query and response to history
        resolver.add_to_history(
            conversation_text['query'],
            conversation_text['response']
        )
        
        # Resolve the follow-up query
        resolved_query = resolver.resolve_query(conversation_text['follow_up'])
        
        return resolved_query
        
    except Exception as e:
        logger.error(f"Error in resolve_references: {str(e)}")
        return conversation_text['follow_up']  # Return original follow-up if resolution fails
    
