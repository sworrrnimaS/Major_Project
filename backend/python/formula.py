import pandas as pd


def calculate_amortization_schedule(principal, annual_rate, years):
    """
    Calculate loan amortization schedule.
    Args:
    - principal: Loan amount
    - annual_rate: Annual interest rate (percentage)
    - years: Loan term in years
    """
    if principal <= 0 or annual_rate <= 0 or years <= 0:
        return "Invalid input: Principal, annual rate, and years must be greater than zero."

    print(f"[Calculate_amortization_schedule] Calculating amortization schedule for P={principal}, Rate={annual_rate}, Years={years}.")

    monthly_rate = annual_rate / 100 / 12
    months = years * 12
    emi = float(calculate_emi(principal, annual_rate, years))  # Ensure EMI is a float

    # Data lists for amortization schedule
    schedule = []

    # Calculate each month's amortization details
    for month in range(1, months + 1):
        interest_payment = principal * monthly_rate
        principal_payment = emi - interest_payment
        principal -= principal_payment

        schedule.append({
            "Month": month,
            "EMI": round(emi, 2),
            "Principal Payment": round(principal_payment, 2),
            "Interest Payment": round(interest_payment, 2),
            "Remaining Balance": round(principal, 2)
        })

    # Convert the schedule to a DataFrame for easier reading
    amortization_df = pd.DataFrame(schedule)

    print(f"[Calculate_amortization_schedule] Amortization schedule calculated.")

    # Optionally, print the amortization schedule
    print(amortization_df.to_string(index=False))

    return amortization_df.to_string(index=False)  # Return as string for terminal output


def calculate_emi(principal, annual_rate, years):
    """
    Calculate the EMI for a loan.
    Args:
    - principal: Loan amount
    - annual_rate: Annual interest rate (percentage)
    - years: Loan term in years
    """
    monthly_rate = (annual_rate / 100) / 12
    months = years * 12

    # EMI formula
    emi = principal * monthly_rate * (1 + monthly_rate) ** months / (((1 + monthly_rate) ** months) - 1)

    print(f"Calculating EMI for P={principal}, Rate={annual_rate}, Years={years}.")
    print(f"EMI calculated: {emi:.2f}")

    return emi  # This will be a float


def calculate_simple_interest(principal: float, annual_rate: float, years: int):
    """
    Calculate Simple Interest.
    """
    print(
        f"Calculating Simple Interest for P={principal}, Rate={annual_rate}, Years={years}.")

    try:
        simple_interest = (principal * annual_rate * years) / 100
        total_amount=simple_interest+principal
        print(f"Simple Interest: {simple_interest:.2f}  Total Amount:{total_amount}")
        return f"Simple Interest: {simple_interest:.2f}"
    except Exception as e:
        print(f"Simple Interest Error: {e}")
        return "Error calculating Simple Interest."


def calculate_compound_interest(principal: float, annual_rate: float, years: int,n:int):
    """
    Calculate Compound Interest.
    """
    print(
        f"Calculating Compound Interest for P={principal}, Rate={annual_rate}, Years={years}, Compounding {n} times per year.")

    try:

        total_amount = principal * ((1 + annual_rate*0.01 / n) ** (n * years))
        compound_interest=total_amount-principal
    
        print(
            f"Compound Interest: {compound_interest:.2f}, Total Amount: {total_amount:.2f}")
        return f"Compound Interest: {compound_interest:.2f}, Total Amount: {total_amount:.2f}"
    except Exception as e:
        print(f"Compound Interest Error: {e}")
        return "Error calculating Compound Interest."


# calculate_simple_interest(11000,2.0,4) #principal, annual rate in percent,time in years
# calculate_compound_interest(11000,2,5,2) #principal, annual rate in percent,time in years, no of compoudings in a year
# calculate_emi(11000,2,5) #principal, annual rate in percent, time in years
# calculate_amortization_schedule(11000,6,2) #principal, annual rate in percent, time in years