import { Check, X } from "lucide-react";
import "./upgradeModal.css";
/* eslint-disable react/prop-types */
const plans = [
  // {
  //   name: "Basic",
  //   price: "Free",
  //   features: [
  //     "Account balance inquiries",
  //     "Branch and ATM locator",
  //     "Basic FAQs",
  //     "General banking information",
  //   ],
  // },
  {
    name: "Pro",
    price: "Rs. 500",
    features: [
      "All Basic features",
      "Transaction history queries",
      "Credit card bill reminders",
      "Loan EMI calculators",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    price: "Rs. 5000",
    features: [
      "All Pro features",
      "Personalized financial advice",
      "Integration with third-party financial tools",
      "Custom chatbot workflows",
      "24/7 dedicated support",
      "Team management and role-based access",
      "Analytics dashboard for customer insights",
    ],
  },
];

const UpgradeModal = ({ onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">Upgrade Your Plan</h3>
          <button onClick={onClose} className="close-button">
            <X className="class-icon" />
          </button>
        </div>

        <div className="plans-grid">
          {plans.map((plan) => (
            <div key={plan.name} className="plan-card">
              <div className="button-gap">
                <div>
                  <h4 className="plan-title">{plan.name}</h4>
                  <p className="plan-price">
                    {plan.price}
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                      /month
                    </span>
                  </p>
                  <ul className="features-list">
                    {plan.features.map((feature) => (
                      <li key={feature} className="feature-item">
                        <Check className="check-icon" />
                        <span className="feature-text">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <button className="choose-button">Choose {plan.name}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
