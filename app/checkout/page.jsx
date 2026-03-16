"use client";

import { useCart } from "../context/CartContext.js";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FaTimes, FaCheckCircle } from "react-icons/fa";
import { MdQrCode2 } from "react-icons/md";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const { data: session } = useSession();

  const [form, setForm] = useState({
    name: session?.user?.name || "",
    phone: session?.user?.phone || "",
    email: session?.user?.email || "",
    address: session?.user?.address || "",
    timeSlot: "",
  });
  const [isJamiaStudent, setIsJamiaStudent] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("upi"); // default to upi since cod is disabled
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState("");

  // UPI QR modal states
  const [showQR, setShowQR] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");
  const [utrError, setUtrError] = useState("");

  const deliveryCharge = isJamiaStudent === false ? 30 : 0;
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const grandTotal = total + deliveryCharge;

  const validateForm = () => {
    if (!form.name || !form.phone || !form.address) {
      alert("Please fill all required fields");
      return false;
    }
    if (isJamiaStudent === null) {
      alert("Please confirm if you are a Jamia student");
      return false;
    }
    if (isJamiaStudent && !form.timeSlot) {
      alert("Please select a delivery time slot");
      return false;
    }
    return true;
  };

  const placeOrder = async (extraFields = {}) => {
    const res = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: { ...form, isJamiaStudent },
        cart,
        total: grandTotal,
        deliveryCharge,
        paymentMethod,
        userId: session?.user?.id || null,
        ...extraFields,
      }),
    });
    const data = await res.json();
    return { ok: res.ok, data };
  };

  const handleUPIClick = () => {
    if (!validateForm()) return;
    setShowQR(true);
  };

  const handleUPIConfirm = async () => {
    if (!utrNumber.trim()) {
      setUtrError("Please enter your UTR / Transaction ID");
      return;
    }
    if (utrNumber.trim().length < 6) {
      setUtrError("UTR number seems too short. Please check.");
      return;
    }
    setUtrError("");
    setLoading(true);
    const { ok, data } = await placeOrder({
      paymentStatus: "pending_verification",
      utrNumber: utrNumber.trim(),
    });
    setLoading(false);
    if (ok) {
      setShowQR(false);
      setPlacedOrderId(data.orderId);
      setSuccess(true);
      clearCart();
      setForm({ name: "", phone: "", email: "", address: "", timeSlot: "" });
    } else {
      alert(data.message || "Order failed. Please try again.");
    }
  };

  const handleSubmit = () => {
    handleUPIClick();
  };

  // ── Success Screen ──────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-[#22323c] text-[#f5f5f5] flex items-center justify-center px-4 pt-24">
        <div className="text-center max-w-sm">
          <FaCheckCircle size={64} className="text-[#17d492] mx-auto mb-4" />
          <h2 className="text-2xl font-black text-[#17d492] mb-2">
            Order Placed!
          </h2>
          <p className="text-white/70 mb-1">
            Order ID:{" "}
            <span className="font-mono text-white">{placedOrderId}</span>
          </p>
          <p className="text-yellow-400 text-sm mb-2 font-semibold">
            Payment will be verified within 30 minutes.
          </p>
          <p className="text-white/50 text-sm mb-8">
            We'll contact you soon to confirm.
          </p>
          <div className="flex flex-col gap-3">
            <a
              href={`/track/${placedOrderId}`}
              className="bg-[#17d492] text-[#22323c] py-3 px-6 rounded-xl font-black hover:bg-[#14b87e] transition"
            >
              Track Your Order
            </a>
            <a
              href="/"
              className="border-2 border-slate-700 text-slate-300 py-3 px-6 rounded-xl font-bold hover:bg-slate-800 transition"
            >
              Continue Shopping
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── UPI QR Modal ────────────────────────────────────────────────
  const UPIModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1a2830] border border-[#17d492]/30 rounded-2xl w-full max-w-sm p-6 relative shadow-2xl">
        <button
          onClick={() => {
            setShowQR(false);
            setUtrNumber("");
            setUtrError("");
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          <FaTimes size={18} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <MdQrCode2 size={28} className="text-[#17d492]" />
          <div>
            <h3 className="font-black text-white text-lg">Pay via UPI</h3>
            <p className="text-slate-400 text-xs">
              Scan the QR code below to pay
            </p>
          </div>
        </div>

        <div className="bg-[#17d492]/10 border border-[#17d492]/20 rounded-xl px-4 py-3 mb-5 text-center">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">
            Amount to Pay
          </p>
          <p className="text-3xl font-black text-[#17d492]">₹{grandTotal}</p>
        </div>

        <div className="flex flex-col items-center mb-5">
          <div className="bg-white p-3 rounded-xl mb-3">
            <img
              src="/upi-qr.jpeg"
              alt="UPI QR Code"
              className="w-48 h-48 object-contain"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
            <div
              className="w-48 h-48 bg-gray-100 rounded-lg items-center justify-center flex-col gap-2 hidden"
              style={{ display: "none" }}
            >
              <MdQrCode2 size={64} className="text-gray-400" />
              <p className="text-xs text-gray-500 text-center px-2">
                Add your QR image at /public/upi-qr.jpeg
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500 text-center">
            Open any UPI app (GPay, PhonePe, Paytm) and scan
          </p>
          <div className="mt-3 w-full bg-[#22323c] border border-white/10 rounded-xl px-4 py-2.5 text-center">
            <p className="text-xs text-slate-500 mb-1">Or pay to UPI ID</p>
            <p className="text-sm font-black text-white tracking-wide">
              7982670413@sbi
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-bold text-[#17d492] uppercase tracking-widest mb-2">
            Enter UTR / Transaction ID *
          </label>
          <input
            type="text"
            placeholder="e.g. 423456789012"
            value={utrNumber}
            onChange={(e) => {
              setUtrNumber(e.target.value);
              setUtrError("");
            }}
            className="w-full px-4 py-3 rounded-xl bg-[#22323c] border border-white/10 focus:outline-none focus:border-[#17d492] transition text-white text-sm"
          />
          {utrError && <p className="text-red-400 text-xs mt-1">{utrError}</p>}
          <p className="text-slate-600 text-xs mt-1">
            Find this in your UPI app after payment — it's the 12-digit
            reference number.
          </p>
        </div>

        <button
          onClick={handleUPIConfirm}
          disabled={loading}
          className={`w-full py-3.5 rounded-xl font-black transition text-[#22323c] ${
            loading
              ? "bg-[#17d492]/50 cursor-not-allowed"
              : "bg-[#17d492] hover:bg-[#14b87e] active:scale-95"
          }`}
        >
          {loading ? "Confirming..." : "I Have Paid – Confirm Order"}
        </button>
      </div>
    </div>
  );

  // ── Main Checkout ───────────────────────────────────────────────
  return (
    <>
      {showQR && <UPIModal />}

      <div className="min-h-screen bg-[#22323c] text-[#f5f5f5] py-10 px-4 pt-28">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-black mb-8 text-[#17d492]">Checkout</h1>

          <div className="grid md:grid-cols-2 gap-8">
            {/* LEFT - Delivery Details */}
            <div className="space-y-6">
              <div className="bg-[#1a2830] rounded-2xl p-6 border border-white/5">
                <h2 className="text-lg font-black mb-4 text-[#17d492]">
                  Delivery Details
                </h2>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#22323c] border border-white/10 focus:outline-none focus:border-[#17d492] transition"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number *"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-[#22323c] border border-white/10 focus:outline-none focus:border-[#17d492] transition"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email *"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-[#22323c] border border-white/10 focus:outline-none focus:border-[#17d492] transition"
                    required
                  />

                  {/* Jamia Student */}
                  <div>
                    <p className="mb-2 font-bold text-[#17d492] text-sm">
                      Are you a Jamia student? *
                    </p>
                    <div className="flex gap-3">
                      {[
                        { val: true, label: "Yes (Free Delivery)" },
                        { val: false, label: "No (₹30 charge)" },
                      ].map((opt) => (
                        <label
                          key={String(opt.val)}
                          className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition text-sm font-bold ${
                            isJamiaStudent === opt.val
                              ? "border-[#17d492] bg-[#17d492]/10 text-[#17d492]"
                              : "border-white/10 text-slate-400 hover:border-white/30"
                          }`}
                        >
                          <input
                            type="radio"
                            name="jamia"
                            className="hidden"
                            onChange={() => setIsJamiaStudent(opt.val)}
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Time Slot for Jamia Students */}
                  {isJamiaStudent && (
                    <div>
                      <p className="mb-2 font-bold text-[#17d492] text-sm">
                        Select Delivery Time Slot *
                      </p>
                      <div className="flex flex-col gap-2">
                        {[
                          "Morning: 8:45 AM – 9:15 AM",
                          "Afternoon: 1:00 PM – 2:00 PM",
                          "Evening: 5:00 PM – 6:00 PM",
                          "Hostel: 8:00 PM – 9:00 PM",
                        ].map((slot) => (
                          <label
                            key={slot}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border cursor-pointer transition text-sm ${
                              form.timeSlot === slot
                                ? "border-[#17d492] bg-[#17d492]/10 text-[#17d492] font-bold"
                                : "border-white/10 text-slate-400 hover:border-white/30"
                            }`}
                          >
                            <input
                              type="radio"
                              name="timeSlot"
                              value={slot}
                              checked={form.timeSlot === slot}
                              onChange={(e) =>
                                setForm({ ...form, timeSlot: e.target.value })
                              }
                              className="hidden"
                            />
                            {slot}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Jamia Info Box */}
                  {isJamiaStudent && (
                    <div className="rounded-xl bg-[#17d492]/10 border border-[#17d492]/30 p-4 text-sm">
                      <p className="font-black text-[#17d492] mb-2">
                        Important Delivery Information
                      </p>
                      <p className="text-white/70 mb-2">
                        For urgent orders, WhatsApp us:{" "}
                        <span className="font-bold text-[#17d492]">
                          7982670413
                        </span>
                      </p>
                      <ul className="text-white/60 space-y-1 text-xs list-disc pl-4">
                        <li>Free delivery Mon–Fri only</li>
                        <li>Include gate number / hostel name in address</li>
                        <li>
                          You'll receive a confirmation call before delivery
                        </li>
                        <li>
                          Departments: Gate 1–30 | Hostels: 8–9 PM at main gate
                        </li>
                      </ul>
                    </div>
                  )}

                  <textarea
                    rows={3}
                    placeholder="Complete Address (Gate no. / Hostel name / Department) *"
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-[#22323c] border border-white/10 focus:outline-none focus:border-[#17d492] transition"
                    required
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-[#1a2830] rounded-2xl p-6 border border-white/5">
                <h2 className="text-lg font-black mb-4 text-[#17d492]">
                  Payment Method
                </h2>
                <div className="space-y-3">
                  {/* COD — Disabled */}
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] opacity-50 cursor-not-allowed select-none">
                    <span className="text-2xl grayscale">💵</span>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-slate-500">
                        Cash on Delivery
                      </p>
                      <p className="text-xs text-slate-600">
                        Currently unavailable
                      </p>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-slate-700 text-slate-400 px-2 py-1 rounded-lg">
                      Unavailable
                    </span>
                  </div>

                  {/* UPI — Active & always selected */}
                  <label className="flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition border-[#17d492] bg-[#17d492]/10">
                    <input
                      type="radio"
                      name="payment"
                      className="hidden"
                      defaultChecked
                      onChange={() => setPaymentMethod("upi")}
                    />
                    <span className="text-2xl">📲</span>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-white">
                        Pay via UPI / QR
                      </p>
                      <p className="text-xs text-slate-500">
                        GPay, PhonePe, Paytm & all UPI apps
                      </p>
                    </div>
                    <div className="w-4 h-4 rounded-full border-2 border-[#17d492] bg-[#17d492]" />
                  </label>
                </div>
              </div>
            </div>

            {/* RIGHT - Order Summary */}
            <div className="bg-[#1a2830] rounded-2xl p-6 h-fit sticky top-28 border border-white/5">
              <h2 className="text-lg font-black mb-4 text-[#17d492]">
                Order Summary
              </h2>

              <div className="space-y-2 mb-4">
                {cart.map((item) => (
                  <div
                    key={`${item.title}-${item.quantity}`}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-white/70">
                      {item.title} × {item.quantity}
                    </span>
                    <span className="text-white">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Subtotal</span>
                  <span>₹{total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Delivery</span>
                  <span>
                    {deliveryCharge === 0 ? (
                      <span className="text-[#17d492] font-bold">FREE</span>
                    ) : (
                      `₹${deliveryCharge}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between font-black text-lg pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span className="text-[#17d492]">₹{grandTotal}</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || cart.length === 0}
                className={`w-full mt-6 py-4 rounded-xl font-black transition text-[#22323c] ${
                  loading
                    ? "bg-[#17d492]/50 cursor-not-allowed"
                    : "bg-[#17d492] hover:bg-[#14b87e] hover:-translate-y-0.5 active:scale-95 shadow-[0_10px_20px_-10px_rgba(23,212,146,0.4)]"
                }`}
              >
                {loading ? "Processing..." : "Proceed to Pay"}
              </button>

              <p className="text-xs text-center mt-3 text-slate-600">
                Secure Checkout • UPI Payment
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
