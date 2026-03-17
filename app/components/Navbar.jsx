"use client";
import React, { useState, useEffect } from "react";
import {
  FaShoppingCart,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaUser,
} from "react-icons/fa";
import { MdCookie, MdSpa, MdHome, MdOutdoorGrill } from "react-icons/md";
import { GiChickenLeg } from "react-icons/gi";
import Image from "next/image";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useCart } from "../context/CartContext";

const groceryLinks = [
  {
    label: "Snacks & Drinks",
    href: "/groceries/snacks-drinks",
    icon: <MdCookie size={16} />,
  },
  {
    label: "Beauty & Personal Care",
    href: "/groceries/beauty-personal-care",
    icon: <MdSpa size={16} />,
  },
  {
    label: "Home & Lifestyle",
    href: "/groceries/home-lifestyle",
    icon: <MdHome size={16} />,
  },
  {
    label: "Food – Veg",
    href: "/groceries/food-veg",
    icon: <MdOutdoorGrill size={16} />,
  },
  {
    label: "Food – Non Veg",
    href: "/groceries/food-nonveg",
    icon: <GiChickenLeg size={16} />,
  },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [groceryOpen, setGroceryOpen] = useState(false);
  const { data: session } = useSession();
  const { cart } = useCart();
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Stationery", href: "/#products" },
    { name: "About", href: "/#aboutme" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#22323c]/80 backdrop-blur-md py-2 shadow-lg"
          : "bg-[#22323c] py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-[#17d492] blur-md opacity-0 group-hover:opacity-9 transition-opacity"></div>
              <Image
                src="/logonav.png"
                alt="Kapil Store Logo"
                width={100}
                height={100}
                className="relative h-12 w-auto transition-transform duration-300 group-hover:scale-110"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="relative text-sm font-bold uppercase tracking-widest text-slate-300 hover:text-[#17d492] transition-colors group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#17d492] transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
            {/* Groceries Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-widest text-slate-300 hover:text-[#17d492] transition-colors">
                Groceries
                <FaChevronDown className="text-xs transition-transform duration-300 group-hover:rotate-180" />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 bg-[#1a2830] border border-[#17d492]/20 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                {groceryLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:text-[#17d492] hover:bg-[#17d492]/10 transition"
                  >
                    <span className="text-[#17d492]">{link.icon}</span>
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/groceries"
                  className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-[#17d492] border-t border-[#17d492]/20 hover:bg-[#17d492]/10 transition"
                >
                  All Groceries →
                </Link>
              </div>
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-5">
            {/* Cart */}
            <Link
              href="/cart"
              className="group relative p-2 text-white hover:text-[#17d492] transition-colors"
            >
              <FaShoppingCart
                size={22}
                className="group-hover:rotate-12 transition-transform"
              />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#17d492] text-[#22323c] text-xs font-black flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {session ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserMenu(!userMenu)}
                  className="flex items-center gap-2 text-slate-300 hover:text-[#17d492] transition"
                >
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt=""
                      className="w-8 h-8 rounded-full border-2 border-[#17d492]"
                    />
                  ) : (
                    <FaUser size={18} />
                  )}
                  <FaChevronDown className="text-xs" />
                </button>
                {userMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a2830] border border-[#17d492]/20 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#17d492]/10">
                      <p className="text-sm font-bold text-white truncate">
                        {session.user?.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {session.user?.email}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setUserMenu(false)}
                      className="block px-4 py-2.5 text-sm text-slate-300 hover:text-[#17d492] hover:bg-[#17d492]/10 transition"
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="hidden md:flex items-center gap-2 bg-[#17d492] text-[#22323c] px-4 py-2 rounded-xl font-bold text-sm hover:bg-[#14b87e] transition"
              >
                Sign In
              </button>
            )}

            {/* Mobile toggle */}
            <button
              className="md:hidden text-white hover:text-[#17d492] transition-colors"
              onClick={() => setOpen(!open)}
            >
              {open ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-x-0 top-[72px] bg-[#1a2830] border-t border-white/5 transition-all duration-500 ease-in-out md:hidden overflow-y-auto max-h-[80vh] ${
          open
            ? "translate-y-0 opacity-100 visible"
            : "-translate-y-4 opacity-0 invisible"
        }`}
      >
        <div className="flex flex-col gap-1 p-6">
          {navLinks.map((link, i) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-xl font-black text-white hover:text-[#17d492] transition-all py-3 border-b border-white/5"
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              {link.name}
            </Link>
          ))}

          {/* Mobile Groceries */}
          <div>
            <button
              onClick={() => setGroceryOpen(!groceryOpen)}
              className="w-full flex items-center justify-between text-xl font-black text-white hover:text-[#17d492] transition py-3 border-b border-white/5"
            >
              Groceries
              <FaChevronDown
                className={`text-sm transition-transform ${groceryOpen ? "rotate-180" : ""}`}
              />
            </button>
            {groceryOpen && (
              <div className="pl-4 pb-2">
                {groceryLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 py-2.5 text-slate-400 hover:text-[#17d492] transition text-sm"
                  >
                    <span className="text-[#17d492]">{link.icon}</span>
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/groceries"
                  onClick={() => setOpen(false)}
                  className="block py-2 text-sm text-[#17d492] font-bold"
                >
                  All Groceries →
                </Link>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            {session ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="block py-3 text-slate-300 font-bold hover:text-[#17d492] transition"
                >
                  My Orders
                </Link>
                <button
                  onClick={() => signOut()}
                  className="block py-3 text-red-400 font-bold"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="w-full bg-[#17d492] text-[#22323c] py-3 rounded-xl font-black hover:bg-[#14b87e] transition"
              >
                Sign in with Google
              </button>
            )}
            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Support
              </p>
              <p className="text-[#17d492] font-bold mt-1">+91 7982670413</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
