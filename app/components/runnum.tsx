"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaLock, FaPrescriptionBottleAlt, FaUserFriends, FaCheckSquare } from "react-icons/fa";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function TrustPage() {
  const statsRef = useRef<(HTMLHeadingElement | null)[]>([]);

  useEffect(() => {
    statsRef.current.forEach((stat) => {
      if (!stat || !stat.dataset.value) return;
      const finalValue = stat.dataset.value;
      const isPercent = finalValue.includes("%");
      const isPlus = finalValue.includes("+");

      const cleanValue = parseInt(finalValue.replace(/\D/g, ""), 10);

      gsap.fromTo(
        stat,
        { innerText: 0 },
        {
          innerText: cleanValue,
          duration: 2,
          ease: "power1.out",
          scrollTrigger: {
            trigger: stat,
            start: "top 90%",
          },
          snap: { innerText: 1 },
          onUpdate: function () {
            const val = Math.floor(parseFloat(stat.innerText));
            if (isPercent) stat.innerText = val + "%";
            else if (isPlus) stat.innerText = val + "+";
            else stat.innerText = val.toString();
          },
        }
      );
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left Side */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
            A Health Platform <br /> You Can{" "}
            <span className="text-green-500">Trust</span>
          </h2>
          <p className="text-gray-600 mb-6">
            Built to ensure security, privacy, and better treatment outcomes
            with measurable results.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-green-500 text-white rounded-full shadow hover:bg-green-600 transition flex items-center space-x-2"
          >
            <span>Get Started</span>
            <svg
              className="w-4 h-4 ml-2 transform -rotate-45"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </motion.button>
        </motion.div>

        {/* Right Side - Stats */}
        <motion.div
          initial="hidden"
          whileInView="show"
          variants={{
            hidden: { opacity: 0, y: 40 },
            show: {
              opacity: 1,
              y: 0,
              transition: {
                staggerChildren: 0.2,
                duration: 0.6,
              },
            },
          }}
          viewport={{ once: true }}
          className="grid grid-cols-2 gap-6"
        >
          {[
            { icon: <FaLock />, value: "98%", text: "Patient data security compliance" },
            { icon: <FaPrescriptionBottleAlt />, value: "50k+", text: "Verified prescriptions managed monthly" },
            { icon: <FaUserFriends />, value: "10k+", text: "Active patients and doctors every week" },
            { icon: <FaCheckSquare />, value: "85%", text: "Improved treatment adherence with reminders" },
          ].map((item, i) => (
            <motion.div
              key={i}
              variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } }}
              whileHover={{ y: -6, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
              className="bg-gray-50 p-6 rounded-xl shadow-sm text-center"
            >
              <div className="text-green-500 text-3xl mx-auto mb-2">{item.icon}</div>
              <h3
                ref={(el) => { statsRef.current[i] = el }}
                data-value={item.value}
                className="text-2xl font-bold text-gray-900"
              >
                {item.value.includes("%") ? "0%" : "0+"}
              </h3>
              <p className="text-sm text-gray-600">{item.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
