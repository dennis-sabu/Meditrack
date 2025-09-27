"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  HiCheckCircle,
  HiShieldCheck,
  HiClock,
  HiUsers,
  HiChartBar,
  HiDeviceMobile,
  HiLockClosed,
  HiExternalLink,
} from "react-icons/hi";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import Navbar from "../components/NavBar";
import DoctorFooter from "../components/DoctorFooter";

gsap.registerPlugin(ScrollTrigger);

const doctorBenefits = [
  {
    icon: <HiUsers className="w-8 h-8 text-green-600" />,
    title: "Patient Management",
    description:
      "Efficiently manage all your patients in one secure platform with complete medical histories and treatment records.",
  },
  {
    icon: <HiClock className="w-8 h-8 text-green-600" />,
    title: "Smart Scheduling",
    description:
      "Advanced appointment scheduling system that optimizes your time and reduces no-shows with automated reminders.",
  },
  {
    icon: <HiChartBar className="w-8 h-8 text-green-600" />,
    title: "Treatment Analytics",
    description:
      "Track patient progress with detailed analytics and insights to improve treatment outcomes and decision-making.",
  },
  {
    icon: <HiShieldCheck className="w-8 h-8 text-green-600" />,
    title: "Secure Prescription Management",
    description:
      "Create, update, and manage digital prescriptions with dosage, timing, and food guidance while keeping patient data protected.",
  },
  {
    icon: <HiDeviceMobile className="w-8 h-8 text-green-600" />,
    title: "Mobile Access",
    description:
      "Access patient information, prescribe medications, and manage appointments from any device, anywhere.",
  },
  {
    icon: <HiLockClosed className="w-8 h-8 text-green-600" />,
    title: "HIPAA Compliance",
    description:
      "Fully compliant with healthcare privacy regulations ensuring patient data security and legal compliance.",
  },
];

const securityFeatures = [
  "256-bit AES encryption for all data",
  "Two-factor authentication (2FA)",
  "Regular security audits and updates",
  "HIPAA/GDPR compliant infrastructure",
  "Secure data backup and recovery",
  "Role-based access controls",
];

export default function ForDoctorsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const benefitsRef = useRef<HTMLElement>(null);
  const securityRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Hero fade in
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
      );
    }

    // Benefits stagger animation
    if (benefitsRef.current) {
      const cards = benefitsRef.current.querySelectorAll(".benefit-card");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: benefitsRef.current,
            start: "top 85%",
          },
        }
      );
    }

    // Security block slide-up
    if (securityRef.current) {
      gsap.fromTo(
        securityRef.current,
        { opacity: 0, y: 80 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: securityRef.current,
            start: "top 85%",
          },
        }
      );
    }
  }, []);

  const handleDoctorLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      window.open("https://admin.imedtrack.in", "_blank", "noopener,noreferrer");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="pt-24 pb-16 bg-gradient-to-br from-green-50 to-blue-50"
      >
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Empower Your Practice with
              <span className="text-green-600"> Meditrack</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Join thousands of healthcare professionals who trust Meditrack for
              secure patient management, streamlined workflows, and improved
              patient outcomes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleDoctorLogin}
                disabled={isLoading}
                className="inline-flex items-center justify-center px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <HiLockClosed className="mr-2" />
                    Login as Doctor
                    <HiExternalLink className="ml-2" />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative"
          >
            <Image
              src="/img1.jpg"
              alt="Doctor using Meditrack"
              width={600}
              height={500}
              className="rounded-2xl shadow-2xl object-cover"
              priority
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="absolute -top-4 -right-4 bg-white p-4 rounded-xl shadow-lg border"
            >
              <div className="flex items-center space-x-2">
                <HiCheckCircle className="w-6 h-6 text-green-600" />
                <span className="font-semibold text-gray-800">
                  HIPAA Compliant
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section ref={benefitsRef} className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6"
            >
              Why Doctors Choose{" "}
              <span className="text-green-600">Meditrack</span>
            </motion.h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Streamline your practice with advanced tools designed specifically
              for healthcare professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {doctorBenefits.map((benefit, index) => (
                <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -6 }}
                className="benefit-card bg-gray-50 p-8 rounded-2xl shadow-[0_4px_12px_rgba(34,197,94,0.25)] hover:shadow-[0_8px_28px_rgba(34,197,94,0.35)] transition-all duration-300"
                >
                <div className="mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
                </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Compliance Section */}
      <section ref={securityRef} className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                <span className="text-green-400">Bank-Level Security</span> for
                Your Practice
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Your patients trust you with their most sensitive information.
                We ensure that trust is protected with enterprise-grade
                security.
              </p>
              <div className="space-y-4">
                {securityFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <HiShieldCheck className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Security Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <Image
                src="/img2.jpg"
                alt="Secure medical data"
                width={500}
                height={400}
                className="rounded-2xl shadow-2xl object-cover"
              />
              <div className="absolute inset-0 bg-green-600 bg-opacity-20 rounded-2xl flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="bg-white bg-opacity-90 p-6 rounded-xl"
                >
                  <HiShieldCheck className="w-16 h-16 text-green-600 mx-auto mb-2" />
                  <p className="text-gray-800 font-semibold text-center">
                    HIPAA Certified
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <DoctorFooter />
    </div>
  );
}
