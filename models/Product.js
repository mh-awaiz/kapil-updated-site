import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    actualPrice: { type: Number },
    images: { type: [String], default: [] },
    category: {
      type: String,
      enum: ["stationery", "groceries"],
      default: "stationery",
    },
    subcategory: {
      type: String,
      default: "",
      // stationery: notebooks | pens | art | geometry | other
      // groceries: snacks_drinks | beauty_personal_care | home_lifestyle | food_veg | food_nonveg
    },
    unit: { type: String, default: "" }, // e.g. "500g", "1L", "Pack of 5"
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Fix 500 errors on Vercel
export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
