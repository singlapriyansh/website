import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Terms & Conditions
            </h1>
            <p className="text-xs text-slate-400 mt-1">Last Updated: November 2026</p>
          </div>

          <div className="space-y-6 text-xs text-slate-600 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">1. Acceptance of Terms</h2>
              <p>
                By accessing or purchasing from ShopSphere, you agree to be bound by these Terms of Service and all applicable laws and regulations of India.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">2. Pricing & Currency</h2>
              <p>
                All prices are quoted in Indian Rupees (INR ₹) and are inclusive of applicable GST unless explicitly noted otherwise. We reserve the right to revise promotional pricing at any time.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">3. Payment & Order Verification</h2>
              <p>
                Payment authorization occurs through certified PCI-DSS compliant gateways. Cash on delivery orders are verified via phone or SMS OTP confirmation prior to warehouse dispatch.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">4. 7-Day Return Policy</h2>
              <p>
                Unused items with original manufacturer tags intact may be returned within 7 calendar days from the date of confirmed delivery.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
