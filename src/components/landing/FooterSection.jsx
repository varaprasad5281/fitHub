import React from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Youtube, Linkedin, Music, Instagram } from "lucide-react";

export default function FooterSection() {
  return (
    <footer className="py-16 px-6 border-t border-zinc-800 bg-zinc-900/50">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-black bg-gradient-to-b from-amber-200 to-amber-500 bg-clip-text text-transparent mb-3">
              7%
            </h3>
            <p className="text-zinc-500 text-sm">
              Most people quit. The 7% stay disciplined.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to={createPageUrl("Pricing")} className="text-zinc-500 hover:text-amber-400 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to={createPageUrl("Dashboard")} className="text-zinc-500 hover:text-amber-400 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to={createPageUrl("Leaderboard")} className="text-zinc-500 hover:text-amber-400 transition-colors">
                  Leaderboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to={createPageUrl("Privacy")} className="text-zinc-500 hover:text-amber-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to={createPageUrl("Terms")} className="text-zinc-500 hover:text-amber-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-white font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-sm mb-4">
              <li>
                <a href="mailto:hello@7percent.info" className="text-zinc-500 hover:text-amber-400 transition-colors">
                  hello@7percent.info
                </a>
              </li>
            </ul>
            <div className="flex gap-3">
              <a
                href="https://instagram.com/7percent"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-amber-500/10 border border-zinc-700 hover:border-amber-500/30 flex items-center justify-center text-zinc-500 hover:text-amber-400 transition-all"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com/@7percent"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-amber-500/10 border border-zinc-700 hover:border-amber-500/30 flex items-center justify-center text-zinc-500 hover:text-amber-400 transition-all"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://tiktok.com/@7percent"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-amber-500/10 border border-zinc-700 hover:border-amber-500/30 flex items-center justify-center text-zinc-500 hover:text-amber-400 transition-all"
              >
                <Music className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com/company/7percent"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-amber-500/10 border border-zinc-700 hover:border-amber-500/30 flex items-center justify-center text-zinc-500 hover:text-amber-400 transition-all"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-8 text-center">
          <p className="text-zinc-700 text-xs">
            © {new Date().getFullYear()} 7%. Built for the disciplined.
          </p>
        </div>
      </div>
    </footer>
  );
}