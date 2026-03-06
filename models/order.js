import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },

    products: [{
        product: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Product", 
            required: true 
        },
        quantity: { 
            type: Number, 
            required: true 
        }
    }],

    totalAmount: { 
        type: Number, 
        required: true 
    },

    // ✅ add customer info
customerInfo: {
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  postalCode: String,
  country: String,
  email: String,
  note: String,
},


    status: { 
        type: String, 
        enum: ["pending", "confirmed", "shipped", "delivered"], 
        default: "pending" 
    }

}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

export default Order;
