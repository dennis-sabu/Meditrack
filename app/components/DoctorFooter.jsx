"use client";
import Image from "next/image";
import { FaFacebookF, FaInstagram, FaGithub } from "react-icons/fa";

export default function DoctorFooter() {
  return (
    <div className="w-full">
      {/* Footer - Only the black section without FAQ */}
      <footer className="border-t pt-8 mt-16 rounded-t-3xl bg-black whitespace-break-spaces text-white pb-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Meditrack Logo"
              width={40}
              height={40}
              className="object-contain"
              loading="lazy"
            />
            <span className="font-bold text-xl">Meditrack</span>
          </div>

          {/* Nav Links */}
          <nav className="flex gap-6 text-sm text-white-700">
            <a
              className="hover:text-green-500 transition"
              href="/"
            >
              Home
            </a>
            <a
              className="hover:text-green-500 transition"
              href="#"
            >
              How it works
            </a>
            <a 
              className="hover:text-green-500 transition"
              href="/doctors"
            >
              For doctors
            </a>
            <a 
              className="hover:text-green-500 transition"
              href="/patients"
            >
              For patients
            </a>
          </nav>

          {/* Contact / Social */}
          <div 
            id="contact"
            className="flex flex-col items-start gap-4"
          >
            <form
              action="mailto:contact@meditrack.com"
              method="GET"
              className="flex gap-2"
            >
              <input
                type="hidden"
                name="subject"
                value="Meditrack Contact Request"
              />
              <input
                type="email"
                name="body"
                required
                placeholder="Your email"
                className="px-3 py-2 rounded-md bg-green-100 text-black text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                aria-label="Your email"
              />
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 transition text-white px-4 py-2 rounded-md text-sm"
              >
                Send
              </button>
            </form>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t mt-6 pt-4 pb-4 text-sm text-gray-400 max-w-7xl mx-auto px-6">
          {/* Copyright and Links Row */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <p>© All rights reserved. Meditrack</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-green-500 transition">Privacy Policies</a>
              <a href="#" className="hover:text-green-500 transition">Terms & Conditions</a>
              <a href="#" className="hover:text-green-500 transition">Back to top</a>
            </div>
          </div>
          
          {/* Social Icons - Centered */}
          <div className="flex gap-4 text-xl justify-center">
            <a 
              href="https://www.facebook.com/meditrack" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Facebook" 
              className="hover:text-blue-500 transition-colors duration-300 transform hover:scale-110"
            >
              <FaFacebookF />
            </a>
            <a 
              href="https://www.instagram.com/meditrack" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Instagram" 
              className="hover:text-pink-500 transition-colors duration-300 transform hover:scale-110"
            >
              <FaInstagram />
            </a>
            <a 
              href="https://github.com/meditrack" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="GitHub" 
              className="hover:text-gray-400 transition-colors duration-300 transform hover:scale-110"
            >
              <FaGithub />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}