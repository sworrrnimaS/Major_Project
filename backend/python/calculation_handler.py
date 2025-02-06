
# calculation_handler.py
import re
import json
import logging
from formula import (
    calculate_emi,
    calculate_simple_interest,
    calculate_compound_interest,
    calculate_amortization_schedule
)

logger = logging.getLogger(__name__)

def check_if_calculation_or_not(query):
    """
    Check if the query contains words indicating a calculation request.
    """
    calculation_keywords = ['calculate', 'compute', 'find', 'determine', 'estimate', 'work out']
    return any(keyword in query.lower() for keyword in calculation_keywords)
def extract_bank_product_info(query):
    """
    Extract bank name and product information from the query using improved regex patterns.
    Returns tuple of (bank_name, product_name) or (None, None) if not found.
    """
    # Bank name patterns with improved matching
    bank_patterns = [
        # Match full official names with optional "Limited" variations
        r"(?i)(?:(?:nepal|rastriya banijya|agriculture development|nabil|himalayan|nepal investment mega|nic asia|global ime|standard chartered(?:\s+nepal)?|everest|nepal (?:state\s+)?(?:bank\s+of\s+india|sbi)|prabhu|citizens|laxmi sunrise|prime commercial(?:\s+nepal)?|siddhartha|kumari|nepal merchant banking and finance|machhapuchchhre|sanima)\s+bank(?:\s+limited)?)",
        
        # Match common abbreviations without requiring word boundaries
        r"(?i)(?:nbl|rbbl|adbl|nabil|hbl|nimb|nica|gibl|scbnl|ebl|nsbl|pbl|cbil|lsl|pcbn|sbl|kbl|nmb|mbl|sanima)",
        
        # Match variations of bank names
        r"(?i)(?:nepal|rastriya|agriculture|nabil|himalayan|mega|nic asia|global ime|global|standard chartered|everest|nepal sbi|state bank nepal|prabhu|citizens|laxmi|sunrise|prime|siddhartha|kumari|merchant|machhapuchchhre|sanima)\s*bank"
    ]
    
    # Product patterns (enhanced with more variations)
    product_patterns = [
        # Match loan types
        r"(?i)(?:share margin|margin lending|against shares|share loan|personal|home|auto|vehicle|education|business|term|demand|overdraft)\s+(?:loan|credit|advance)",
        
        # Match generic products
        r"(?i)(?:loan|deposit|saving|bachat|khata|scheme|fixed deposit|recurring deposit|mutual fund|credit card|debit card|mobile banking|internet banking)",
        
        # Match with contextual words
        r"(?i)(?:for|of|in|about|regarding)\s+(?:the\s+)?([A-Za-z\s]+?(?:loan|deposit|saving|scheme))"
    ]
    
    bank_name = None
    product_name = None
    
    # Try to find bank name
    try:
        for pattern in bank_patterns:
            match = re.search(pattern, query, re.IGNORECASE)
            if match:
                bank_name = match.group(0).strip()
                bank_name = standardize_bank_name(bank_name)
                break
    except Exception as e:
        logger.error(f"Error extracting bank name: {e}")
    
    # Try to find product name
    try:
        for pattern in product_patterns:
            match = re.search(pattern, query, re.IGNORECASE)
            if match:
                product_name = match.group(0).strip()
                # Clean up product name
                product_name = re.sub(r'(?i)for\s+the\s+|about\s+|regarding\s+', '', product_name)
                break
    except Exception as e:
        logger.error(f"Error extracting product name: {e}")
    
    return bank_name, product_name

