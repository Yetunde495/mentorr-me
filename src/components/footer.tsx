"use client";

import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const footerSections = [
    {
      title: "Product",
      links: [
        { href: "/pricing", label: "Pricing" },
        { href: "/about", label: "About Us" },
        { href: "/blog", label: "Blog" },
        { href: "/pricing", label: "Get Started" },
      ],
    },
    {
      title: "Support",
      links: [
        // { href: "/contact", label: "Contact" },
        { href: "/terms", label: "Terms of Service" },
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/prop-firm-disclaimer", label: "Prop Firm Disclaimer Policy" },
      ],
    },
  ];

  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4 col-span-2">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/assets/logo.svg" className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold gradient-text bg-clip-text! text-transparent py-1">
                technests
              </span>
            </Link>
            <p className="text-muted-foreground text-sm">
              TechNests is your AI co-pilot in the world of prop
              trading—offering end-to-end automation for strategy planning,
              trade execution, and risk protection. Our platform empowers
              traders to scale accounts, stay funded, and trade with discipline,
              without giving up control or ownership of their journey.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>support@technests.ai</span>
              </div>
              <div className="hidden items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>
                  30 North Gould Street, Ste R Sheridan, WY 82801, United States
                </span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="font-semibold">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © 2025 CurateLearn. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
