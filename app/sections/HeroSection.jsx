"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const words = [
  "Lowest Prices Guaranteed.",
  "Free Delivery for Jamia Students.",
  "Cash on Delivery Available.",
];

const Hero = () => {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const currentWord = words[wordIndex];
    if (charIndex < currentWord.length) {
      const timeout = setTimeout(() => {
        setText((prev) => prev + currentWord[charIndex]);
        setCharIndex(charIndex + 1);
      }, 60); // Slightly faster for better UX
      return () => clearTimeout(timeout);
    } else {
      const pause = setTimeout(() => {
        setText("");
        setCharIndex(0);
        setWordIndex((prev) => (prev + 1) % words.length);
      }, 2000);
      return () => clearTimeout(pause);
    }
  }, [charIndex, wordIndex]);

  return (
    <section className="relative overflow-hidden bg-[#22323c] text-[#f5f5f5] min-h-[85vh] flex items-center">
      {/* Visual Accent: Subtle background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#17d492]/10 blur-[120px] rounded-full -mr-64 -mt-64"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col-reverse md:flex-row items-center gap-12 lg:gap-20 py-15">
          
          {/* Image Container with Floating Animation */}
          <div className="w-full md:w-1/2 flex justify-center animate-in fade-in zoom-in duration-700">
            <div className="relative group">
              {/* Subtle background glow for the image */}
              <div className="absolute inset-0 bg-[#17d492]/20 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-500"></div>
              <Image
                src="/background.png"
                alt="Stationery Items"
                width={550}
                height={550}
                className="relative object-contain drop-shadow-2xl motion-safe:animate-bounce-slow"
                priority
              />
            </div>
          </div>

          {/* Content */}
          <div className="w-full md:w-1/2 text-center md:text-left">
            <div className="inline-block px-3 py-1 rounded-full bg-[#17d492]/10 border border-[#17d492]/20 text-[#17d492] text-xs font-bold tracking-widest uppercase mb-6">
              Official Hub
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black leading-[1.1] tracking-tight">
              ASSIGNMENT WORK & <br /> 
              <span className="text-[#17d492]">STATIONERY HUB</span>
            </h1>
            
            <p className="mt-2 text-xl md:text-2xl font-medium text-slate-300">
              by Kapil Gupta
            </p>

            {/* Typewriter - Set a min-height to prevent layout shift */}
            <div className="mt-6 h-10 flex items-center justify-center md:justify-start">
              <p className="text-lg md:text-xl font-mono text-[#17d492] border-r-2 border-[#17d492] pr-1 animate-caret">
                {text}
              </p>
            </div>

            {/* Static Features with Icons */}
            <div className="mt-8 grid grid-cols-1 gap-3">
              {[
                "Lowest price in the market",
                "Free delivery for Jamia students",
                "Hassle-free Cash on Delivery",
                "Mon-Fri Delivery (Working Days Only)",
                "For Urgent Delivery Message Me",
                "For Assignment Work or Drawing Work, feel free to message us for any doubts"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 justify-center md:justify-start text-slate-400">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#17d492]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row justify-center md:justify-start gap-4">
              <Link href="#products" className="w-full sm:w-auto">
                <button className="w-full bg-[#17d492] text-[#22323c] px-8 py-4 rounded-xl font-bold hover:bg-[#14b87e] hover:-translate-y-1 transition-all shadow-[0_10px_20px_-10px_rgba(23,212,146,0.4)]">
                  Shop Products
                </button>
              </Link>
              <Link href="/#aboutme" className="w-full sm:w-auto">
                <button className="w-full border-2 border-slate-700 text-slate-300 px-8 py-4 rounded-xl font-bold hover:bg-slate-800 hover:text-white transition-all">
                  Contact Kapil
                </button>
              </Link>
            </div>
          </div>
          
        </div>
      </div>

      {/* Add this to your globals.css or a style tag */}
      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
        @keyframes caret {
          50% { border-color: transparent; }
        }
        .animate-caret {
          animation: caret 0.8s step-end infinite;
        }
      `}</style>
    </section>
  );
};

export default Hero;