def standardize_bank_name(bank_name):
    """
    Standardize bank names to their official forms
    """
    # Convert to upper for matching
    bank_name_upper = bank_name.upper()
    
    # Bank name mapping with more variations
    bank_mapping = {
        "MBL": "Machhapuchchhre Bank Limited",
        "MACHHA": "Machhapuchchhre Bank Limited",
        "MACHHAPUCHCHHRE": "Machhapuchchhre Bank Limited",
        "NBL": "Nepal Bank Limited",
        "NABIL": "Nabil Bank Limited",
        "RBBL": "Rastriya Banijya Bank Limited",
        "ADBL": "Agriculture Development Bank Limited",
        "HBL": "Himalayan Bank Limited",
        "NIMB": "Nepal Investment Mega Bank Limited",
        "NICA": "NIC Asia Bank Limited",
        "GIBL": "Global IME Bank Limited",
        "SCBNL": "Standard Chartered Bank Nepal Limited",
        "EBL": "Everest Bank Limited",
        "NSBL": "Nepal SBI Bank Limited",
        "PBL": "Prabhu Bank Limited",
        "CBIL": "Citizens Bank International Limited",
        "LSL": "Laxmi Sunrise Bank Limited",
        "PCBN": "Prime Commercial Bank Nepal",
        "SBL": "Siddhartha Bank Limited",
        "KBL": "Kumari Bank Limited",
        "NMB": "Nepal Merchant Banking and Finance Limited",
        "SANIMA": "Sanima Bank Limited"
    }
    
    # Check for exact matches in abbreviations
    if bank_name_upper in bank_mapping:
        return bank_mapping[bank_name_upper]
    
    # Check for partial matches in full names
    for full_name in bank_mapping.values():
        if bank_name.lower() in full_name.lower():
            return full_name
    
    # If no match found, capitalize each word
    return ' '.join(word.capitalize() for word in bank_name.split())

