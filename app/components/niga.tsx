"use client";
import Image from "next/image";
import { motion } from "framer-motion";

export default function HeroGradient() {
  return (
    <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden rounded-2xl sm:rounded-3xl max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* Background Image with fade-in scale effect */}
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <Image
          src="/niga.webp"
          alt="Doctor"
          fill
          className="object-cover"
          priority
        />
      </motion.div>

      {/* Black Shade Gradient */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="absolute inset-0 bg-gradient-to-r from-black/90 sm:from-black/80 via-black/60 sm:via-black/50 to-transparent"
      />

      {/* Text Content */}
      <div className="absolute inset-0 flex items-center px-4 sm:px-8 md:px-12 lg:px-16">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
          className="max-w-[280px] sm:max-w-lg lg:max-w-xl text-white"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-3 sm:mb-6">
            Transform Your Healthcare <br className="hidden sm:block" /> Journey With{" "}
            <span className="text-green-400">Medilink</span>
          </h1>

          <p className="text-gray-200 mb-4 sm:mb-8 text-xs sm:text-sm md:text-base lg:text-lg">
            Experience secure health management, personalized medicine tracking,
            and real-time doctor–patient coordination—all in one platform.
          </p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { delayChildren: 1, staggerChildren: 0.2 },
              },
            }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4"
          >
            <motion.button
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-green-400 text-green-900 text-sm sm:text-base font-medium rounded-full shadow hover:bg-green-300 transition"
            >
              Book A Demo
            </motion.button>

            <motion.button
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="px-4 sm:px-6 py-2 sm:py-3 border border-white text-white text-sm sm:text-base rounded-full hover:bg-white hover:text-green-700 transition"
            >
              Learn More
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
