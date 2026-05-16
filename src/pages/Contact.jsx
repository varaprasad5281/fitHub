import React, { useState } from 'react';
import { api } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await api.functions.invoke('sendEmail', {
        to: 'team@7percent.info',
        from_name: formData.name,
        subject: `Contact Form: ${formData.subject}`,
        body: `From: ${formData.name} (${formData.email})\n\n${formData.message}`,
      });
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      toast.success('Message sent successfully!');
      setTimeout(() => setSubmitted(false), 5000);
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-5 h-5 text-amber-400" />
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-[0.15em]">Get In Touch</p>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-zinc-400 text-lg">Have a question or feedback? We'd love to hear from you.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-amber-400 mt-1 shrink-0" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Email</h3>
                  <a href="mailto:team@7percent.info" className="text-amber-400 hover:text-amber-300 transition-colors">
                    team@7percent.info
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-amber-400 mt-1 shrink-0" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Response Time</h3>
                  <p className="text-zinc-400 text-sm">Usually within 24 hours</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-amber-400 mt-1 shrink-0" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Location</h3>
                  <p className="text-zinc-400 text-sm">Available globally 24/7</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            {submitted ? (
              <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-8 flex flex-col items-center justify-center text-center h-full">
                <CheckCircle className="w-12 h-12 text-green-400 mb-4" />
                <h3 className="text-white font-semibold text-lg mb-2">Message Sent!</h3>
                <p className="text-zinc-400">
                  Thank you for reaching out. We'll get back to you as soon as possible.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Name</label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600 h-11"
                  />
                </div>

                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Email</label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600 h-11"
                  />
                </div>

                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Subject</label>
                  <Input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What's this about?"
                    className="bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600 h-11"
                  />
                </div>

                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Message</label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us what's on your mind..."
                    rows={5}
                    className="bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold rounded-xl h-11"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* FAQs */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-semibold mb-2">How do I contact support?</h3>
              <p className="text-zinc-400">Use the form above or email team@7percent.info directly. We typically respond within 24 hours.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">What if I need immediate help?</h3>
              <p className="text-zinc-400">For urgent issues, please email with "URGENT" in the subject line and we'll prioritize your request.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">How do I report a bug?</h3>
              <p className="text-zinc-400">Please include as much detail as possible in your message, including what device/browser you're using and the exact steps to reproduce the issue.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Can I request a feature?</h3>
              <p className="text-zinc-400">Absolutely! We love hearing feature requests. Send us your ideas and we'll consider them for future updates.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}