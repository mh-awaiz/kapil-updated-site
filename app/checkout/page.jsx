"use client";

import { useCart } from "../context/CartContext.js";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  FaTimes,
  FaCheckCircle,
  FaWhatsapp,
  FaClock,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaBolt,
  FaCalendarCheck,
} from "react-icons/fa";
import { MdQrCode2 } from "react-icons/md";

// ── Device detection ────────────────────────────────────────────
const isMobile = () =>
  typeof window !== "undefined" &&
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const { data: session } = useSession();

  const [form, setForm] = useState({
    name: session?.user?.name || "",
    phone: session?.user?.phone || "",
    email: session?.user?.email || "",
    address: "",
  });
  const [isJamiaStudent, setIsJamiaStudent] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState("");

  const [showQR, setShowQR] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");
  const [utrError, setUtrError] = useState("");

  // Mobile-only: after deep link opens UPI app, show UTR-only modal on return
  const [showMobileUTR, setShowMobileUTR] = useState(false);
  // Mobile-only: brief splash before redirecting to UPI app
  const [showRedirectSplash, setShowRedirectSplash] = useState(false);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const deliveryCharge = Math.round(subtotal * 0.1); // 10% delivery charge for all
  const grandTotal = subtotal + deliveryCharge;

  const validateForm = () => {
    if (!form.name || !form.phone || !form.address) {
      alert("Please fill all required fields");
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

  // ── Handle "Proceed to Pay" click ──────────────────────────────
  const handlePayClick = () => {
    if (!validateForm()) return;

    if (isMobile()) {
      // Show reminder splash for 3.5s, then fire deep link
      setShowRedirectSplash(true);
      setTimeout(() => {
        const upiLink = `upi://pay?pa=7982670413@sbi&pn=Sohan&am=${grandTotal}&cu=INR`;
        window.location.href = upiLink;
        setShowRedirectSplash(false);
        // Show UTR modal 2s after deep link fires (user is in UPI app by then)
        setTimeout(() => setShowMobileUTR(true), 2000);
      }, 4500);
    } else {
      // Desktop: show QR modal as before
      setShowQR(true);
    }
  };

  // ── Shared UTR confirm logic ────────────────────────────────────
  const handleUTRConfirm = async () => {
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
      setShowMobileUTR(false);
      setPlacedOrderId(data.orderId);
      setSuccess(true);
      clearCart();
      setForm({ name: "", phone: "", email: "", address: "" });
    } else {
      alert(data.message || "Order failed. Please try again.");
    }
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

  // ── Mobile Redirect Splash ──────────────────────────────────────
  const RedirectSplash = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1a2830] border border-[#17d492]/30 rounded-2xl w-full max-w-xs p-7 text-center shadow-2xl">
        {/* Animated icon */}
        <div className="relative mx-auto mb-5 w-16 h-16">
          <div className="absolute inset-0 rounded-full bg-[#17d492]/20 animate-ping" />
          <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-[#17d492]/10 border border-[#17d492]/30">
            <MdQrCode2 size={30} className="text-[#17d492]" />
          </div>
        </div>

        <h3 className="text-white font-black text-lg leading-snug mb-2">
          Note your Transaction ID
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed mb-6">
          After paying, make sure to{" "}
          <span className="text-[#17d492] font-bold">
            copy the Transaction ID
          </span>{" "}
          from your UPI app — you'll need it to verify your payment.
        </p>

        {/* Animated redirecting bar */}
        <div className="flex items-center justify-center gap-2 text-slate-500 text-xs font-semibold tracking-widest uppercase">
          <span className="inline-flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#17d492] animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#17d492] animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#17d492] animate-bounce [animation-delay:300ms]" />
          </span>
          Redirecting to UPI app
        </div>
      </div>
    </div>
  );

  const MobileUTRModal = () => (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1a2830] border border-[#17d492]/30 rounded-t-3xl w-full max-w-lg p-6 pb-10 shadow-2xl">
        {/* Handle bar */}
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-5" />

        <div className="flex items-center gap-3 mb-5">
          <FaCheckCircle size={24} className="text-[#17d492]" />
          <div>
            <h3 className="font-black text-white text-lg">Payment Done?</h3>
            <p className="text-slate-400 text-xs">
              Enter your transaction ID to confirm your order
            </p>
          </div>
        </div>

        {/* Amount reminder */}
        <div className="bg-[#17d492]/10 border border-[#17d492]/20 rounded-xl px-4 py-3 mb-5 flex items-center justify-between">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
            Amount Paid
          </p>
          <p className="text-2xl font-black text-[#17d492]">₹{grandTotal}</p>
        </div>

        {/* UPI ID reminder */}
        <div className="mb-5 bg-[#22323c] border border-white/10 rounded-xl px-4 py-3 text-center">
          <p className="text-xs text-slate-500 mb-1">Paid to UPI ID</p>
          <p className="text-sm font-black text-white tracking-wide">
            7982670413@sbi
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-bold text-[#17d492] uppercase tracking-widest mb-2">
            UTR / Transaction ID *
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="e.g. 423456789012"
            value={utrNumber}
            onChange={(e) => {
              setUtrNumber(e.target.value);
              setUtrError("");
            }}
            className="w-full px-4 py-3 rounded-xl bg-[#22323c] border border-white/10 focus:outline-none focus:border-[#17d492] transition text-white text-sm"
            autoFocus
          />
          {utrError && <p className="text-red-400 text-xs mt-1">{utrError}</p>}
          <p className="text-slate-600 text-xs mt-1">
            Find this in your UPI app after payment — it's the 12-digit
            reference number.
          </p>
        </div>

        <button
          onClick={handleUTRConfirm}
          disabled={loading}
          className={`w-full py-3.5 rounded-xl font-black transition text-[#22323c] ${
            loading
              ? "bg-[#17d492]/50 cursor-not-allowed"
              : "bg-[#17d492] hover:bg-[#14b87e] active:scale-95"
          }`}
        >
          {loading ? "Confirming..." : "I Have Paid – Confirm Order"}
        </button>

        {/* Allow user to re-open UPI app if they haven't paid yet */}
        <button
          onClick={() => {
            const upiLink = `upi://pay?pa=7982670413@sbi&pn=Sohan&am=${grandTotal}&cu=INR`;
            window.location.href = upiLink;
          }}
          className="w-full mt-3 py-2.5 rounded-xl font-bold text-sm text-[#17d492] border border-[#17d492]/30 hover:bg-[#17d492]/10 transition"
        >
          Open UPI App Again
        </button>

        <button
          onClick={() => {
            setShowMobileUTR(false);
            setUtrNumber("");
            setUtrError("");
          }}
          className="w-full mt-2 py-2.5 rounded-xl text-xs text-slate-500 hover:text-slate-300 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  // ── Desktop QR Modal ────────────────────────────────────────────
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
          onClick={handleUTRConfirm}
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
      {showRedirectSplash && <RedirectSplash />}
      {showMobileUTR && <MobileUTRModal />}

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
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-[#22323c] border border-white/10 focus:outline-none focus:border-[#17d492] transition"
                  />

                  {/* Jamia Student */}
                  <div>
                    <p className="mb-2 font-bold text-[#17d492] text-sm">
                      Are you a Jamia student? *
                    </p>
                    <div className="flex gap-3">
                      {[
                        { val: true, label: "Yes" },
                        { val: false, label: "No" },
                      ].map((opt) => (
                        <label
                          key={String(opt.val)}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition text-sm font-bold ${
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

                  <textarea
                    rows={3}
                    placeholder="Complete Address (Building / Area / Landmark) *"
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-[#22323c] border border-white/10 focus:outline-none focus:border-[#17d492] transition"
                    required
                  />
                </div>
              </div>

              {/* Important Delivery Information */}
              <div className="bg-[#1a2830] rounded-2xl p-6 border border-[#17d492]/20">
                <h2 className="text-lg font-black mb-4 text-[#17d492]">
                  Important Delivery Information
                </h2>
                <p>-: 7982670413</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm text-white/70">
                    <FaCalendarCheck
                      className="text-[#17d492] mt-0.5 shrink-0"
                      size={15}
                    />
                    <span>
                      Delivery available everyday —{" "}
                      <span className="text-white font-semibold">
                        8:00 AM to 12:00 AM
                      </span>
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-white/70">
                    <FaBolt
                      className="text-[#17d492] mt-0.5 shrink-0"
                      size={15}
                    />
                    <span>
                      Your order will be delivered within{" "}
                      <span className="text-white font-semibold">
                        45–90 minutes
                      </span>
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-white/70">
                    <FaPhoneAlt
                      className="text-[#17d492] mt-0.5 shrink-0"
                      size={15}
                    />
                    <span>
                      You will receive a{" "}
                      <span className="text-white font-semibold">
                        confirmation mail
                      </span>{" "}
                      before delivery
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-white/70">
                    <FaMapMarkerAlt
                      className="text-[#17d492] mt-0.5 shrink-0"
                      size={15}
                    />
                    <span>
                      Please mention your{" "}
                      <span className="text-white font-semibold">
                        exact location
                      </span>{" "}
                      while placing the order
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-white/70">
                    <FaWhatsapp
                      className="text-[#17d492] mt-0.5 shrink-0"
                      size={15}
                    />
                    <span>
                      For urgent orders or anyone has only cash, you can
                      WhatsApp us:{" "}
                      <a
                        href="https://wa.me/917982670413"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#17d492] font-black hover:underline"
                      >
                        7982670413
                      </a>
                    </span>
                  </li>
                </ul>
              </div>

              {/* Payment Method */}
              <div className="bg-[#1a2830] rounded-2xl p-6 border border-white/5">
                <h2 className="text-lg font-black mb-4 text-[#17d492]">
                  Payment Method
                </h2>
                <div className="space-y-3">
                  {/* COD — Disabled */}
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] opacity-50 cursor-not-allowed select-none">
                    <FaTimes className="text-slate-500 shrink-0" size={20} />
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

                  {/* UPI — Active */}
                  <label className="flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition border-[#17d492] bg-[#17d492]/10">
                    <input
                      type="radio"
                      name="payment"
                      className="hidden"
                      defaultChecked
                      onChange={() => setPaymentMethod("upi")}
                    />
                    <MdQrCode2 size={24} className="text-[#17d492] shrink-0" />
                    <div className="flex-1">
                      <p className="font-bold text-sm text-white">
                        Pay via UPI / QR
                      </p>
                      <p className="text-xs text-slate-500">
                        GPay, PhonePe, Paytm & all UPI apps
                      </p>
                    </div>
                    <div className="w-4 h-4 rounded-full border-2 border-[#17d492] bg-[#17d492] shrink-0" />
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
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    Delivery{" "}
                    <span className="text-xs text-slate-600">(10%)</span>
                  </span>
                  <span>₹{deliveryCharge}</span>
                </div>
                <div className="flex justify-between font-black text-lg pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span className="text-[#17d492]">₹{grandTotal}</span>
                </div>
              </div>

              {/* Delivery timing reminder */}
              <div className="mt-4 flex items-center gap-2 bg-[#17d492]/5 border border-[#17d492]/15 rounded-xl px-4 py-3">
                <FaClock size={13} className="text-[#17d492] shrink-0" />
                <p className="text-xs text-slate-400">
                  Delivered in{" "}
                  <span className="text-white font-bold">45–90 mins</span> ·
                  Available 8 AM – 12 AM
                </p>
              </div>

              <button
                onClick={handlePayClick}
                disabled={loading || cart.length === 0}
                className={`w-full mt-5 py-4 rounded-xl font-black transition text-[#22323c] ${
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
