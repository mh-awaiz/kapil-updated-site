"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { MdCookie, MdSpa, MdHome, MdOutdoorGrill } from "react-icons/md";
import { GiChickenLeg } from "react-icons/gi";
import { FaShoppingBasket } from "react-icons/fa";

const GROCERY_CATEGORIES = [
  {
    id: "snacks_drinks",
    label: "Snacks & Drinks",
    icon: <MdCookie size={28} />,
    href: "/groceries/snacks-drinks",
    color: "from-orange-500/20 to-yellow-500/20",
    border: "border-orange-500/30",
    iconColor: "text-orange-400",
  },
  {
    id: "beauty_personal_care",
    label: "Beauty & Personal Care",
    icon: <MdSpa size={28} />,
    href: "/groceries/beauty-personal-care",
    color: "from-pink-500/20 to-purple-500/20",
    border: "border-pink-500/30",
    iconColor: "text-pink-400",
  },
  {
    id: "home_lifestyle",
    label: "Home & Lifestyle",
    icon: <MdHome size={28} />,
    href: "/groceries/home-lifestyle",
    color: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/30",
    iconColor: "text-blue-400",
  },
  {
    id: "food_veg",
    label: "Food – Veg",
    icon: <MdOutdoorGrill size={28} />,
    href: "/groceries/food-veg",
    color: "from-green-500/20 to-emerald-500/20",
    border: "border-green-500/30",
    iconColor: "text-green-400",
  },
  {
    id: "food_nonveg",
    label: "Food – Non Veg",
    icon: <GiChickenLeg size={28} />,
    href: "/groceries/food-nonveg",
    color: "from-red-500/20 to-orange-500/20",
    border: "border-red-500/30",
    iconColor: "text-red-400",
  },
];

export default function GroceriesPreview() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    fetch("/api/products?category=groceries&limit=3")
      .then((r) => r.json())
      .then((d) => setFeatured(Array.isArray(d) ? d.slice(0, 3) : []))
      .catch(() => {});
  }, []);

  return (
    <section id="groceries" className="bg-[#1a2830] py-24 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-[#17d492]/20 to-transparent" />
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17d492]/10 border border-[#17d492]/20 text-[#17d492] text-xs font-bold tracking-widest uppercase mb-4">
            <FaShoppingBasket size={12} />
            New Section
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Groceries & <span className="text-[#17d492]">Essentials</span>
          </h2>
          <p className="text-slate-400 mt-4 font-medium max-w-xl mx-auto">
            Your daily essentials — snacks, beauty products, household items and
            fresh food, delivered fast.
          </p>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-14">
          {GROCERY_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className={`flex flex-col items-center gap-3 p-5 rounded-2xl bg-gradient-to-br ${cat.color} border ${cat.border} hover:scale-105 transition-transform duration-200`}
            >
              <span className={cat.iconColor}>{cat.icon}</span>
              <span className="text-sm font-bold text-white text-center leading-tight">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Featured */}
        {featured.length > 0 && (
          <>
            <h3 className="text-xl font-black text-white mb-6">
              Featured Grocery Items
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {featured.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/groceries"
            className="inline-flex items-center gap-2 bg-[#17d492] text-[#22323c] px-10 py-4 rounded-xl font-black hover:bg-[#14b87e] hover:-translate-y-1 transition-all shadow-[0_10px_20px_-10px_rgba(23,212,146,0.4)]"
          >
            Shop All Groceries →
          </Link>
        </div>
      </div>
    </section>
  );
}
