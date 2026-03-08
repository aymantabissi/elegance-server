import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reference:{

        type:String,
        required: true
    },
    currency:{
        type: String,
        required: true
    },
    status:{
        type: String,
        default: "Pending"
    },
    ampount:{
        type: Number,
        default:0 
    },

}, { timestamps: true });
const Payment = mongoose.model('Payment', commentSchema);
export default Payment;