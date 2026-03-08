import { useState } from "react";
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from "@stripe/react-stripe-js";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const Payment = () => {
  const stripe = useStripe();
  const elements = useElements();
  const location = useLocation();
  const navigate = useNavigate();

  const { product, shippingInfo, paymentMethod } = location.state || {};

  const [isProcessing, setIsProcessing] = useState(false);
  const amount = product?.price * 100; // amount in cents

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements || !product) return;

    setIsProcessing(true);
    try {

      // 1. Create Payment Intent
      const { data } = await axios.post("http://localhost:5000/api/payments/create-payment-intent", {
        amount,
        
      });

      const clientSecret = data.clientSecret;

      // 2. Confirm Card Payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
        },
      });

      // 3. Handle Result
      if (result.error) {
        alert(result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        alert("✅ Payment successful!");

        navigate("/order-success", {
          state: { product, shippingInfo, paymentMethod },
        });
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form
  onSubmit={handlePaymentSubmit}
  className="max-w-lg mx-auto mt-16 bg-white rounded-xl shadow-xl p-8 space-y-6 border border-gray-100"
>
  <h2 className="text-3xl font-semibold text-center text-gray-800">Payment Details</h2>

  {/* Card Number */}
  <div>
    <label className="block text-gray-700 text-sm font-medium mb-1">Card Number</label>
    <div className="border rounded-md p-3 bg-gray-50 shadow-inner focus-within:ring-2 focus-within:ring-blue-500 transition">
      <CardNumberElement
        options={{ style: { base: { fontSize: '16px' } } }}
      />
    </div>
  </div>

  {/* Expiry Date & CVC */}
  <div className="grid grid-cols-2 gap-4">
    <div>
      <label className="block text-gray-700 text-sm font-medium mb-1">Expiry Date</label>
      <div className="border rounded-md p-3 bg-gray-50 shadow-inner focus-within:ring-2 focus-within:ring-blue-500 transition">
        <CardExpiryElement
          options={{ style: { base: { fontSize: '16px' } } }}
        />
      </div>
    </div>
    <div>
      <label className="block text-gray-700 text-sm font-medium mb-1">CVC</label>
      <div className="border rounded-md p-3 bg-gray-50 shadow-inner focus-within:ring-2 focus-within:ring-blue-500 transition">
        <CardCvcElement
          options={{ style: { base: { fontSize: '16px' } } }}
        />
      </div>
    </div>
  </div>

  <button
    type="submit"
    disabled={!stripe || isProcessing}
    className={`w-full py-3 text-white font-semibold rounded-md transition duration-300 ${
      isProcessing
        ? 'bg-gray-400 cursor-not-allowed'
        : 'bg-blue-600 hover:bg-blue-700'
    }`}
  >
    {isProcessing ? "Processing..." : `Pay $${product?.price}`}
  </button>
</form>
  );
};

export default Payment;
