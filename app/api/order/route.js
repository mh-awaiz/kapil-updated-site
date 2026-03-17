import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      customer,
      cart,
      total,
      deliveryCharge,
      paymentMethod,
      paymentStatus,
      userId,
      razorpayOrderId,
      utrNumber,
    } = body;

    if (!customer || !cart || cart.length === 0) {
      return new Response(JSON.stringify({ message: "Invalid order data" }), {
        status: 400,
      });
    }

    if (
      customer?.isJamiaStudent &&
      !customer?.timeSlot &&
      paymentMethod !== "razorpay"
    ) {
      return new Response(
        JSON.stringify({ message: "Time slot is required for Jamia students" }),
        { status: 400 },
      );
    }

    const orderId = "ORD-" + Date.now();

    const hasGrocery = cart.some((item) => item.category === "groceries");
    const hasStationery = cart.some((item) => item.category !== "groceries");
    const orderCategory =
      hasGrocery && hasStationery
        ? "mixed"
        : hasGrocery
          ? "groceries"
          : "stationery";

    const order = new Order({
      orderId,
      userId: userId || null,
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        isJamiaStudent: customer.isJamiaStudent,
        timeSlot: customer.timeSlot || "",
      },
      items: cart.map((item) => ({
        title: item.title,
        description: item.description || "",
        quantity: item.quantity,
        price: item.price,
        category: item.category || "stationery",
      })),
      category: orderCategory,
      totalAmount: total,
      deliveryCharge,
      paymentMethod: paymentMethod || "upi",
      paymentStatus: paymentStatus || "pending_verification",
      utrNumber: utrNumber || null,
      razorpayOrderId: razorpayOrderId || null,
      trackingUpdates: [
        {
          status: "placed",
          message: "Order placed successfully",
          timestamp: new Date(),
        },
      ],
    });

    await order.save();

    // ── Emails ──────────────────────────────────────────────────────
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });

        const itemsList = cart
          .map(
            (item) =>
              `${item.title} (Qty: ${item.quantity}) - ₹${item.price * item.quantity}`,
          )
          .join("\n");

        // 1. Owner notification
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_USER,
          subject: `New Order Received: ${orderId}`,
          text: `
You have received a new order!

Order ID: ${orderId}
Category: ${orderCategory}
Name: ${customer.name}
Phone: ${customer.phone}
Email: ${customer.email}
Address: ${customer.address}
Jamia Student: ${customer.isJamiaStudent ? "Yes" : "No"}
Time Slot: ${customer.timeSlot || "N/A"}

Items:
${itemsList}
Item Descriptions: ${cart.map((item) => `${item.title}: ${item.description || "N/A"}`).join("\n")}

Delivery Charge: ₹${deliveryCharge}
Total Amount: ₹${total}
Payment: ${(paymentMethod || "upi").toUpperCase()}
UTR Number: ${utrNumber || "N/A"}
Timestamp: ${new Date().toLocaleString()}
          `,
        });

        // 2. Customer confirmation email
        if (customer.email) {
          const itemsHTML = cart
            .map(
              (item) => `
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #ffffff15;font-size:14px;color:#f5f5f5cc;">
                  ${item.title} × ${item.quantity}
                </td>
                <td style="padding:8px 0;border-bottom:1px solid #ffffff15;font-size:14px;color:#f5f5f5cc;text-align:right;">
                  ₹${item.price * item.quantity}
                </td>
              </tr>`,
            )
            .join("");

          await transporter.sendMail({
            from: `"Kapil Store" <${process.env.EMAIL_USER}>`,
            to: customer.email,
            subject: `Order Confirmed – ${orderId} | Kapil Store`,
            html: `
              <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;background:#22323c;color:#f5f5f5;border-radius:12px;overflow:hidden;">
                
                <!-- Header -->
                <div style="background:#17d492;padding:28px 32px;">
                  <h1 style="margin:0;color:#22323c;font-size:24px;font-weight:900;">Order Confirmed! </h1>
                  <p style="margin:6px 0 0;color:#22323ccc;font-size:13px;">Thank you for shopping with Kapil Store</p>
                </div>

                <!-- Body -->
                <div style="padding:28px 32px;">
                  <p style="margin:0 0 6px;font-size:15px;">Hi <strong>${customer.name}</strong>,</p>
                  <p style="color:#f5f5f5cc;margin:0 0 24px;font-size:14px;line-height:1.6;">
                    Your order has been placed successfully. Payment verification takes up to 30 minutes — 
                    we'll contact you on <strong style="color:#17d492;">${customer.phone}</strong> to confirm.
                  </p>

                  <!-- Order ID Box -->
                  <div style="background:#1a2830;border-radius:10px;padding:16px 20px;margin:0 0 24px;border:1px solid #17d49230;">
                    <p style="margin:0 0 4px;font-size:11px;color:#17d492;font-weight:900;text-transform:uppercase;letter-spacing:1.5px;">Order ID</p>
                    <p style="margin:0;font-size:22px;font-weight:900;font-family:monospace;color:#fff;letter-spacing:1px;">${orderId}</p>
                  </div>

                  <!-- Items Table -->
                  <table style="width:100%;border-collapse:collapse;margin:0 0 8px;">
                    ${itemsHTML}
                    <tr>
                      <td style="padding:8px 0;font-size:13px;color:#f5f5f5aa;">Delivery Charge</td>
                      <td style="padding:8px 0;font-size:13px;color:#f5f5f5aa;text-align:right;">
                        ${deliveryCharge === 0 ? '<span style="color:#17d492;font-weight:bold;">FREE</span>' : `₹${deliveryCharge}`}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:12px 0 0;font-size:16px;font-weight:900;color:#fff;border-top:1px solid #ffffff20;">Total Paid</td>
                      <td style="padding:12px 0 0;font-size:16px;font-weight:900;color:#17d492;text-align:right;border-top:1px solid #ffffff20;">₹${total}</td>
                    </tr>
                  </table>

                  ${
                    customer.isJamiaStudent && customer.timeSlot
                      ? `<div style="background:#17d49215;border:1px solid #17d49240;border-radius:8px;padding:12px 16px;margin:20px 0;font-size:13px;">
                           <p style="margin:0 0 4px;font-weight:900;color:#17d492;">📅 Delivery Slot</p>
                           <p style="margin:0;color:#f5f5f5cc;">${customer.timeSlot}</p>
                         </div>`
                      : ""
                  }

                  <!-- Track Button -->
                  <a href="https://kapilstore.in/track/${orderId}"
                     style="display:block;background:#17d492;color:#22323c;text-align:center;padding:16px;border-radius:10px;font-weight:900;text-decoration:none;font-size:16px;margin:24px 0 20px;">
                    Track Your Order →
                  </a>

                  <p style="font-size:13px;color:#f5f5f5aa;margin:0;line-height:1.6;">
                    Need help? WhatsApp us at 
                    <strong style="color:#17d492;">7982670413</strong>
                  </p>
                </div>

                <!-- Footer -->
                <div style="background:#1a2830;padding:14px 32px;text-align:center;border-top:1px solid #ffffff10;">
                  <p style="margin:0;font-size:11px;color:#ffffff40;">© ${new Date().getFullYear()} Kapil Store • kapilstore.in</p>
                </div>
              </div>
            `,
          });
        }
      }
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    return new Response(
      JSON.stringify({ message: "Order placed successfully", orderId }),
      { status: 200 },
    );
  } catch (error) {
    console.error("Order API error:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}
