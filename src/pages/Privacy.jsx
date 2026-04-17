import React from 'react';
import { Shield } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-4xl mx-auto py-12">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-amber-400" />
          <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
        </div>

        <div className="prose prose-invert prose-zinc max-w-none space-y-8">
          <section>
            <p className="text-zinc-400 text-lg mb-8">
              Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">Your Data, Your Control</h2>
            <p className="text-zinc-400 leading-relaxed">
              At 7%, we believe in transparency and protecting your privacy. This policy outlines how we collect, use, and safeguard your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Information We Collect</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4">
              <li>Account information (email, name)</li>
              <li>Profile data (age, gender, fitness goals, height, weight)</li>
              <li>Workout and nutrition logs</li>
              <li>Leaderboard participation data</li>
              <li>Payment information (processed securely via Stripe)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">How We Use Your Information</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              We use your data to:
            </p>
            <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4">
              <li>Provide personalized fitness and nutrition recommendations</li>
              <li>Calculate BMR and calorie targets</li>
              <li>Generate AI-powered workouts and meal plans</li>
              <li>Display leaderboard rankings (if you opt in)</li>
              <li>Send motivational nudges and notifications</li>
              <li>Process payments and manage subscriptions</li>
              <li>Improve our services and user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Data Security</h2>
            <p className="text-zinc-400 leading-relaxed">
              We implement industry-standard security measures to protect your data. All payment information is processed securely through Stripe. We never store your credit card details on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Leaderboard Privacy</h2>
            <p className="text-zinc-400 leading-relaxed">
              Your leaderboard participation is opt-in. You control whether your profile appears publicly. You can toggle this setting anytime in your profile.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Third-Party Services</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              We use the following third-party services:
            </p>
            <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4">
              <li><strong>Stripe:</strong> Payment processing</li>
              <li><strong>OpenAI:</strong> AI-powered features (workouts, meal plans, nudges)</li>
              <li><strong>Base44:</strong> App infrastructure and hosting</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Your Rights</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4">
              <li>Access your personal data</li>
              <li>Update or correct your information</li>
              <li>Delete your account and associated data</li>
              <li>Opt out of leaderboard visibility</li>
              <li>Unsubscribe from notifications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Data Retention</h2>
            <p className="text-zinc-400 leading-relaxed">
              We retain your data for as long as your account is active. If you delete your account, we will remove your personal information within 30 days, except where legally required to retain it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Changes to This Policy</h2>
            <p className="text-zinc-400 leading-relaxed">
              We may update this policy from time to time. We will notify you of significant changes via email or in-app notification.
            </p>
          </section>

          <section className="border-t border-zinc-800 pt-8">
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="text-zinc-400 leading-relaxed">
              If you have questions about this Privacy Policy or your data, contact us at:{' '}
              <a href="mailto:privacy@7percent.info" className="text-amber-400 hover:text-amber-300 underline">
                privacy@7percent.info
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}