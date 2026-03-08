import mongoose from "mongoose";

const userActionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    action: {
      type: String,
      enum: ["view", "add_to_cart", "purchase"], // يمكن إضافة المزيد من الأنواع لاحقًا
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,  // إذا كان التفاعل يتعلق بإضافة منتج إلى السلة أو شراءه، يمكن تحديد الكمية
      required: function() { return this.action === "add_to_cart" || this.action === "purchase"; }
    },
    status: {
      type: String,
      enum: ['successful', 'failed', 'pending'],
      default: 'pending', // يمكن استخدام هذا لتحديد حالة التفاعل (ناجح، فشل، أو معلق)
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    details: {
      type: String,
      required: false, // يمكنك إضافة تفاصيل إضافية حول التفاعل إذا لزم الأمر
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// نموذج مخصص
const UserAction = mongoose.model("UserAction", userActionSchema);

export default UserAction;
