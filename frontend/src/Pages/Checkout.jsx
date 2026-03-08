import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaCreditCard, FaCashRegister } from "react-icons/fa";

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  const product = location.state?.product;

  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
    email: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("creditCard");
  const [currentStep, setCurrentStep] = useState(1);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }));
  };

  const handleNextStep = () => {
    for (let key in shippingInfo) {
      if (!shippingInfo[key]) {
        alert(`${key} is required`);
        return;
      }
    }
    toast.success("Personal Information Successfully Submitted!");
    setCurrentStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }

    if (paymentMethod === "creditCard") {
      navigate("/payment", { state: { shippingInfo, product, paymentMethod } });
    } else {
      toast.success("✅ Order confirmed. You will pay with Cash on Delivery.");
      navigate("/order-success", { state: { shippingInfo, product, paymentMethod } });
    }
  };

  const totalPrice = product?.price;

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-lg border border-gray-300">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          {currentStep === 1 ? "Billing Details" : "Payment Details"}
        </h2>

        {currentStep === 1 && (
          <form onSubmit={handleNextStep} className="space-y-8">
            <div className="space-y-4">
              {[
                { label: "Full Name", name: "name" },
                { label: "Street Address", name: "address" },
                { label: "City", name: "city" },
                { label: "Postal Code", name: "postalCode" },
                { label: "Country", name: "country" },
                { label: "Phone Number", name: "phone" },
                { label: "Email Address", name: "email", type: "email" },
              ].map(({ label, name, type = "text" }) => (
                <div key={name}>
                  <label className="block text-lg font-semibold text-gray-700">{label}</label>
                  <input
                    type={type}
                    name={name}
                    value={shippingInfo[name]}
                    onChange={handleInputChange}
                    required
                    className="w-full p-4 mt-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              ))}

              <div className="flex justify-center mt-8">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full py-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Next
                </button>
              </div>
            </div>
          </form>
        )}

        {currentStep === 2 && (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-gray-800">Payment Method</h3>
              <div className="flex items-center mt-4 space-x-6">
                <input
                  type="radio"
                  id="cashOnDelivery"
                  name="paymentMethod"
                  value="cashOnDelivery"
                  onChange={() => setPaymentMethod("cashOnDelivery")}
                  checked={paymentMethod === "cashOnDelivery"}
                  className="mr-2"
                />
                <label htmlFor="cashOnDelivery" className="text-lg text-gray-700">
                  <FaCashRegister className="text-green-500 inline-block mr-2" />
                  Cash on Delivery
                </label>
              </div>
              <div className="flex items-center mt-4 space-x-6">
                <input
                  type="radio"
                  id="creditCard"
                  name="paymentMethod"
                  value="creditCard"
                  onChange={() => setPaymentMethod("creditCard")}
                  checked={paymentMethod === "creditCard"}
                  className="mr-2"
                />
                <label htmlFor="creditCard" className="text-lg text-gray-700">
                  <FaCreditCard className="text-yellow-500 inline-block mr-2" />
                  Credit Card
                </label>
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <button
                type="submit"
                className="w-full py-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Place Order
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 p-4 bg-gray-50 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800">Order Summary</h3>
          <div className="flex items-center space-x-4 mt-4">
            <img
              src={product?.image}
              alt={product?.name}
              className="w-20 h-20 object-cover rounded-md shadow-md"
            />
            <div>
              <p className="font-semibold text-gray-700">{product?.name}</p>
              <p className="text-sm text-gray-500">${product?.price}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-lg font-semibold text-gray-800">
            <span>Total:</span>
            <span>${totalPrice}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
