"use client";

import { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import ProductCard from "../components/ProductCard";
import { Search, PackageSearch, Loader2, ChevronDown, ChevronUp } from "lucide-react";

const PRODUCTS_PER_PAGE = 6;

const ProductsSection = () => {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load products", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const fuse = useMemo(
    () =>
      new Fuse(products, {
        keys: ["title", "description"],
        threshold: 0.3,
      }),
    [products]
  );

  const filteredProducts = query
    ? fuse.search(query).map((res) => res.item)
    : products;

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  return (
    <section id="products" className="bg-[#22323c] py-24 relative">
      {/* Background Accent matching your theme */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-[#17d492]/20 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Our <span className="text-[#17d492]">Products</span>
          </h2>
          <p className="text-slate-400 mt-4 font-medium">Find everything you need for your semester</p>
        </div>

        {/* Search Bar Refinement */}
        <div className="mb-12 max-w-2xl mx-auto relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="text-[#17d492] group-focus-within:scale-110 transition-transform" size={20} />
          </div>
          <input
            type="text"
            placeholder="Search for pens, drafters, assignments..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setVisibleCount(PRODUCTS_PER_PAGE);
            }}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-700 bg-[#1a2830] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#17d492]/50 focus:border-[#17d492] transition-all shadow-2xl"
          />
          {query && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#17d492] bg-[#17d492]/10 px-2 py-1 rounded">
              {filteredProducts.length} RESULTS
            </div>
          )}
        </div>

        {/* Status Messages */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="animate-spin text-[#17d492] mb-4" size={40} />
            <p className="font-bold tracking-widest uppercase text-xs">Loading Inventory...</p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleProducts.length > 0 ? (
                visibleProducts.map((product) =>
                  product ? <ProductCard key={product._id} product={product} /> : null
                )
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 bg-[#1a2830] rounded-3xl border border-dashed border-slate-700">
                  <PackageSearch size={48} className="text-slate-600 mb-4" />
                  <p className="text-xl font-bold text-slate-400">No products found</p>
                  <button 
                    onClick={() => setQuery("")}
                    className="mt-4 text-[#17d492] text-sm font-bold underline"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </div>

            {/* Pagination / Controls */}
            {filteredProducts.length > PRODUCTS_PER_PAGE && (
              <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4">
                {visibleCount < filteredProducts.length && (
                  <button
                    onClick={() => setVisibleCount((prev) => prev + PRODUCTS_PER_PAGE)}
                    className="group flex items-center gap-2 bg-[#17d492] text-[#22323c] px-10 py-4 rounded-xl font-black hover:scale-105 transition-all shadow-[0_10px_30px_rgba(23,212,146,0.3)]"
                  >
                    Load More <ChevronDown size={20} className="group-hover:translate-y-1 transition-transform" />
                  </button>
                )}

                {visibleCount > PRODUCTS_PER_PAGE && (
                  <button
                    onClick={() => {
                        setVisibleCount(PRODUCTS_PER_PAGE);
                        document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="group flex items-center gap-2 border-2 border-slate-700 text-slate-300 px-10 py-4 rounded-xl font-black hover:bg-slate-800 transition-all"
                  >
                    Show Less <ChevronUp size={20} className="group-hover:-translate-y-1 transition-transform" />
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;