def generate_calculation_response(calculation_data, query):
    """
    Generate a human-readable response based on calculation details.
    
    Args:
        calculation_data (dict): Dictionary containing calculation type, parameters and results
        query (str): Original query string containing bank and product information
    
    Returns:
        str: Formatted response string with calculation results
    """
    try:
        # Extract basic calculation information
        calc_type = calculation_data.get('calculation_type', 'Unknown')
        params = calculation_data.get('parameters', {})
        result = calculation_data.get('result', {})
        
        # Extract bank and product info from query
        bank_name, product_name = extract_bank_product_info(query)
        
        # Create product context string
        product_context = ""
        if bank_name and product_name:
            product_context = f"for {bank_name}'s {product_name}"
        elif bank_name:
            product_context = f"for {bank_name}"
        elif product_name:
            product_context = f"for the {product_name}"

        # Generate response based on calculation type
        if calc_type == 'Simple Interest':
            if 'min_rate' in result and 'max_rate' in result:
                # Case: Range of interest rates
                response = (
                    f"The Simple Interest {product_context} ranges "
                    f"from Rs.{result.get('min_simple_interest', 'N/A')} at {result.get('min_rate', 'N/A')}% "
                    f"to Rs.{result.get('max_simple_interest', 'N/A')} at {result.get('max_rate', 'N/A')}%. "
                    f"This is calculated on a principal amount of Rs.{params.get('principal', 'N/A')} "
                    f"for a period of {params.get('time', 'N/A')} years."
                )
            else:
                # Case: Single interest rate
                principal = params.get('principal', 0)
                rate = params.get('rate', 0)
                time = params.get('time', 0)
                si_value = result.get('simple_interest', 0)
                if isinstance(si_value, str) and ':' in si_value:
                    si_value = float(si_value.split(':')[1].strip())
                
                response = (
                    f"The Simple Interest {product_context} is Rs.{si_value:.2f}, "
                    f"calculated as: Principal(Rs.{principal}) × Time({time} years) × "
                    f"Rate({rate}%) ÷ 100."
                )

        elif calc_type == 'Compound Interest':
            if 'min_rate' in result and 'max_rate' in result:
                # Case: Range of interest rates
                response = (
                    f"The Compound Interest {product_context} ranges "
                    f"from Rs.{result.get('min_compound_interest', 'N/A')} at {result.get('min_rate', 'N/A')}% "
                    f"to Rs.{result.get('max_compound_interest', 'N/A')} at {result.get('max_rate', 'N/A')}%. "
                    f"This is calculated on a principal of Rs.{params.get('principal', 'N/A')} "
                    f"for {params.get('time', 'N/A')} years, compounded {params.get('frequency', 'annually')}."
                )
            else:
                # Case: Single interest rate
                ci_value = result.get('compound_interest', 0)
                if isinstance(ci_value, str) and ':' in ci_value:
                    ci_value = float(ci_value.split(':')[1].strip())
                
                response = (
                    f"The Compound Interest {product_context} is Rs.{ci_value:.2f}, "
                    f"calculated with Principal: Rs.{params.get('principal', 'N/A')}, "
                    f"Rate: {params.get('rate', 'N/A')}%, Time: {params.get('time', 'N/A')} years, "
                    f"compounded {params.get('frequency', 'annually')}."
                )

        elif calc_type == 'EMI':
            if 'min_rate' in result and 'max_rate' in result:
                response = (
                    f"The Monthly EMI {product_context} ranges "
                    f"from Rs.{result['min_emi']:,.2f} at {result['min_rate']}% "
                    f"to Rs.{result['max_emi']:,.2f} at {result['max_rate']}%. "
                    f"This is calculated for a loan amount of Rs.{params['principal']:,} "
                    f"with a tenure of {params['time']} years."
                )
            else:
                response = (
                    f"The Monthly EMI {product_context} is Rs.{result['emi']:,.2f}, "
                    f"calculated for a loan amount of Rs.{params['principal']:,}, "
                    f"at {result['rate']}% interest for {params['time']} years."
                )

        elif calc_type == 'Amortization Schedule':
            if 'min_rate' in result and 'max_rate' in result:
                # Case: Range of interest rates
                response = (
                    f"The Amortization Schedule {product_context} shows monthly payments "
                    f"ranging from Rs.{result.get('min_monthly_payment', 'N/A')} at {result.get('min_rate', 'N/A')}% "
                    f"to Rs.{result.get('max_monthly_payment', 'N/A')} at {result.get('max_rate', 'N/A')}%. "
                    f"Total interest paid ranges from Rs.{result.get('min_total_interest', 'N/A')} "
                    f"to Rs.{result.get('max_total_interest', 'N/A')}."
                )
            else:
                # Case: Single interest rate
                response = (
                    f"The Amortization Schedule {product_context} shows: \n"
                    f"Monthly Payment: Rs.{result.get('monthly_payment', 'N/A')}\n"
                    f"Total Interest: Rs.{result.get('total_interest', 'N/A')}\n"
                    f"Total Payment: Rs.{result.get('total_payment', 'N/A')}"
                )

        elif calc_type == 'Loan Eligibility':
            # Case: Loan eligibility calculation
            response = (
                f"Based on your monthly income of Rs.{params.get('monthly_income', 'N/A')} "
                f"and existing obligations of Rs.{params.get('monthly_obligations', 'N/A')}, "
                f"your loan eligibility {product_context} is Rs.{result.get('eligible_amount', 'N/A')}. "
                f"Maximum EMI capacity: Rs.{result.get('max_emi_capacity', 'N/A')}."
            )

        else:
            # Default case for unknown calculation types
            response = (
                f"Calculation completed {product_context}. "
                f"Type: {calc_type}. "
                f"Please check the results in the detailed view."
            )

        # Add any warnings or notes from the calculation
        if 'warnings' in result:
            response += f"\nNote: {result['warnings']}"

        return response

    except Exception as e:
        logger.error(f"Error generating response: {e}")
        # Fallback response in case of error
        return f"Calculation completed with {calc_type}. Please check the detailed results."


