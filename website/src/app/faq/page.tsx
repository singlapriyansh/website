'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'How does the 7-day return and refund policy work?',
    a: 'We offer doorstep reverse pickup across all major PIN codes in India. As soon as you click "Request 7-Day Return" on your Delivered order page, our delivery partner will pick up the package within 24 to 48 hours. Once inspected, your refund is instantly credited back to your original payment method or UPI account.',
  },
  {
    q: 'Are all products 100% original and verified?',
    a: 'Yes, absolutely. ShopSphere sources products directly from licensed manufacturer brands (including Sony, Nike, Zara, Raymond, Fossil, and Ray-Ban) with authentic serial numbers and manufacturer warranty included in the box.',
  },
  {
    q: 'What payment methods do you support?',
    a: 'We support all major Indian payment methods through Razorpay test mode: UPI (Google Pay, PhonePe, Paytm, BHIM), Debit & Credit Cards (Visa, Mastercard, RuPay), Net Banking across 50+ banks, and Cash on Delivery (COD).',
  },
  {
    q: 'How can I apply discount coupon codes?',
    a: 'On your Shopping Bag page or during Checkout, enter codes like "WELCOME10" (10% off), "FLAT500" (₹500 off on ₹2999+), or "FESTIVE20" (20% off) into the promo box and click Apply. Your discount is validated and subtracted from your order total instantly.',
  },
  {
    q: 'How do I cancel my order?',
    a: 'You can cancel any order directly from your "My Orders" detail page while its status is in "Pending", "Confirmed", or "Processing". Upon cancellation, any reserved item stock is immediately returned to inventory.',
  },
];

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold uppercase tracking-wider">
              Help Center
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Clear answers to common questions about orders, payments, shipping, and returns
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 gap-4"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isOpen ? 'rotate-180 text-rose-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
