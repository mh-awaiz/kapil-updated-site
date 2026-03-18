"use client";

import { useEffect, useState } from "react";

export default function AdminPanel() {
  const [tab, setTab] = useState("orders");
  const [adminKey, setAdminKey] = useState("");
  const [authorized, setAuthorized] = useState(false);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#22323c]">
        <div className="bg-[#1a2830] p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-white/5">
          <h2 className="text-2xl font-black text-[#17d492] mb-6">Admin Login</h2>
          <input
            type="password"
            placeholder="Enter Admin Key"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && adminKey && setAuthorized(true)}
            className="w-full px-4 py-3 rounded-xl bg-[#22323c] border border-white/10 text-white focus:outline-none focus:border-[#17d492] mb-4 transition"
          />
          <button
            onClick={() => adminKey && setAuthorized(true)}
            className="w-full bg-[#17d492] text-[#22323c] py-3 rounded-xl font-black hover:bg-[#14b87e] transition"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: "orders", label: "📦 Orders" },
    { id: "add-product", label: "➕ Add Product" },
    { id: "view-products", label: "🗂️ Products" },
  ];

  return (
    <div className="min-h-screen bg-[#22323c] text-[#f5f5f5] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <h1 className="text-3xl font-black text-[#17d492] mb-8">Admin Panel</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2.5 rounded-xl font-black text-sm whitespace-nowrap transition ${
                tab === t.id
                  ? "bg-[#17d492] text-[#22323c]"
                  : "bg-[#1a2830] text-white border border-white/10 hover:border-[#17d492]/40"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "orders" && <OrdersDashboard adminKey={adminKey} />}
        {tab === "add-product" && <ProductsDashboard adminKey={adminKey} />}
        {tab === "view-products" && <ViewProducts adminKey={adminKey} />}
      </div>
    </div>
  );
}