def extract_calculation_parameters(query):
    """
    Extract calculation parameters from the query.
    """
    # Regular expression patterns to match principal, time, and other terms
    principal_pattern = r"(\d{4,})\s*(rupees|rs|inr)?\s*(principal)?"
    time_pattern = r"(\d+)\s*(years?|months?)"
    compounding_pattern = r"(\d+)\s*(?:compounds?|times)\s*(?:per\s*year|annually)"
    rate_pattern = r"(\d+(?:\.\d+)?)\s*(?:percent|%)"
    emi_pattern = r"emi|installment|payment"
    interest_pattern = r"interest\s*rate"
    amortization_pattern = r"amortization|loan schedule"
    simple_interest_pattern = r"simple\s*interest|si\b|simple\s*int\.?"
    
    # Default values
    principal = None
    time = None
    #rate = None
    rate_min = None
    rate_max = None
    compounding = None
    should_calculate_emi = False
    should_calculate_simple_interest = False
    should_calculate_compound_interest = False
    should_calculate_amortization_schedule = False

    # Check for principal
    principal_match = re.search(principal_pattern, query, re.IGNORECASE)
    if principal_match:
        principal = int(principal_match.group(1))
    
    # Check for time
    time_match = re.search(time_pattern, query, re.IGNORECASE)
    if time_match:
        time = int(time_match.group(1))

    # Check for explicit rate in query
    rate_match = re.search(rate_pattern, query, re.IGNORECASE)
    if rate_match:
        rate = float(rate_match.group(1))
        rate_min = rate
        rate_max = rate
    else:
        # Fetch rates from calculation context
        from calculation import extract_interest_rates, parsed_data
        rank_1_entry = next((item for item in parsed_data if item["rank"] == 1), None)
        if rank_1_entry:
            interest_rates = extract_interest_rates(rank_1_entry["source"])
            if interest_rates:
                if len(interest_rates) >= 2:
                    rate_min = min(interest_rates)
                    rate_max = max(interest_rates)
                else:
                    rate_min = interest_rates[0]
                    rate_max = interest_rates[0]

    # Check for compounding period
    compounding_match = re.search(compounding_pattern, query, re.IGNORECASE)
    if compounding_match:
        compounding = int(compounding_match.group(1))
    else:
        # Fallback checks for specific compounding periods
        if re.search(r'\bannually\b|\byearly\b', query, re.IGNORECASE):
            compounding = 1
        elif re.search(r'\bsemi-annually\b|\bhalf-yearly\b', query, re.IGNORECASE):
            compounding = 2
        elif re.search(r'\bquarterly\b', query, re.IGNORECASE):
            compounding = 4
        elif re.search(r'\bmonthly\b', query, re.IGNORECASE):
            compounding = 12
        elif re.search(r'\bweekly\b', query, re.IGNORECASE):
            compounding = 52
        elif re.search(r'\bdaily\b', query, re.IGNORECASE):
            compounding = 365
        # # Check for rate
        # rate_match = re.search(rate_pattern, query, re.IGNORECASE)
        # if rate_match:
        #     rate = float(rate_match.group(1)) / 100  # Convert percentage to decimal
        
        # Check for calculation type (EMI, Simple Interest, Compound Interest)

    # Check calculation type
    if re.search(amortization_pattern, query, re.IGNORECASE):
        should_calculate_amortization_schedule = True
    elif re.search(emi_pattern, query, re.IGNORECASE):
        should_calculate_emi = True
    elif re.search(r'compound(?:ing)?\s*interest|compound', query, re.IGNORECASE):
        should_calculate_compound_interest = True
        # Ensure there's a default compounding value for compound interest
        if compounding is None:
            compounding = 1  # Default to annual compounding
    elif re.search(simple_interest_pattern or interest_pattern, query, re.IGNORECASE):
        should_calculate_simple_interest = True

    return (
        principal, rate_min, rate_max, time, compounding,
        should_calculate_emi,
        should_calculate_simple_interest,
        should_calculate_compound_interest,
        should_calculate_amortization_schedule
    )

def extract_interest_rates(source):
    """Extract interest rates from source text."""
    if isinstance(source, list):
        rates = []
        for s in source:
            rates.extend(re.findall(r"\d+\.?\d*%", s))
        return [float(rate.strip('%')) for rate in rates if rate]
    elif isinstance(source, str):
        rates = re.findall(r"\d+\.?\d*%", source)
        return [float(rate.strip('%')) for rate in rates if rate]
    return []

