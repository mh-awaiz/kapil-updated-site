"use client";
import { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import ProductCard from "../components/ProductCard";
import { Search, PackageSearch, Loader2 } from "lucide-react";
import {
  FaShoppingCart,
  FaCandyCane,
  FaSpa,
  FaHome,
  FaLeaf,
  FaDrumstickBite,
} from "react-icons/fa";

const SUBCATEGORIES = [
  { id: "all", label: "All", Icon: FaShoppingCart },
  { id: "snacks_drinks", label: "Snacks & Drinks", Icon: FaCandyCane },
  { id: "beauty_personal_care", label: "Beauty & Care", Icon: FaSpa },
  { id: "home_lifestyle", label: "Home & Lifestyle", Icon: FaHome },
  { id: "food_veg", label: "Food – Veg", Icon: FaLeaf },
  { id: "food_nonveg", label: "Food – Non Veg", Icon: FaDrumstickBite },
];

const PRODUCTS_PER_PAGE = 6;

export default function GroceriesPage() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products?category=groceries")
      .then((r) => r.json())
      .then((d) => setProducts(Array.isArray(d) ? d : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list =
      activeTab === "all"
        ? products
        : products.filter((p) => p.subcategory === activeTab);
    if (query) {
      const fuse = new Fuse(list, {
        keys: ["title", "description"],
        threshold: 0.3,
      });
      list = fuse.search(query).map((r) => r.item);
    }
    return list;
  }, [products, activeTab, query]);

  return (
    <div className="min-h-screen bg-[#22323c]">
      {/* Header */}
      <div className="bg-[#1a2830] pt-28 pb-12 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#17d492]/5 blur-[100px] rounded-full -mr-40 -mt-40" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17d492]/10 border border-[#17d492]/20 text-[#17d492] text-xs font-black tracking-widest uppercase mb-4">
            <FaShoppingCart size={11} /> New Section
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Groceries & <span className="text-[#17d492]">Essentials</span>
          </h1>
          <p className="text-slate-400 mt-3 font-medium">
            Fast delivery on everyday essentials
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Subcategory Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
          {SUBCATEGORIES.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id);
                setVisibleCount(PRODUCTS_PER_PAGE);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black whitespace-nowrap transition ${
                activeTab === id
                  ? "bg-[#17d492] text-[#22323c]"
                  : "bg-[#1a2830] text-slate-400 border border-white/10 hover:border-[#17d492]/30"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-10 max-w-2xl relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="text-[#17d492]" size={20} />
          </div>
          <input
            type="text"
            placeholder="Search grocery items..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setVisibleCount(PRODUCTS_PER_PAGE);
            }}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-700 bg-[#1a2830] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#17d492]/50 focus:border-[#17d492] transition shadow-2xl"
          />
          {query && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#17d492] bg-[#17d492]/10 px-2 py-1 rounded">
              {filtered.length} RESULTS
            </div>
          )}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="animate-spin text-[#17d492] mb-4" size={40} />
            <p className="font-black tracking-widest uppercase text-xs">
              Loading...
            </p>
          </div>
        )}

        {!loading && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.slice(0, visibleCount).length > 0 ? (
                filtered
                  .slice(0, visibleCount)
                  .map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 bg-[#1a2830] rounded-3xl border border-dashed border-slate-700">
                  <PackageSearch size={48} className="text-slate-600 mb-4" />
                  <p className="text-xl font-black text-slate-400">
                    No products found
                  </p>
                  <p className="text-slate-600 text-sm mt-1">
                    Check back soon — we're stocking up!
                  </p>
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="mt-4 text-[#17d492] text-sm font-black underline"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              )}
            </div>

            {filtered.length > PRODUCTS_PER_PAGE && (
              <div className="mt-14 flex justify-center gap-4">
                {visibleCount < filtered.length && (
                  <button
                    onClick={() =>
                      setVisibleCount((p) => p + PRODUCTS_PER_PAGE)
                    }
                    className="bg-[#17d492] text-[#22323c] px-10 py-4 rounded-xl font-black hover:bg-[#14b87e] hover:scale-105 transition shadow-[0_10px_30px_rgba(23,212,146,0.3)]"
                  >
                    Load More
                  </button>
                )}
                {visibleCount > PRODUCTS_PER_PAGE && (
                  <button
                    onClick={() => setVisibleCount(PRODUCTS_PER_PAGE)}
                    className="border-2 border-slate-700 text-slate-300 px-10 py-4 rounded-xl font-black hover:bg-slate-800 transition"
                  >
                    Show Less
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