/* ============ ORDERS ============ */
function OrdersDashboard({ adminKey }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [trackingModal, setTrackingModal] = useState(null);
  const [trackForm, setTrackForm] = useState({ status: "confirmed", message: "", lat: "", lng: "" });

  const STATUS_LABELS = {
    placed: "Placed", confirmed: "Confirmed", preparing: "Preparing",
    out_for_delivery: "Out for Delivery", delivered: "Delivered", cancelled: "Cancelled",
  };
  const STATUS_COLORS = {
    placed: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    confirmed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    preparing: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    out_for_delivery: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    delivered: "bg-[#17d492]/20 text-[#17d492] border-[#17d492]/30",
    cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders", { headers: { "x-admin-key": adminKey } });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch { setOrders([]); }
    finally { setLoading(false); }
  };

  const markCompleted = async (orderId) => {
    if (!confirm("Mark this order as completed and remove it?")) return;
    await fetch("/api/admin/orders/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
      body: JSON.stringify({ orderId }),
    });
    load();
  };

  const updateTracking = async () => {
    const res = await fetch("/api/admin/orders/track", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
      body: JSON.stringify({
        orderId: trackingModal,
        ...trackForm,
        lat: trackForm.lat ? parseFloat(trackForm.lat) : undefined,
        lng: trackForm.lng ? parseFloat(trackForm.lng) : undefined,
      }),
    });
    if (res.ok) { setTrackingModal(null); load(); }
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#17d492] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Filter Pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {["all", "placed", "confirmed", "preparing", "out_for_delivery", "delivered"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-black whitespace-nowrap uppercase tracking-wider transition ${
              filter === s ? "bg-[#17d492] text-[#22323c]" : "bg-[#1a2830] text-slate-400 border border-white/10 hover:border-[#17d492]/30"
            }`}
          >
            {s === "all" ? `All (${orders.length})` : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 bg-[#1a2830] rounded-2xl border border-white/5">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-slate-400 font-bold">No orders found</p>
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((order) => (
          <div key={order.orderId} className="bg-[#1a2830] rounded-2xl p-5 border border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="font-black text-white">#{order.orderId}</p>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${STATUS_COLORS[order.status] || "bg-white/10 text-white border-white/20"}`}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    order.category === "groceries" ? "bg-green-500/20 text-green-400" : order.category === "mixed" ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"
                  }`}>
                    {order.category || "stationery"}
                  </span>
                  {order.paymentMethod === "razorpay" && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#17d492]/20 text-[#17d492] font-bold">
                      💳 Paid
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  {new Date(order.timestamp || order.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setTrackingModal(order.orderId); setTrackForm({ status: order.status || "confirmed", message: "", lat: "", lng: "" }); }}
                  className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-lg hover:bg-blue-500/30 transition font-bold"
                >
                  📍 Update Tracking
                </button>
                <a
                  href={`/track/${order.orderId}`}
                  target="_blank"
                  className="text-xs bg-[#17d492]/10 text-[#17d492] border border-[#17d492]/30 px-3 py-1.5 rounded-lg hover:bg-[#17d492]/20 transition font-bold"
                >
                  🗺️ Live Track
                </a>
                <button
                  onClick={() => markCompleted(order.orderId)}
                  className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/30 transition font-bold"
                >
                  ✓ Complete
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 border-t border-white/5 pt-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-bold">Customer</p>
                <p className="font-bold text-white">{order.customer?.name}</p>
                <p className="text-sm text-slate-400">{order.customer?.phone}</p>
                <p className="text-sm text-slate-400">{order.customer?.email}</p>
                <p className="text-xs text-slate-500 mt-1">{order.customer?.address}</p>
                {order.customer?.isJamiaStudent && (
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    <span className="text-xs text-[#17d492] bg-[#17d492]/10 px-2 py-0.5 rounded-full font-bold">Jamia Student</span>
                    {order.customer?.timeSlot && (
                      <span className="text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">🕐 {order.customer.timeSlot}</span>
                    )}
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-bold">Items</p>
                {order.items?.map((item, i) => (
                  <div key={i}>
                    <p className="text-sm font-bold text-white">
                      {item.title} × {item.quantity} = ₹{item.price * item.quantity}
                    </p>
                    {item.description && (
                      <p className="text-xs text-slate-500">↳ {item.description}</p>
                    )}
                  </div>
                ))}
                <div className="flex gap-4 mt-2 pt-2 border-t border-white/5">
                  <p className="text-sm font-black text-[#17d492]">Total: ₹{order.totalAmount}</p>
                  <p className="text-sm text-slate-500">Delivery: ₹{order.deliveryCharge}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tracking Modal */}
      {trackingModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4" onClick={() => setTrackingModal(null)}>
          <div className="bg-[#1a2830] rounded-2xl p-6 w-full max-w-md border border-[#17d492]/20" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-black text-[#17d492] mb-5">Update Tracking – #{trackingModal}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block font-bold uppercase tracking-wider">Status</label>
                <select
                  value={trackForm.status}
                  onChange={(e) => setTrackForm({ ...trackForm, status: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#22323c] border border-white/10 text-white focus:outline-none focus:border-[#17d492]"
                >
                  {["placed", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"].map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block font-bold uppercase tracking-wider">Custom Message (optional)</label>
                <input
                  placeholder="e.g. Out for delivery from Gate 7"
                  value={trackForm.message}
                  onChange={(e) => setTrackForm({ ...trackForm, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#22323c] border border-white/10 text-white focus:outline-none focus:border-[#17d492]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block font-bold uppercase tracking-wider">Latitude</label>
                  <input
                    type="number"
                    placeholder="28.5600"
                    value={trackForm.lat}
                    onChange={(e) => setTrackForm({ ...trackForm, lat: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#22323c] border border-white/10 text-white focus:outline-none focus:border-[#17d492]"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block font-bold uppercase tracking-wider">Longitude</label>
                  <input
                    type="number"
                    placeholder="77.2700"
                    value={trackForm.lng}
                    onChange={(e) => setTrackForm({ ...trackForm, lng: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#22323c] border border-white/10 text-white focus:outline-none focus:border-[#17d492]"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500">💡 Enter delivery partner's GPS coordinates to show live location on map</p>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={updateTracking} className="flex-1 bg-[#17d492] text-[#22323c] py-3 rounded-xl font-black hover:bg-[#14b87e] transition">
                Update
              </button>
              <button onClick={() => setTrackingModal(null)} className="flex-1 border border-white/20 py-3 rounded-xl font-bold hover:bg-white/5 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ ADD PRODUCT ============ */
function ProductsDashboard({ adminKey }) {
  const [form, setForm] = useState({
    title: "", description: "", price: "", actualPrice: "",
    images: [], category: "stationery", subcategory: "", unit: "",
  });
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const SUBCATS = {
    stationery: ["notebooks", "pens", "art", "geometry", "other"],
    groceries: ["snacks_drinks", "beauty_personal_care", "home_lifestyle", "food_veg", "food_nonveg"],
  };

  async function uploadImages(files) {
    setUploading(true);
    const urls = [];
    for (const file of files) {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "products");
      const res = await fetch("https://api.cloudinary.com/v1_1/dpsfw0apo/image/upload", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) { alert(json.error?.message || "Image upload failed"); continue; }
      urls.push(json.secure_url);
    }
    setUploading(false);
    return urls;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { alert("❌ Failed: " + data.error); return; }
    setSuccess(true);
    setForm({ title: "", description: "", price: "", actualPrice: "", images: [], category: "stationery", subcategory: "", unit: "" });
    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <div className="max-w-xl">
      <h2 className="text-xl font-black text-[#17d492] mb-6">Add New Product</h2>
      {success && (
        <div className="mb-4 bg-[#17d492]/10 border border-[#17d492]/30 text-[#17d492] rounded-xl px-4 py-3 font-bold">
          ✅ Product added successfully!
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-[#1a2830] rounded-2xl p-6 space-y-4 border border-white/5">
        {/* Category */}
        <div>
          <label className="text-xs text-slate-400 mb-2 block font-bold uppercase tracking-wider">Category *</label>
          <div className="flex gap-3">
            {["stationery", "groceries"].map((cat) => (
              <label
                key={cat}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border cursor-pointer transition capitalize font-bold text-sm ${
                  form.category === cat ? "border-[#17d492] bg-[#17d492]/10 text-[#17d492]" : "border-white/10 text-slate-400 hover:border-white/30"
                }`}
              >
                <input type="radio" name="cat" className="hidden" onChange={() => setForm({ ...form, category: cat, subcategory: "" })} />
                {cat === "stationery" ? "✏️" : "🛒"} {cat}
              </label>
            ))}
          </div>
        </div>

        {/* Subcategory */}
        <div>
          <label className="text-xs text-slate-400 mb-1 block font-bold uppercase tracking-wider">Subcategory</label>
          <select
            value={form.subcategory}
            onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-[#22323c] border border-white/10 text-white focus:outline-none focus:border-[#17d492]"
          >
            <option value="">Select subcategory</option>
            {SUBCATS[form.category]?.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>

        <input placeholder="Product Title *" required value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full px-4 py-3 rounded-xl bg-[#22323c] border border-white/10 text-white focus:outline-none focus:border-[#17d492]" />

        <div className="grid grid-cols-2 gap-3">
          <input type="number" placeholder="Price ₹ *" required value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            className="w-full px-4 py-3 rounded-xl bg-[#22323c] border border-white/10 text-white focus:outline-none focus:border-[#17d492]" />
          <input type="number" placeholder="MRP ₹ (optional)" value={form.actualPrice}
            onChange={(e) => setForm({ ...form, actualPrice: Number(e.target.value) })}
            className="w-full px-4 py-3 rounded-xl bg-[#22323c] border border-white/10 text-white focus:outline-none focus:border-[#17d492]" />
        </div>

        <input placeholder="Unit (e.g. 500g, 1L, Pack of 5)" value={form.unit}
          onChange={(e) => setForm({ ...form, unit: e.target.value })}
          className="w-full px-4 py-3 rounded-xl bg-[#22323c] border border-white/10 text-white focus:outline-none focus:border-[#17d492]" />

        <textarea placeholder="Description" rows={3} value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-4 py-3 rounded-xl bg-[#22323c] border border-white/10 text-white focus:outline-none focus:border-[#17d492]" />

        <div>
          <label className="text-xs text-slate-400 mb-2 block font-bold uppercase tracking-wider">Product Images</label>
          <input type="file" multiple accept="image/*"
            onChange={async (e) => { const urls = await uploadImages(e.target.files); setForm({ ...form, images: urls }); }}
            className="text-sm text-slate-400" />
          {form.images.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {form.images.map((url, i) => (
                <img key={i} src={url} alt="" className="w-16 h-16 object-cover rounded-xl border border-[#17d492]/30" />
              ))}
            </div>
          )}
        </div>

        <button disabled={uploading} className="w-full bg-[#17d492] text-[#22323c] py-3 rounded-xl font-black hover:bg-[#14b87e] transition disabled:opacity-50">
          {uploading ? "Uploading Images..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}

/* ============ VIEW PRODUCTS ============ */
function ViewProducts({ adminKey }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [editingProduct, setEditingProduct] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products", { headers: { "x-admin-key": adminKey } });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  const deleteProduct = async (id) => {
    if (!confirm("Delete this product?")) return;
    await fetch("/api/admin/products/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
      body: JSON.stringify({ id }),
    });
    load();
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === "all" ? products : products.filter((p) => p.category === filter);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#17d492] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-3 mb-6">
        {["all", "stationery", "groceries"].map((c) => (
          <button key={c} onClick={() => setFilter(c)}
            className={`px-4 py-1.5 rounded-full text-xs font-black capitalize uppercase tracking-wider transition ${
              filter === c ? "bg-[#17d492] text-[#22323c]" : "bg-[#1a2830] text-slate-400 border border-white/10 hover:border-[#17d492]/30"
            }`}
          >
            {c === "all" ? `All (${products.length})` : `${c === "stationery" ? "✏️" : "🛒"} ${c} (${products.filter((p) => p.category === c).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-[#1a2830] rounded-2xl border border-white/5">
          <p className="text-slate-400 font-bold">No products found.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((product) => (
          <div key={product._id} className="bg-[#1a2830] border border-white/5 rounded-2xl p-4 flex flex-col hover:border-[#17d492]/20 transition">
            <div className="w-full h-40 bg-[#22323c] rounded-xl overflow-hidden mb-3">
              <img src={product.images?.[0] || "/placeholder.png"} alt={product.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-bold text-sm text-white flex-1 line-clamp-2">{product.title}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-bold ${
                product.category === "groceries" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"
              }`}>
                {product.category}
              </span>
            </div>
            {product.subcategory && (
              <p className="text-xs text-slate-500 mb-2">{product.subcategory.replace(/_/g, " ")}</p>
            )}
            <div className="flex items-center gap-2 mt-auto mb-3">
              <span className="font-black text-[#17d492]">₹{product.price}</span>
              {product.actualPrice && <span className="text-xs text-slate-500 line-through">₹{product.actualPrice}</span>}
              {product.unit && <span className="text-xs text-slate-500">{product.unit}</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => deleteProduct(product._id)}
                className="w-full border border-red-500/30 text-red-400 py-2 rounded-xl text-sm font-bold hover:bg-red-500/10 transition">Delete
              </button>
              <button
                onClick={() => setEditingProduct(product)}
                className="w-full border border-[#17d492]/30 text-[#17d492] py-2 rounded-xl text-sm font-bold hover:bg-[#17d492]/10 transition mb-2">Edit
              </button>
            </div>
          </div>
        ))}
      </div>
        {editingProduct && (
          <EditProductModal
            product={editingProduct}
            adminKey={adminKey}
            onClose={() => setEditingProduct(null)}
            onSuccess={load}
          />
        )}
    </div>
  );
}
function EditProductModal({ product, adminKey, onClose, onSuccess }) {
  const [form, setForm] = useState(product);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(product);
  }, [product]);

  const SUBCATS = {
    stationery: ["notebooks", "pens", "art", "geometry", "other"],
    groceries: ["snacks_drinks", "beauty_personal_care", "home_lifestyle", "food_veg", "food_nonveg"],
  };

  const handleUpdate = async () => {
    setLoading(true);

    const { _id, ...rest } = form;

    const res = await fetch("/api/admin/products/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminKey,
      },
      body: JSON.stringify({
        id: product._id,
        ...rest,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      alert("❌ " + data.error);
      return;
    }

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-[#1a2830] p-6 rounded-2xl w-full max-w-lg border border-[#17d492]/20 overflow-y-auto max-h-[90vh]">
        <h2 className="text-lg font-black text-[#17d492] mb-4">Edit Product</h2>

        {/* Category */}
        <div className="flex gap-3 mb-3">
          {["stationery", "groceries"].map((cat) => (
            <button
              key={cat}
              onClick={() => setForm({ ...form, category: cat, subcategory: "" })}
              className={`flex-1 py-2 rounded-xl font-bold ${
                form.category === cat
                  ? "bg-[#17d492] text-[#22323c]"
                  : "bg-[#22323c]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Subcategory */}
        <select
          value={form.subcategory || ""}
          onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
          className="w-full mb-3 px-4 py-2 rounded-xl bg-[#22323c]"
        >
          <option value="">Select subcategory</option>
          {SUBCATS[form.category]?.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>

        {/* Title */}
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full mb-3 px-4 py-2 rounded-xl bg-[#22323c]"
        />

        {/* Price + MRP */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input
            type="number"
            value={form.price || ""}
            onChange={(e) =>
              setForm({ ...form, price: Number(e.target.value) })
            }
            className="w-full px-4 py-2 rounded-xl bg-[#22323c]"
          />
          <input
            type="number"
            value={form.actualPrice || ""}
            onChange={(e) =>
              setForm({ ...form, actualPrice: Number(e.target.value) })
            }
            className="w-full px-4 py-2 rounded-xl bg-[#22323c]"
            placeholder="MRP"
          />
        </div>

        {/* Unit */}
        <input
          value={form.unit || ""}
          onChange={(e) => setForm({ ...form, unit: e.target.value })}
          className="w-full mb-3 px-4 py-2 rounded-xl bg-[#22323c]"
          placeholder="Unit (e.g. 500g)"
        />

        {/* Description */}
        <textarea
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          className="w-full mb-3 px-4 py-2 rounded-xl bg-[#22323c]"
        />

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleUpdate}
            className="flex-1 bg-[#17d492] text-[#22323c] py-2 rounded-xl font-bold"
          >
            {loading ? "Updating..." : "Update"}
          </button>

          <button
            onClick={onClose}
            className="flex-1 border border-white/20 py-2 rounded-xl"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}