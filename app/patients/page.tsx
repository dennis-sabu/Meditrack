"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { HiHeart, HiCalendar, HiBell, HiShieldCheck, HiUserGroup, HiChatAlt2 } from "react-icons/hi";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import Navbar from "../components/NavBar";
import DoctorFooter from "../components/DoctorFooter";

gsap.registerPlugin(ScrollTrigger);

const patientBenefits = [
  {
    icon: <HiCalendar className="w-8 h-8 text-green-600" />,
    title: "Easy Appointment Booking",
    description: "Find doctors by specialty, availability, and location—book in seconds with instant confirmation."
  },
  {
    icon: <HiBell className="w-8 h-8 text-green-600" />,
    title: "Smart Medication Reminders",
    description: "Never miss a dose again with personalized reminders and schedule tracking across devices."
  },
  {
    icon: <HiShieldCheck className="w-8 h-8 text-green-600" />,
    title: "Secure Health Records",
    description: "All your medical history, prescriptions, and lab results stored safely with full privacy control."
  },
  {
    icon: <HiHeart className="w-8 h-8 text-green-600" />,
    title: "Personalized Care Plans",
    description: "Track treatment progress and receive data-driven adjustments for better health outcomes."
  },
  {
    icon: <HiUserGroup className="w-8 h-8 text-green-600" />,
    title: "Doctor & Family Sharing",
    description: "Securely share records with doctors or caregivers using OTP-based permissions."
  },
  {
    icon: <HiChatAlt2 className="w-8 h-8 text-green-600" />,
    title: "Chat & Follow-up",
    description: "Stay in touch with your healthcare providers through secure communication channels."
  }
];

const privacyHighlights = [
  "End-to-end encrypted medical records",
  "OTP-based access sharing and revocation",
  "Full audit logs for every access event",
  "HIPAA & GDPR compliant infrastructure",
  "Role-based permission isolation",
  "Emergency access transparency"
];

export default function ForPatientsPage() {
  const heroRef = useRef<HTMLElement>(null);
  const benefitsRef = useRef<HTMLElement>(null);
  const privacyRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
      );
    }

    if (benefitsRef.current) {
      const cards = benefitsRef.current.querySelectorAll(".benefit-card");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 30, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.15,
          delay: 0.3,
          ease: "power3.out",
          scrollTrigger: {
            trigger: benefitsRef.current,
            start: "top 80%",
          },
        }
      );
    }

    if (privacyRef.current) {
      gsap.fromTo(
        privacyRef.current,
        { opacity: 0, y: 80 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: privacyRef.current,
            start: "top 85%",
          },
        }
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
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
              Take Control of Your Health with{" "}
              <span className="text-green-600">Meditrack</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              One secure place for appointments, prescriptions, reminders, and
              complete health history—built for clarity and confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.div whileHover={{ scale: 1.08 }}>
                <Link
                  href="/auth"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-green-600 text-green-600 font-semibold rounded-lg hover:bg-green-600 hover:text-white transform transition-all duration-200"
                >
                  Create Account
                </Link>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative"
          >
            <Image
              src="/img3.jpg"
              alt="Patient using Meditrack"
              width={600}
              height={500}
              className="rounded-2xl shadow-2xl object-cover"
              priority
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="absolute -top-4 -right-4 bg-white p-4 rounded-xl shadow-lg shadow-green-500/40 border border-green-200"
            >
              <div className="flex items-center space-x-2">
              <HiShieldCheck className="w-6 h-6 text-green-600" />
              <span className="font-semibold text-gray-800">
                Secure & Private
              </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section ref={benefitsRef} className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6"
            >
              Everything Patients Need in{" "}
              <span className="text-green-600">One Place</span>
            </motion.h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple, powerful tools to manage your health, stay on track, and
              improve treatment outcomes.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {patientBenefits.map((benefit, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -6, scale: 1.03 }}
                className="benefit-card bg-gray-50 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300"
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

      {/* Privacy & Security */}
      <section ref={privacyRef} className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Your <span className="text-green-400">Privacy</span> Comes First
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Meditrack puts you in full control. Share access only when
                needed and revoke it instantly—your data, your rules.
              </p>
              <div className="space-y-4">
                {privacyHighlights.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <HiShieldCheck className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <Image
                src="/img4.jpg"
                alt="Secure patient data"
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
                    Encrypted Protection
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
