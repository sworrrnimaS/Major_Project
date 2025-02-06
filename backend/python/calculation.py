import re
import json
from formula import calculate_simple_interest,calculate_compound_interest,calculate_emi,calculate_amortization_schedule

with open('calculationcontext.json', 'r') as file:
    data = json.load(file)

# data = [
#     "{\"content\": \"bank_bank_0.citizens_bank_international(cibl).interest_rates_information.loan_products.consumer_auto_loan_commercial\", \"source\": \"Up to 5 Years: 10.50%\", \"score\": 0.8381474554538727, \"similarity\": 0.7302457094192505, \"rank\": 1}",
#     "{\"content\": \"bank_bank_0.citizens_bank_international(cibl).interest_rates_information.loan_products.consumer_auto_loan_private\", \"source\": \"Up to 5 Years: 9.50%, Above 5 Years: 11.50%\", \"score\": 0.7929167319939221, \"similarity\": 0.7391247749328613, \"rank\": 2}",
#     "{\"content\": \"bank_bank_0.citizens_bank_international(cibl).interest_rates_information.loan_products.auto_loan fixed rate\", \"source\": \"private: Up to 5 Years: 11.50%, 6-10 Years: 11.75%; commercial: Up to 5 Years: 11.75%\", \"score\": 0.7342774193547593, \"similarity\": 0.7195730209350586, \"rank\": 3}",
#     "{\"content\": \"bank_bank_0.citizens_bank_international(cibl).interest_rates_information.loan_products.consumer_fast_track_loan\", \"source\": \"Minimum Premium: 3.00%, Maximum Premium: 4.00%\", \"score\": 0.6719265112196218, \"similarity\": 0.6802452802658081, \"rank\": 5}",
#     "{\"content\": \"bank_bank_0.citizens_bank_international(cibl).interest_rates_information.loan_products.consumer_equipment_loan\", \"source\": \"Minimum Premium: 3.00%, Maximum Premium: 4.00%\", \"score\": 0.6695085506801774, \"similarity\": 0.6709102988243103, \"rank\": 6}",
#     "{\"content\": \"bank_bank_0.citizens_bank_international(cibl).interest_rates_information.loan_products.consumer_odop_loan\", \"source\": \"Minimum Premium: 3.00%, Maximum Premium: 4.00%\", \"score\": 0.6591205041771104, \"similarity\": 0.6535968780517578, \"rank\": 7}",
#     "{\"content\": \"bank_bank_0.citizens_bank_international(cibl).interest_rates_information.loan_products.consumer_home_loan\", \"source\": \"Up to 5 Years: 9.99%, Above 5 Years: 11.99%\", \"score\": 0.6583500843410661, \"similarity\": 0.6523128747940063, \"rank\": 8}",
#     "{\"content\": \"bank_bank_0.citizens_bank_international(cibl).interest_rates_information.loan_products.consumer_education_loan\", \"source\": \"Minimum Premium: 3.00%, Maximum Premium: 3.50%\", \"score\": 0.6558218341236284, \"similarity\": 0.6480991244316101, \"rank\": 9}",
#     "{\"content\": \"bank_bank_0.citizens_bank_international(cibl).interest_rates_information.loan_products.consumer_agriculture_enterprise_loan\", \"source\": \"Minimum Premium: 2.00%, Maximum Premium: 2.00%\", \"score\": 0.6496688255583059, \"similarity\": 0.6431491374969482, \"rank\": 10}",
#     "{\"content\": \"bank_bank_11.laxmi_sunrise_bank_limited(lsl).loan_products[1].auto_loan.interest_rate\", \"source\": \"11.25% per annum\", \"score\": 0.6839757893430627, \"similarity\": 0.6296525001525879, \"rank\": 4}"
# ]

