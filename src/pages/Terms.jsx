import React from 'react';
import { FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Terms() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-4xl mx-auto py-12">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-3 mb-8">
          <FileText className="w-8 h-8 text-amber-400" />
          <h1 className="text-4xl font-bold text-white">Terms & Conditions</h1>
        </div>

        <div className="prose prose-invert prose-zinc max-w-none space-y-8">
          <section>
            <p className="text-zinc-400 text-lg mb-8">
              Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>

            <p className="text-zinc-400 leading-relaxed">
              By accessing or using the 7% fitness application, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-zinc-400 leading-relaxed">
              These terms constitute a legally binding agreement between you and 7%. By creating an account, you confirm that you are at least 18 years old and have the legal capacity to enter into this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Service Description</h2>
            <p className="text-zinc-400 leading-relaxed">
              7% is a fitness tracking and gamification platform that provides personalized workout plans, nutrition guidance, leaderboard competition, and AI-powered coaching. We reserve the right to modify, suspend, or discontinue any feature at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              You are responsible for:
            </p>
            <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and up-to-date information</li>
              <li>Notifying us immediately of any unauthorized access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Subscription & Billing</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              <strong>Free Tier:</strong> Access to core features including workout logging, basic nutrition tracking, progress monitoring, and community leaderboard viewing. No credit card required. Some advanced features are restricted to paid plans.
            </p>
            <p className="text-zinc-400 leading-relaxed mb-4">
              <strong>7% Pro:</strong> £12.99/month or £99/year. Includes all Free Tier features plus AI-generated workout plans, full nutrition tracking, coaching insights, and priority leaderboard access. Billed via Stripe. Subscriptions auto-renew unless cancelled. Cancellation takes effect at the end of the current billing period.
            </p>
            <p className="text-zinc-400 leading-relaxed mb-4">
              <strong>7% Elite:</strong> £24.99/month or £199/year. Includes all Pro features plus elite leaderboard ranking, private friend challenges, advanced AI coaching, profile highlights, and exclusive Elite badges. Billed via Stripe. Subscriptions auto-renew unless cancelled. Cancellation takes effect at the end of the current billing period.
            </p>
            <p className="text-zinc-400 leading-relaxed">
              <strong>Refunds:</strong> We offer refunds within 7 days of purchase if you're not satisfied. Contact us at team@7percent.info.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. User Conduct</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              You agree NOT to:
            </p>
            <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4">
              <li>Use the service for any illegal purpose</li>
              <li>Manipulate leaderboard rankings or points</li>
              <li>Share false or misleading information</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Reverse engineer or copy our software</li>
              <li>Use automated bots or scripts</li>
            </ul>
            <p className="text-zinc-400 leading-relaxed mt-4">
              Violations may result in account suspension or termination.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Health & Fitness Disclaimer</h2>
            <p className="text-zinc-400 leading-relaxed">
              <strong>Important:</strong> 7% is NOT a medical service. Our workouts, meal plans, and recommendations are for informational purposes only. Always consult a healthcare professional before starting any fitness or nutrition program, especially if you have pre-existing conditions. We are not liable for any injuries or health issues resulting from your use of our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Intellectual Property</h2>
            <p className="text-zinc-400 leading-relaxed">
              All content, designs, logos, and software on 7% are owned by us or our licensors. You may not copy, reproduce, or distribute any part of our service without written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Leaderboard & Competition</h2>
            <p className="text-zinc-400 leading-relaxed">
              Participation in the leaderboard is voluntary and requires a Pro subscription. Rankings are based on points earned through workouts, meals, and consistency. We reserve the right to remove users who manipulate scores or violate our fair play policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Data & Privacy</h2>
            <p className="text-zinc-400 leading-relaxed">
              Your use of 7% is also governed by our Privacy Policy. By using the service, you consent to the collection and use of your data as described in our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Limitation of Liability</h2>
            <p className="text-zinc-400 leading-relaxed">
              To the fullest extent permitted by law, 7% shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service. Our total liability shall not exceed the amount you paid us in the last 12 months.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Termination</h2>
            <p className="text-zinc-400 leading-relaxed">
              You may cancel your account at any time via your profile settings. We may suspend or terminate your account if you violate these terms or engage in fraudulent activity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Changes to Terms</h2>
            <p className="text-zinc-400 leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify you of significant changes via email or in-app notification. Continued use of the service after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">13. Governing Law</h2>
            <p className="text-zinc-400 leading-relaxed">
              These terms are governed by the laws of England and Wales. Any disputes shall be resolved in the courts of England and Wales.
            </p>
          </section>

          <section className="border-t border-zinc-800 pt-8">
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="text-zinc-400 leading-relaxed">
              Questions about these terms? Contact us at:{' '}
              <a href="mailto:team@7percent.info" className="text-amber-400 hover:text-amber-300 underline">
                team@7percent.info
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}