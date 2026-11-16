import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Privacy & Cookie Policy
            </h1>
            <p className="text-xs text-slate-400 mt-1">Last Updated: November 2026</p>
          </div>

          <div className="space-y-6 text-xs text-slate-600 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">1. Information We Collect</h2>
              <p>
                We collect your name, shipping address, email, phone number, and transaction logs strictly to fulfill your orders and offer personalized product recommendations.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">2. Payment Security</h2>
              <p>
                We never store credit card numbers, expiration dates, or CVV security codes on our servers. All financial transactions are directly encrypted and tokenized by RBI-regulated payment partners.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">3. Data Protection</h2>
              <p>
                We adhere to strict data localization and protection standards under India&apos;s Digital Personal Data Protection (DPDP) Act. We never sell your personal data to external ad networks.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
