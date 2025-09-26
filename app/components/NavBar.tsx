"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { HiChevronDown, HiMenuAlt3, HiX, HiArrowRight } from "react-icons/hi";
import gsap from "gsap";
import Image from "next/image";

export default function Navbar() {
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const linksRef = useRef<HTMLAnchorElement[]>([]);
  const productMenuRef = useRef<HTMLDivElement | null>(null);

  // Animate in when opening mobile menu

  useEffect(() => {
    if (isMobileOpen && mobileMenuRef.current) {
      gsap.fromTo(
        mobileMenuRef.current,
        { x: "100%", opacity: 0 },
        { x: "0%", opacity: 1, duration: 0.6, ease: "power3.out" }
      );

      // Animate links inside
      gsap.fromTo(
        linksRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          delay: 0.2,
          ease: "power3.out",
        }
      );
    }
  }, [isMobileOpen]);

  // Animate Product dropdown (desktop)
  useEffect(() => {
    if (productMenuRef.current) {
      if (isProductOpen) {
        gsap.fromTo(
          productMenuRef.current,
          { y: -20, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.4,
            ease: "power3.out",
          }
        );
      } else {
        gsap.to(productMenuRef.current, {
          y: -20,
          opacity: 0,
          scale: 0.95,
          duration: 0.3,
          ease: "power2.inOut",
        });
      }
    }
  }, [isProductOpen]);

  const closeMobileMenu = () => {
    if (mobileMenuRef.current) {
      gsap.to(linksRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: "power3.in",
      });

      gsap.to(mobileMenuRef.current, {
        x: "100%",
        opacity: 0,
        duration: 0.6,
        ease: "power3.in",
        delay: 0.2,
        onComplete: () => setIsMobileOpen(false),
      });
    }
  };

  return (
    <header className="w-full bg-white rounded shadow-sm fixed top-0 left-0 z-50">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Image 
            src="/logo.png"
            alt="MediLink Logo"
            width={40}
            height={40}
          />

          <span className="text-xl font-semibold text-gray-900">MediLink</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8 text-gray-700">
          <Link href="/" className="hover:text-green-600 transition active:scale-95">
            Home
          </Link>

          {/* Product Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setIsProductOpen(true)}
            onMouseLeave={() => setIsProductOpen(false)}
          >
            <button className="flex items-center space-x-1 hover:text-green-600 transition active:scale-95">
              <span>Product</span>
              <HiChevronDown className="w-4 h-4" />
            </button>
            {isProductOpen && (
              <div
                ref={productMenuRef}
                className="absolute top-full mt-2 w-48 bg-white shadow-lg rounded-md border border-gray-100 py-2 opacity-0 pointer-events-auto"
              >
                <Link
                  href="/product/feature1"
                  className="block px-4 py-2 hover:bg-gray-100 text-sm transition active:scale-95"
                >
                  Feature 1
                </Link>
                <Link
                  href="/product/feature2"
                  className="block px-4 py-2 hover:bg-gray-100 text-sm transition active:scale-95"
                >
                  Feature 2
                </Link>
              </div>
            )}
          </div>

          <Link href="/doctors" className="hover:text-green-600 transition active:scale-95">
            For Doctors
          </Link>
          <Link href="/patients" className="hover:text-green-600 transition active:scale-95">
            For Patients
          </Link>
          <Link href="/contact" className="hover:text-green-600 transition active:scale-95">
            Contact
          </Link>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            href="/auth"
            className="px-5 py-2 rounded-full border border-green-500 text-green-600  
            transition hover:bg-black hover:text-white active:scale-95"
          >
            Log In
          </Link>
          <Link
            href="/auth"
            className="px-5 py-2 rounded-full bg-green-500 text-white 
            hover:bg-green-600 transition active:scale-95"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsMobileOpen(true)}
          className="md:hidden text-3xl text-gray-800"
        >
          <HiMenuAlt3 />
        </button>
      </nav>

      {/* Mobile Full-Page Menu */}
      {isMobileOpen && (
        <div
          ref={mobileMenuRef}
          className="fixed inset-0 bg-black text-white z-50 flex flex-col"
        >
          {/* Close Button */}
          <div className="flex justify-end p-6">
            <button
              onClick={closeMobileMenu}
              className="text-3xl hover:text-gray-300 transition active:scale-90"
            >
              <HiX />
            </button>
          </div>

          {/* Centered Nav */}
          <div className="flex-1 flex flex-col items-center justify-center space-y-8 text-2xl font-medium">
            {[
              { href: "/", label: "Home" },
              { href: "/product/feature1", label: "Product" },
              { href: "/doctors", label: "For Doctors" },
              { href: "/patients", label: "For Patients" },
              { href: "/contact", label: "Contact" },
            ].map((link, i) => (
              <Link
                key={i}
                href={link.href}
                onClick={closeMobileMenu}
                ref={(el) => {
                  if (el) linksRef.current[i] = el;
                }}
                className="hover:text-gray-300 transition active:scale-95"
              >
                {link.label}{" "}
                {link.label === "Product" && (
                  <HiArrowRight className="inline-block" />
                )}
              </Link>
            ))}
          </div>

          {/* Bottom Buttons */}
          <div className="px-6 pb-10 space-y-4">
            <Link
              href="/auth"
              onClick={closeMobileMenu}
              ref={(el) => {
                if (el) linksRef.current[5] = el;
              }}
              className="block w-full text-center px-5 py-3 rounded-full border border-white 
              transition hover:bg-white hover:text-black active:scale-95"
            >
              Log In
            </Link>
            <Link
              href="/auth"
              onClick={closeMobileMenu}
              ref={(el) => {
                if (el) linksRef.current[6] = el;
              }}
              className="block w-full text-center px-5 py-3 rounded-full bg-white text-black 
              hover:bg-gray-200 transition active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
