'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Clock } from 'lucide-react';
import Link from 'next/link';

export default function DealTimer() {
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const format = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 my-10">
      <div className="flex items-center gap-4 text-center md:text-left">
        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
          <Flame className="w-8 h-8 text-amber-300 animate-pulse" />
        </div>
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-200">
            Limited Time Flash Sale
          </span>
          <h3 className="text-xl sm:text-3xl font-black tracking-tight mt-0.5">
            Deals of the Day: Up to 50% OFF
          </h3>
          <p className="text-xs sm:text-sm text-white/90 mt-1">
            Prices slash automatically. Additional 20% discount applies at checkout with code FESTIVE20.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-white/80" />
          <div className="flex items-center gap-1.5 font-mono text-sm sm:text-base font-black">
            <span className="bg-slate-900/80 px-3 py-2 rounded-xl border border-white/20">
              {format(timeLeft.hours)}
            </span>
            <span className="text-xl">:</span>
            <span className="bg-slate-900/80 px-3 py-2 rounded-xl border border-white/20">
              {format(timeLeft.minutes)}
            </span>
            <span className="text-xl">:</span>
            <span className="bg-slate-900/80 px-3 py-2 rounded-xl border border-white/20 text-amber-300">
              {format(timeLeft.seconds)}
            </span>
          </div>
        </div>

        <Link
          href="/products?deal=1"
          className="px-5 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs sm:text-sm shadow-md transition active:scale-95 whitespace-nowrap"
        >
          Grab Deals
        </Link>
      </div>
    </div>
  );
}
