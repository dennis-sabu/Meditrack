"use client";
import { HiArrowRight, HiPlay } from "react-icons/hi";
import { FaCalendarAlt, FaLink, FaDollarSign, FaGift } from "react-icons/fa";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative bg-white top-8">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
        {/* Left Section - Heading */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Empowering Healthcare <br />
            With{" "}
            <span className="text-green-500">
              Security &amp; Personalization
            </span>
          </h1>
        </motion.div>

        {/* Right Section - Subtext + Buttons */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-600 mb-6">
            Seamlessly manage prescriptions, appointments, and medical history with a
            secure, AI-powered platform designed for doctors and patients.
          </p>

          <div className="flex flex-wrap gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              className="px-6 py-3 bg-green-500 text-white rounded-full shadow hover:bg-green-600 transition flex items-center space-x-2"
            >
              <span>Get Started</span>
              <HiArrowRight />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              className="px-6 py-3 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition"
            >
              Learn More
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Image / Placeholder */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        viewport={{ once: true }}
        className="relative w-full h-[400px] sm:h-[1600px] md:h-[600px] lg:h-[700px] bg-gray-100 flex items-center justify-center rounded-2xl overflow-hidden"
      >
        {/* Background Ambient Light Effect */}
        <div className="absolute inset-0 bg-gradient-radial from-green-200/30 via-transparent to-transparent mix-blend-overlay" />

        <Image
          src="/hero.webp"
          alt="Doctor with patient"
          fill
          className="object-cover rounded-2xl"
        />

        {/* Linear Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />

        {/* Play Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-white/30 backdrop-blur-sm p-4 rounded-full hover:bg-white/40 transition-all"
        >
          <HiPlay className="w-8 h-8 text-white-500" />
        </motion.button>
      </motion.div>

      {/* Why Our Platform Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto text-center px-6 py-12"
      >
        <p className="text-sm uppercase text-gray-500 tracking-wide">
          Why Our Platform
        </p>
        <h2 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900">
          Unlock Better Health Outcomes <br />
          With Our <span className="text-green-500">Secure AI</span>-Driven Tools
        </h2>
      </motion.div>

      {/* Feature Cards */}
      <motion.div
        initial="hidden"
        whileInView="show"
        variants={{
          hidden: { opacity: 0, y: 40 },
          show: {
            opacity: 1,
            y: 0,
            transition: { staggerChildren: 0.2 },
          },
        }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-6 py-12"
      >
        {[
          {
            title: "Digital Health Records",
            desc: "Securely store and access medical history, prescriptions, and allergies.",
            img: "/card1.webp",
          },
          {
            title: "Smart Appointment Booking",
            desc: "Effortlessly schedule consultations and receive instant confirmations.",
            img: "/card2.webp",
          },
          {
            title: "Prescription Management",
            desc: "Doctors upload prescriptions with dosage schedules; patients get reminders.",
            img: "/card3.webp",
          },
          {
            title: "Verified Medicine Intake",
            desc: "Patients upload proof of medicine intake; doctors track adherence in real time.",
            img: "/card4.webp",
          },
        ].map((card, i) => (
          <motion.div
            key={i}
            variants={{
              hidden: { opacity: 0, scale: 0.9 },
              show: { opacity: 1, scale: 1 },
            }}
            whileHover={{ y: -8, boxShadow: "0 12px 28px rgba(0,0,0,0.1)" }}
            className="relative bg-orange-50 p-6 rounded-xl shadow transition flex flex-col h-full overflow-hidden"
          >
            <h3 className="font-semibold text-3xl text-gray-900 mb-2">
              {card.title}
            </h3>
            <p className="text-gray-600 text-2xl mb-6">{card.desc}</p>
            <div className="flex justify-center items-end mt-auto -m-9">
              <Image
                src={card.img}
                alt={card.title}
                width={250}
                height={250}
                className="object-contain"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-orange-50 to-transparent pointer-events-none" />
          </motion.div>
        ))}
      </motion.div>

      {/* How It Works Section */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-3xl md:text-6xl font-bold text-left mb-12"
        >
          <span className="text-gray-900">How It </span>
          <span className="text-green-500">Works</span>
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
          {/* Left Cards */}
          <div className="flex flex-col gap-6">
            {[
              {
                icon: <FaCalendarAlt className="text-green-500 text-4xl mx-auto mb-3" />,
                title: "Book Or Manage Appointments",
                desc: "Patients can book; doctors get instant notifications.",
              },
              {
                icon: <FaLink className="text-green-500 text-4xl mx-auto mb-3" />,
                title: "Track & Monitor Treatment",
                desc: "Get reminders, upload intake proof, and share verified progress.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: i * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03 }}
                className="bg-orange-50 p-6 rounded-xl shadow transition text-center"
              >
                {item.icon}
                <h3 className="font-bold text-2xl md:text-3xl text-gray-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Center Phone Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="bg-orange-50 rounded-2xl p-6">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                Register As A Patient Or Doctor
              </h3>
              <p className="text-gray-600 mb-6">
                Create your secure profile with relevant details.
              </p>
              <div className="flex justify-center items-center -m-6">
                <Image
                  src="/mobile.webp"
                  alt="Track Your Health Progress"
                  width={320}
                  height={900}
                  className="object-contain"
                />
              </div>
            </div>
          </motion.div>

          {/* Right Cards */}
          <div className="flex flex-col gap-6">
            {[
              {
                icon: <FaDollarSign className="text-green-500 text-4xl mx-auto mb-3" />,
                title: "Secure Access With OTP",
                desc: "Patients control access—doctors view records only with OTP approval.",
              },
              {
                icon: <FaGift className="text-green-500 text-4xl mx-auto mb-3" />,
                title: "Your Health Matters",
                desc: "Vestibulum feugiat nibh vitae neque laoreet bibendum et odio porta feugiat.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: i * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03 }}
                className="bg-orange-50 p-6 rounded-xl shadow transition text-center"
              >
                {item.icon}
                <h3 className="font-bold text-2xl md:text-3xl text-gray-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </section>
  );
}
