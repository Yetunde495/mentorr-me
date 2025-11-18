"use client";

import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const footerSections = [
    {
      title: "Product",
      links: [
         { href: "/signin", label: "Get Started" },
        { href: "/about", label: "About Us" },
        { href: "/contact", label: "Contact Us" },
       
      ],
    },
    {
      title: "Support",
      links: [
        // { href: "/contact", label: "Contact" },
        { href: "/terms", label: "Terms of Service" },
        { href: "/privacy", label: "Privacy Policy" },
      ],
    },
  ];

  return (
   <footer className="bg-muted/30 border-t border-slate-200">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {/* Brand Section */}
      <div className="space-y-4 col-span-2">
       <Link href={`/`} className="flex items-center gap-1">
            <img
              src="/logo.png"
              alt="logo"
              className={`h-8 w-auto transition-all`}
            />

            <p className="text-xl text-black dark:text-white font-semibold font-serif italic tracking-tighter">
              PivotLab
            </p>
          </Link>
        <p className="text-muted-foreground text-sm">
          CurateLearn PivotLab is a 3-weeks mentorship program designed to help beginners and professionals transition, track, and optimize learning experiences effortlessly. 
          Empowering learners to grow and educators to manage learning with clarity and ease.
        </p>
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>support@curatelearn.com</span>
          </div>
          <div className="hidden items-center space-x-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>+1 (555) 987-6543</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              Lagos, Nigeria
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
          © 2025 CurateLearn. All rights reserved.
        </p>
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

    
  </div>
</footer>

  );
}
