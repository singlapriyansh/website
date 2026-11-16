import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ShoppingBag, ShieldCheck, Heart, Sparkles, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider">
              Our Journey
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Crafting India&apos;s Next Generation E-Commerce Experience
            </h1>
            <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
              ShopSphere was founded with a singular mission: combine the uncompromising variety of Amazon with the elevated aesthetic and curation of Myntra.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl w-fit">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Direct Brand Authentic</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Zero third-party counterfeit risk. Every product is sourced straight from verified brands and licensed ateliers.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl w-fit">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Obsessive Quality</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                From 450 GSM French Terry cotton to titanium aviation eyewear, we curate only items engineered to last years.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Lightning Fulfillment</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Strategic fulfillment centers across Bangalore, Delhi NCR, and Mumbai delivering orders in 1 to 3 days.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
