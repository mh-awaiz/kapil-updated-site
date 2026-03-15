"use client";
import { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import ProductCard from "../../components/ProductCard";
import { Search, PackageSearch, Loader2 } from "lucide-react";
import Link from "next/link";
import { use } from "react";

const SLUG_MAP = {
  "snacks-drinks": { id: "snacks_drinks", label: "Snacks & Drinks", emoji: "🍿" },
  "beauty-personal-care": { id: "beauty_personal_care", label: "Beauty & Personal Care", emoji: "💄" },
  "home-lifestyle": { id: "home_lifestyle", label: "Home & Lifestyle", emoji: "🏠" },
  "food-veg": { id: "food_veg", label: "Food – Veg", emoji: "🥦" },
  "food-nonveg": { id: "food_nonveg", label: "Food – Non Veg", emoji: "🍗" },
};

const PRODUCTS_PER_PAGE = 6;

export default function GrocerySubcategoryPage({ params }) {
  const { slug } = use(params);
  const catInfo = SLUG_MAP[slug] || { id: slug, label: slug, emoji: "🛒" };

  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products?category=groceries&subcategory=${catInfo.id}`)
      .then((r) => r.json())
      .then((d) => setProducts(Array.isArray(d) ? d : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [catInfo.id]);

  const filtered = useMemo(() => {
    if (!query) return products;
    const fuse = new Fuse(products, { keys: ["title", "description"], threshold: 0.3 });
    return fuse.search(query).map((r) => r.item);
  }, [products, query]);

  return (
    <div className="min-h-screen bg-[#22323c]">
      <div className="bg-[#1a2830] pt-28 pb-10 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#17d492]/5 blur-[100px] rounded-full -mr-40 -mt-40" />
        <div className="max-w-7xl mx-auto relative z-10">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
            <Link href="/groceries" className="hover:text-[#17d492] transition">Groceries</Link>
            <span className="mx-2">›</span>
            {catInfo.label}
          </p>
          <h1 className="text-4xl font-black text-white">
            {catInfo.emoji} {catInfo.label}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Search */}
        <div className="mb-10 max-w-2xl relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="text-[#17d492]" size={20} />
          </div>
          <input
            type="text"
            placeholder={`Search ${catInfo.label}...`}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setVisibleCount(PRODUCTS_PER_PAGE); }}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-700 bg-[#1a2830] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#17d492]/50 focus:border-[#17d492] transition shadow-2xl"
          />
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="animate-spin text-[#17d492] mb-4" size={40} />
            <p className="font-black tracking-widest uppercase text-xs">Loading...</p>
          </div>
        )}

        {!loading && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.slice(0, visibleCount).length > 0 ? (
                filtered.slice(0, visibleCount).map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 bg-[#1a2830] rounded-3xl border border-dashed border-slate-700">
                  <PackageSearch size={48} className="text-slate-600 mb-4" />
                  <p className="text-xl font-black text-slate-400">No products here yet</p>
                  <p className="text-slate-600 text-sm mt-1">Check back soon — we're stocking up!</p>
                </div>
              )}
            </div>

            {filtered.length > PRODUCTS_PER_PAGE && (
              <div className="mt-14 flex justify-center gap-4">
                {visibleCount < filtered.length && (
                  <button onClick={() => setVisibleCount((p) => p + PRODUCTS_PER_PAGE)}
                    className="bg-[#17d492] text-[#22323c] px-10 py-4 rounded-xl font-black hover:bg-[#14b87e] hover:scale-105 transition shadow-[0_10px_30px_rgba(23,212,146,0.3)]">
                    Load More
                  </button>
                )}
                {visibleCount > PRODUCTS_PER_PAGE && (
                  <button onClick={() => setVisibleCount(PRODUCTS_PER_PAGE)}
                    className="border-2 border-slate-700 text-slate-300 px-10 py-4 rounded-xl font-black hover:bg-slate-800 transition">
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