def handle_calculation_query(query):
    """Handle calculation query and return results."""
    try:
        # Extract parameters from the query for calculation
        (principal, rate_min, rate_max, time, compounding,
         should_calculate_emi,
         should_calculate_simple_interest,
         should_calculate_compound_interest,
         should_calculate_amortization_schedule) = extract_calculation_parameters(query)

        # Prepare calculation data
        calculation_data = {
            "query": query,
            "calculation_type": None,
            "parameters": {
                # "rate": rate
                # "principal": principal,
                # "time": time,
                # "compounding":compounding
            }
        }
        if rate_min is not None and rate_max is not None:
            if rate_min != rate_max:
                calculation_data["parameters"]["min_rate"] = rate_min
                calculation_data["parameters"]["max_rate"] = rate_max
            else:
                calculation_data["parameters"]["rate"] = rate_min

        if principal is not None:
            calculation_data["parameters"]["principal"] = principal

        if time is not None:
            calculation_data["parameters"]["time"] = time

        # Perform calculations based on type
        if should_calculate_amortization_schedule:
            calculation_data["calculation_type"] = "Amortization Schedule"
            if None in (principal, rate_min, rate_max, time):
                calculation_data["error"] = "Missing parameters for amortization calculation."
            else:
                if  rate_min != rate_max:
                    amort_min = calculate_amortization_schedule(principal, rate_min, time)
                    amort_max = calculate_amortization_schedule(principal, rate_max, time)
                    calculation_data["result"] = {
                        "min_rate": rate_min,
                        "min_total_interest": amort_min[-1]['total_interest'],
                        "min_monthly_payment": amort_min[0]['payment'],
                        "max_rate": rate_max,
                        "max_total_interest": amort_max[-1]['total_interest'],
                        "max_monthly_payment": amort_max[0]['payment']
                            }
                else:
                    amort = calculate_amortization_schedule(principal, rate_min, time)
                    calculation_data["result"] = {
                        "rate": rate_min,
                        "total_interest": amort[-1]['total_interest'],
                        "monthly_payment": amort[0]['payment']
                            }

        elif should_calculate_emi:
            calculation_data["calculation_type"] = "EMI"
            if None in (principal, rate_min, rate_max, time):
                calculation_data["error"] = "Missing parameters for EMI calculation."
            else:
                if rate_min != rate_max:
                    emi_min = calculate_emi(principal, rate_min, time)
                    emi_max = calculate_emi(principal, rate_max, time)
                    calculation_data["result"] = {
                                "min_rate": rate_min,
                                "min_emi": emi_min,
                                "max_rate": rate_max,
                                "max_emi": emi_max
                            }
                else:
                    emi = calculate_emi(principal, rate_min, time)
                    calculation_data["result"] = {
                                "rate": rate_min,
                                "emi": emi
                            }

        elif should_calculate_simple_interest:
            calculation_data["calculation_type"] = "Simple Interest"
            if None in (principal, rate_min, rate_max, time):
                calculation_data["error"] = "Missing parameters for simple interest calculation."
            else:
                if rate_min != rate_max:
                    si_min = calculate_simple_interest(principal, rate_min, time)
                    si_max = calculate_simple_interest(principal, rate_max, time)
                    calculation_data["result"] = {
                                "min_rate": rate_min,
                                "min_simple_interest": si_min,
                                "max_rate": rate_max,
                                "max_simple_interest": si_max
                            }
                else:
                    si = calculate_simple_interest(principal, rate_min, time)
                    calculation_data["result"] = {
                                "rate": rate_min,
                                "simple_interest": si
                            }

        elif should_calculate_compound_interest:
            calculation_data["calculation_type"] = "Compound Interest"
            if None in (principal, rate_min, rate_max, time, compounding):
                calculation_data["error"] = "Missing parameters for compound interest calculation."
            else:
                if rate_min != rate_max:
                    ci_min = calculate_compound_interest(principal, rate_min, time, compounding)
                    ci_max = calculate_compound_interest(principal, rate_max, time, compounding)
                    calculation_data["result"] = {
                                "min_rate": rate_min,
                                "min_compound_interest": ci_min,
                                "max_rate": rate_max,
                                "max_compound_interest": ci_max
                            }
                else:
                    ci = calculate_compound_interest(principal, rate_min, time, compounding)
                    calculation_data["result"] = {
                                "rate": rate_min,
                                "compound_interest": ci
                            }
        else:
            calculation_data["calculation_type"] = "Unknown"
            print("No specific calculation found")

        # Generate human-readable response
        calculation_data['human_response'] = generate_calculation_response(calculation_data, query)

        # Save calculation data
        with open("calculation_data.json", "w", encoding="utf-8") as file:
            json.dump(calculation_data, file, indent=4)
            logger.info("Calculation data saved to calculation_data.json")

        return calculation_data

    except Exception as e:
        logger.error(f"Error in calculation processing: {e}")
        return {
            "status": "error",
            "message": f"Calculation error: {str(e)}"
        }