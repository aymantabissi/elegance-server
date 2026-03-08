import express from "express";
import mongoose from "mongoose";
import UserAction from "../models/user_actions.js";

const router = express.Router();

// المسار الذي يتتبع الإجراءات التي يقوم بها المستخدم
router.post("/track-action", async (req, res) => {
  try {
    const { user_id, product_id, action } = req.body;

    // تحقق من وجود الحقول المطلوبة
    if (!user_id || !product_id || !action) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // تحقق من صحة قيم user_id و product_id باستخدام ObjectId
    if (!mongoose.Types.ObjectId.isValid(user_id) || !mongoose.Types.ObjectId.isValid(product_id)) {
      return res.status(400).json({ error: "Invalid user_id or product_id" });
    }

    // تحقق من أن action يحتوي على قيمة صحيحة (view أو add_to_cart)
    const validActions = ["view", "add_to_cart"];
    if (!validActions.includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }

    // إضافة الإجراء إلى قاعدة البيانات (الـ MongoDB)
    const tracked = await UserAction.create({ user_id, product_id, action });

    // إعادة الرد بنجاح مع البيانات المدخلة
    res.status(200).json({
      message: "Action tracked successfully",
      data: tracked,
    });
  } catch (err) {
    console.error("Error tracking action:", err);
    // رد بخطأ داخلي إذا فشل في إضافة الإجراء
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
