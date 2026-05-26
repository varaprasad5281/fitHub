import React from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Youtube, Instagram } from "lucide-react";

function TikTokIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
    </svg>
  );
}

function XIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

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
                  team@7percent.info
                </a>
              </li>
            </ul>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/7percent.info?igsh=bnM1YjI3ZGUyc29r&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-amber-500/10 border border-zinc-700 hover:border-amber-500/30 flex items-center justify-center text-zinc-500 hover:text-amber-400 transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.youtube.com/@7Percent-info"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-amber-500/10 border border-zinc-700 hover:border-amber-500/30 flex items-center justify-center text-zinc-500 hover:text-amber-400 transition-all"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://www.tiktok.com/@7percent.info"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-amber-500/10 border border-zinc-700 hover:border-amber-500/30 flex items-center justify-center text-zinc-500 hover:text-amber-400 transition-all"
                aria-label="TikTok"
              >
                <TikTokIcon className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/7percenthq?s=21"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-amber-500/10 border border-zinc-700 hover:border-amber-500/30 flex items-center justify-center text-zinc-500 hover:text-amber-400 transition-all"
                aria-label="X (Twitter)"
              >
                <XIcon className="w-4 h-4" />
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