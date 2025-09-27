"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import AuthComponent from "@/app/components/AuthComponents";
import { signIn, useSession } from "next-auth/react";

export default function AuthPage() {
  const slides = [
    "/img1.jpg",
    "/img2.jpg",
    "/img3.jpg",
    "/img4.jpg",
    "/img5.jpg",
  ];
  const [index, setIndex] = useState(0);
  const session = useSession();
  useEffect(() => {
    if (session) {
      if (session?.status === "authenticated") {
        window.location.href = "/dashboard";
      }
    }
  }, [session]);
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 8500);
    return () => clearInterval(id);
  }, [slides.length]);
  const handleAuthSuccess = (userData: {
    username: string;
    email: string;
    isNewUser: boolean;
  }) => {
    console.log("Auth successful:", userData);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br bg-green-100">
      {/* Ambient blurred glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 w-[520px] h-[520px] rounded-full bg-green-400/20 blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-[640px] h-[640px] rounded-full bg-green-300/25 blur-3xl"></div>
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[780px] h-[780px] rounded-full bg-green-200/20 blur-[100px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(600px_300px_at_0%_0%,rgba(0,199,88,0.08),transparent),radial-gradient(800px_400px_at_100%_100%,rgba(0,165,68,0.08),transparent)]"></div>
      </div>

      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Promo Panel */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="hidden md:block"
          >
            <div className="relative rounded-3xl overflow-hidden border border-white/40 bg-white/40 backdrop-blur-md shadow-xl">
              {/* Soft overlay tint */}
              <div
                className="absolute inset-0 bg-gradient-to-tr from-green-200/20 to-green-50/10"
                aria-hidden="true"
              ></div>
              {/* Endless loop slider (no text) */}
              <div className="relative h-[600px] w-[full] overflow-hidden">
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={slides[index]}
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: "0%", opacity: 1 }}
                    exit={{ x: "-100%", opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={slides[index]}
                      alt=""
                      fill
                      priority
                      sizes="(min-width: 768px) 50vw, 100vw"
                      draggable={false}
                      className="select-none pointer-events-none object-cover object-center"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* No text inside the image as requested; keeping the panel minimal */}
          </motion.div>

          {/* Right Auth Card */}
          <div>
            <AuthComponent onAuthSuccess={handleAuthSuccess} />

            {/* Footer */}
            <div className="text-center mt-8">
              <p className="text-sm text-gray-700 font-medium">
                Medilink - A Health Platform You Can Trust
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
