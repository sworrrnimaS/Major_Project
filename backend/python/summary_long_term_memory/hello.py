import sys

# Get the argument passed from JavaScript
if len(sys.argv) > 1:
    variable_from_js = sys.argv[1]
    print(f"Received from JS: {variable_from_js}")
else:
    print("No argument received")

print("hello world!")