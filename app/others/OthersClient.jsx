"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FaFileAlt, FaHome, FaChalkboardTeacher, FaBolt,
  FaTshirt, FaPills, FaWhatsapp, FaArrowRight,
} from "react-icons/fa";
import { MdMenuBook } from "react-icons/md";

const SECTIONS = [
  {
    id: "assignment",
    emoji: "📝",
    title: "Paid Assignment Services",
    color: "#8b5cf6",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    contact: true,
    items: [
      "IGNOU Assignment Work", "Handwritten Assignments", "Typed Assignments",
      "Project Work", "Presentation (PPT) Making", "Engineering Drawing",
      "Polytechnic Drawing", "Thesis Help", "School Assignment",
      "College Assignment", "Drawing Work", "Important Questions Solving",
    ],
  },
  {
    id: "earn-rent",
    emoji: "🏠",
    title: "Student Earn & Rent Hub",
    color: "#ec4899",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/20",
    contact: true,
    items: [
      "Calculators on Rent", "PG / Rooms on Rent", "Electronics on Rent",
      "Room Essentials on Rent", "Travel & Transport on Rent",
      "Daily Use Items on Rent", "Money on Rent",
    ],
  },
  {
    id: "tuition",
    emoji: "🎓",
    title: "Tuition Services",
    color: "#06b6d4",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
    contact: true,
    items: [
      "School Tuition Available", "College Tuition Available", "Home Tuition Available",
      "Entrance Exam Preparation", "Tutor Available", "IGNOU Help",
      "Exam Form Filling", "Online Form Filling Service",
    ],
  },
  {
    id: "student-services",
    emoji: "⚡",
    title: "Only For Students 🔥",
    color: "#17d492",
    bgColor: "bg-[#17d492]/10",
    borderColor: "border-[#17d492]/20",
    contact: true,
    items: [
      "Clothes Ironing", "Laundry Service", "Dry Cleaning",
      "Resume / CV Making", "Mobile Recharge & Bill Payment",
      "Laptop / Mobile Repair", "Packing & Shifting Help",
      "Printout / Scan Service", "ID Card / Document Help",
    ],
  },
  {
    id: "shoes-bags",
    emoji: "👟",
    title: "Shoes & Bags",
    color: "#f59e0b",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    contact: true,
    items: [
      "Men's Footwear", "Women's Footwear", "Sports Shoes",
      "Formal Shoes", "Slippers", "School & College Bags", "Ladies Bags",
    ],
  },
  {
    id: "pyq",
    emoji: "📚",
    title: "PYQ Section",
    color: "#17d492",
    bgColor: "bg-[#17d492]/10",
    borderColor: "border-[#17d492]/20",
    contact: false,
    isLink: true,
    linkHref: "/pyqs",
    linkLabel: "Browse PYQs →",
    items: [
      "Previous Year Question Papers", "Department-wise PYQs",
      "Download Free PDFs", "All Branches Available",
    ],
  },
  {
    id: "utensils",
    emoji: "🍳",
    title: "Utensils Services",
    color: "#f97316",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    contact: true,
    items: [
      "Kitchen Utensils", "Cooking Equipment", "Plates & Bowls",
      "Utensils on Rent", "Hostel Essentials",
    ],
  },
  {
    id: "clothes",
    emoji: "👕",
    title: "Clothes Section",
    color: "#a855f7",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    contact: true,
    items: [
      "Men's Wear", "Women's Wear",
    ],
  },
  {
    id: "chemist",
    emoji: "💊",
    title: "Chemist & Cosmetics",
    color: "#ef4444",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    contact: true,
    items: [
      "Medicines", "OTC Medicines", "Skincare", "Haircare",
      "Bath & Body", "Oral Care", "Men Grooming", "Women Hygiene",
      "Makeup & Beauty", "Perfumes & Deodorants",
    ],
  },
];

export default function OthersClient() {
  const searchParams = useSearchParams();
  const hash = searchParams.get("section");
  const sectionRefs = useRef({});

  // Scroll to section from hash
  useEffect(() => {
    if (hash && sectionRefs.current[hash]) {
      setTimeout(() => {
        sectionRefs.current[hash].scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, [hash]);

  return (
    <div className="min-h-screen bg-[#22323c] text-[#f5f5f5]">
      {/* Hero */}
      <div className="bg-[#1a2830] border-b border-white/5 pt-28 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#17d492]/10 border border-[#17d492]/20 rounded-full px-4 py-1.5 mb-5">
            <span className="text-[#17d492] text-xs font-black uppercase tracking-widest">⚡ All Services</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3">
            Everything <span className="text-[#17d492]">Students Need</span>
          </h1>
          <p className="text-white/40 max-w-xl mx-auto text-base">
            From assignments to rentals, tuition to laundry — we've got every student service in one place.
          </p>

          {/* Quick jump links */}
          <div className="flex flex-wrap justify-center gap-2 mt-7">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => sectionRefs.current[s.id]?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="px-3 py-1.5 rounded-full text-xs font-black border border-white/10 text-slate-400 hover:text-white hover:border-white/30 transition"
              >
                {s.emoji} {s.title.split(" ").slice(0, 3).join(" ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
        {SECTIONS.map((section) => (
          <div
            key={section.id}
            id={section.id}
            ref={(el) => (sectionRefs.current[section.id] = el)}
            className={`rounded-2xl border ${section.borderColor} ${section.bgColor} p-6 scroll-mt-24`}
          >
            {/* Section header */}
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{section.emoji}</span>
                <div>
                  <h2 className="text-lg font-black text-white">{section.title}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {section.items.length} services available
                  </p>
                </div>
              </div>
              {section.isLink && (
                <Link
                  href={section.linkHref}
                  className="shrink-0 flex items-center gap-2 text-xs font-black px-4 py-2 rounded-xl border text-[#17d492] border-[#17d492]/30 hover:bg-[#17d492]/10 transition"
                >
                  {section.linkLabel}
                </Link>
              )}
            </div>

            {/* Items grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-5">
              {section.items.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 bg-black/20 rounded-xl px-3 py-2.5 text-sm text-slate-300"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: section.color }}
                  />
                  {item}
                </div>
              ))}
            </div>

            {/* Contact CTA */}
            {section.contact && (
              <a
                href="https://wa.me/917982670413"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-black px-5 py-2.5 rounded-xl transition"
                style={{ backgroundColor: section.color + "20", color: section.color, border: `1px solid ${section.color}40` }}
              >
                <FaWhatsapp size={15} />
                WhatsApp to Enquire
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="max-w-4xl mx-auto px-4 pb-16 text-center">
        <div className="bg-[#1a2830] border border-[#17d492]/15 rounded-2xl px-6 py-8">
          <p className="text-2xl font-black text-white mb-2">Don't see what you need?</p>
          <p className="text-slate-500 text-sm mb-5">We deliver almost everything for students. Just message us!</p>
          <a
            href="https://wa.me/917982670413"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#17d492] text-[#22323c] px-6 py-3 rounded-xl font-black hover:bg-[#14b87e] transition"
          >
            <FaWhatsapp size={16} />
            WhatsApp: 7982670413
          </a>
        </div>
      </div>
    </div>
  );
}
