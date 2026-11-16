'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    tag: 'FESTIVE COLLECTION 2026',
    title: 'Pure Craftsmanship & Modern Street Elegance',
    subtitle: 'Discover heavyweight organic hoodies, tailored linen shirts, and artisanal silk ensembles up to 50% OFF.',
    ctaText: 'Shop New Season',
    ctaLink: '/products?category=men',
    bgGradient: 'from-slate-900 via-indigo-950 to-slate-900',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&auto=format&fit=crop',
    accent: 'text-amber-400',
  },
  {
    id: 2,
    tag: 'FLAGSHIP AUDIO & WEARABLES',
    title: 'Immersive Acoustics. Uncompromised Power.',
    subtitle: 'Studio planar drivers, hybrid 45dB noise cancellation, and carbon mechanical gear built for perfectionists.',
    ctaText: 'Explore Tech Drops',
    ctaLink: '/products?category=electronics',
    bgGradient: 'from-slate-950 via-slate-900 to-indigo-950',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop',
    accent: 'text-rose-400',
  },
  {
    id: 3,
    tag: 'LIMITED RUN SNEAKERS & HOROLOGY',
    title: 'The Court & Chrono Edit',
    subtitle: 'Nappa leather low-top sneakers and 24-jewel Japanese automatic timepieces crafted for generations.',
    ctaText: 'Browse Collection',
    ctaLink: '/products?category=footwear',
    bgGradient: 'from-slate-900 via-stone-900 to-slate-950',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop',
    accent: 'text-emerald-400',
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[current];

  return (
    <div className="relative w-full overflow-hidden bg-slate-900 min-h-[460px] sm:min-h-[520px] flex items-center">
      {/* Background with overlay */}
      <div className="absolute inset-0">
        <img
          src={slide.image}
          alt={slide.title}
          className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity scale-105 transition-all duration-1000"
        />
        <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgGradient} opacity-90`} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full">
        <div className="max-w-2xl space-y-6 animate-in fade-in duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{slide.tag}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
            {slide.title}
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 font-normal leading-relaxed max-w-xl">
            {slide.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href={slide.ctaLink}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-rose-600/30 flex items-center gap-2 group transition active:scale-95"
            >
              <span>{slide.ctaText}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/products?deal=1"
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold text-sm transition"
            >
              View Daily Deals
            </Link>
          </div>
        </div>
      </div>

      {/* Slide Navigation Arrows */}
      <button
        onClick={() => setCurrent((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1))}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm border border-white/10 flex items-center justify-center transition"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={() => setCurrent((prev) => (prev + 1) % SLIDES.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm border border-white/10 flex items-center justify-center transition"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              current === i ? 'w-8 bg-rose-500' : 'w-2 bg-white/40'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