# Parse each JSON string into a dictionary and clean up the data
parsed_data = []
for item in data:
    entry = json.loads(item)  # Convert the string to a dictionary
    content = entry["content"]
    source = entry["source"]

    # Extract interest rates and clean the source
    if "per annum" in source:
        source = source.replace(" per annum", "")  # Remove "per annum" from the string
    
    # Handle cases where the source contains multiple interest rates
    if "Up to" in source or "Above" in source or "Minimum" in source or "Maximum" in source:
        # Split the rates by commas if there are multiple rates
        source = source.split(",")  # This will give a list of rates
    
    parsed_data.append({
        "content": content,
        "source": source,
        "rank": entry["rank"]
    })

   

# Print the final parsed data
with open("preprocesscontext.json", "w", encoding="utf-8") as file:
    json.dump(parsed_data, file, indent=4)

# Sample parsed_data
# parsed_data = [
#     {
#         "content": "bank_bank_0.citizens_bank_international(cibl).interest_rates_information.loan_products.consumer_auto_loan_commercial",
#         "source": ["Up to 5 Years: 10.50%"],
#         "rank": 1
#     },
#     {
#         "content": "bank_bank_0.citizens_bank_international(cibl).interest_rates_information.loan_products.consumer_auto_loan_private",
#         "source": ["Up to 5 Years: 9.50%", " Above 5 Years: 11.50%"],
#         "rank": 2
#     },
#     {
#         "content": "bank_bank_0.citizens_bank_international(cibl).interest_rates_information.loan_products.auto_loan fixed rate",
#         "source": ["private: Up to 5 Years: 11.50%", " 6-10 Years: 11.75%; commercial: Up to 5 Years: 11.75%"],
#         "rank": 3
#     },
#     {
#         "content": "bank_bank_0.citizens_bank_international(cibl).interest_rates_information.loan_products.consumer_fast_track_loan",
#         "source": ["Minimum Premium: 3.00%", " Maximum Premium: 4.00%"],
#         "rank": 5
#     },
#     {
#         "content": "bank_bank_0.citizens_bank_international(cibl).interest_rates_information.loan_products.consumer_equipment_loan",
#         "source": ["Minimum Premium: 3.00%", " Maximum Premium: 4.00%"],
#         "rank": 6
#     },
#     {
#         "content": "bank_bank_0.citizens_bank_international(cibl).interest_rates_information.loan_products.consumer_odop_loan",
#         "source": ["Minimum Premium: 3.00%", " Maximum Premium: 4.00%"],
#         "rank": 7
#     },
#     {
#         "content": "bank_bank_0.citizens_bank_international(cibl).interest_rates_information.loan_products.consumer_home_loan",
#         "source": ["Up to 5 Years: 9.99%", " Above 5 Years: 11.99%"],
#         "rank": 8
#     },
#     {
#         "content": "bank_bank_0.citizens_bank_international(cibl).interest_rates_information.loan_products.consumer_education_loan",
#         "source": ["Minimum Premium: 3.00%", " Maximum Premium: 3.50%"],
#         "rank": 9
#     },
#     {
#         "content": "bank_bank_0.citizens_bank_international(cibl).interest_rates_information.loan_products.consumer_agriculture_enterprise_loan",
#         "source": ["Minimum Premium: 2.00%", " Maximum Premium: 2.00%"],
#         "rank": 10
#     },
#     {
#         "content": "bank_bank_11.laxmi_sunrise_bank_limited(lsl).loan_products[1].auto_loan.interest_rate",
#         "source": "11.25%",
#         "rank": 4
#     }
# ]
# Load data from preprocesscontext.json


with open('preprocesscontext.json', 'r') as file:
    preprocess_data = json.load(file)

# Extracting parsed_data from the loaded JSON
parsed_data = []

# Loop through the preprocess_data to extract the necessary values
for entry in preprocess_data:
    parsed_entry = {
        "content": entry.get("content"),
        "source": entry.get("source", []),
        "rank": entry.get("rank")
    }
    parsed_data.append(parsed_entry)

