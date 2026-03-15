import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const limit = parseInt(searchParams.get("limit") || "100");

    const query = {};
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;

    const products = await Product.find(query).sort({ createdAt: -1 }).limit(limit);
    return Response.json(products);
  } catch (error) {
    return Response.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