# Function to extract interest rates
def extract_interest_rates(source):
    if isinstance(source, list):  # If source is a list
        rates = []
        for s in source:
            rates.extend(re.findall(r"\d+\.?\d*%", s))  # Extract percentages from each string
        rates = [rate.strip('%') for rate in rates]  # Remove '%' from each rate
        rates = [float(rate) for rate in rates if rate]  # Convert to float
        return rates
    elif isinstance(source, str):  # If source is a string
        rates = re.findall(r"\d+\.?\d*%", source)  # Extract percentages
        rates = [rate.strip('%') for rate in rates]  # Remove '%'
        rates = [float(rate) for rate in rates if rate]  # Convert to float
        return rates
    else:
        return []  # Return empty list if source is not a string or list

# Find the first item where rank == 1
rank_1_entry = next((item for item in parsed_data if item["rank"] == 1), None)

# Extract interest rates from the source field
if rank_1_entry:
    interest_rates = extract_interest_rates(rank_1_entry["source"])
else:
    interest_rates = "No matching rank found"

# Check if interest_rates is a string or list
if isinstance(interest_rates, str):
    # If it's a string, perform the .lower() check
    if interest_rates.lower() in ["null", "none"]:
        print("Interest rate not found. Cannot perform calculation")
    else:
        # Print the output
        print(interest_rates)
        
        if len(interest_rates)<2:
            calculate_emi(11000,interest_rates[0],2)
        if len(interest_rates) >= 2:
            # Extract the first and last elements
            min_rate = interest_rates[0]  # First element
            max_rate = interest_rates[-1]  # Last element
            
            # Print the results
            print(f"For Minimum Interest Rate: {min_rate}:")
            calculate_emi(11000,min_rate,2)
            print(f"For Maximum Interest Rate: {max_rate}:")
            calculate_emi(11000,max_rate,2)

elif isinstance(interest_rates, list):
    # If it's a list, check if all rates are "null" or "none"
    # Modify the check to only apply `.lower()` to string values
    if all(isinstance(rate, str) and rate.lower() in ["null", "none"] for rate in interest_rates):
        print("Interest rate not found. Cannot perform calculation")
    else:
        # Print the output (filtering out "null"/"none" string values)
        rates=[rate for rate in interest_rates if not isinstance(rate, str) or rate.lower() not in ["null", "none"]]

        if len(rates)<2:
            calculate_emi(11000,rates[0],5)
        if len(rates) >= 2:
            # Extract the first and last elements
            min_rate = rates[0]  # First element
            max_rate = rates[-1]  # Last element
            
            # Print the results
            print(f"For Minimum Interest Rate: {min_rate}:")
            calculate_emi(11000,min_rate,5)
            print(f"For Maximum Interest Rate: {max_rate}:")
            calculate_emi(11000,max_rate,5)
else:
    print("Unknown data type for interest_rates")

def handle_calculation(query):
    """
    Handles calculation-based queries and returns the computed result.
    """
    try:
        # Extract numbers and keywords from the query
        numbers = [float(num) for num in re.findall(r"\d+\.?\d*", query)]
        if "simple interest" in query.lower():
            if len(numbers) >= 3:
                principal, rate, time = numbers[:3]
                return {"result": calculate_simple_interest(principal, rate, time)}
        elif "compound interest" in query.lower():
            if len(numbers) >= 4:
                principal, rate, time, compounds = numbers[:4]
                return {"result": calculate_compound_interest(principal, rate, time, compounds)}
        elif "emi" in query.lower():
            if len(numbers) >= 3:
                principal, rate, time = numbers[:3]
                return {"result": calculate_emi(principal, rate, time)}
        elif "amortization" in query.lower():
            if len(numbers) >= 3:
                principal, rate, time = numbers[:3]
                return {"result": calculate_amortization_schedule(principal, rate, time)}

        return {"error": "Could not determine calculation parameters. Please check your query."}
    
    except Exception as e:
        return {"error": f"Calculation error: {e}"}