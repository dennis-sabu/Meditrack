"use client";
import { useState } from "react";
import Navbar from "../components/NavBar";
import DoctorFooter from "../components/DoctorFooter";
import { HiMail, HiUser, HiShieldCheck, HiChatAlt2 } from "react-icons/hi";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) return;
    setSubmitting(true);

    // For now just simulate a send (since only one page requested, no API route added)
    setTimeout(() => {
      setSubmitting(false);
      setSent(true);
      // Optionally open mail client (uncomment if desired):
      // window.location.href = `mailto:contact@meditrack.com?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(`From: ${form.name} <${form.email}>\n\n${form.message}`)}`;
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow pt-28 pb-20">
        <div className="max-w-5xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-14">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Contact <span className="text-green-600">Meditrack</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              We&apos;re here to help doctors, patients, and partners. Your inquiry is handled securely and confidentially.
            </p>
          </div>

            {/* Trust Badges */}
            <div className="grid sm:grid-cols-3 gap-6 mb-12">
              <div className="bg-white border rounded-xl p-5 flex items-center gap-3 shadow-sm">
                <HiShieldCheck className="text-green-600 w-7 h-7" />
                <div>
                  <p className="font-semibold text-gray-800 text-sm">Encrypted Handling</p>
                  <p className="text-xs text-gray-500">We respect data privacy</p>
                </div>
              </div>
              <div className="bg-white border rounded-xl p-5 flex items-center gap-3 shadow-sm">
                <HiMail className="text-green-600 w-7 h-7" />
                <div>
                  <p className="font-semibold text-gray-800 text-sm">Direct Response</p>
                  <p className="text-xs text-gray-500">Replies within 24 hours</p>
                </div>
              </div>
              <div className="bg-white border rounded-xl p-5 flex items-center gap-3 shadow-sm">
                <HiChatAlt2 className="text-green-600 w-7 h-7" />
                <div>
                  <p className="font-semibold text-gray-800 text-sm">Secure Channel</p>
                  <p className="text-xs text-gray-500">No data resale – ever</p>
                </div>
              </div>
            </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-12 max-w-3xl mx-auto">
            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label htmlFor="name" className="text-sm font-semibold text-gray-700 mb-1">Name *</label>
                    <div className="relative">
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={handleChange}
                        className="w-full rounded-lg border px-4 py-3 pr-10 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 focus:outline-none transition"
                        placeholder="Jane Doe"
                      />
                      <HiUser className="w-5 h-5 text-gray-400 absolute right-3 top-3.5" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-1">Email *</label>
                    <div className="relative">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        className="w-full rounded-lg border px-4 py-3 pr-10 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 focus:outline-none transition"
                        placeholder="you@example.com"
                      />
                      <HiMail className="w-5 h-5 text-gray-400 absolute right-3 top-3.5" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <label htmlFor="subject" className="text-sm font-semibold text-gray-700 mb-1">Subject *</label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 focus:outline-none transition"
                    placeholder="Account access, product question, etc."
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="message" className="text-sm font-semibold text-gray-700 mb-1">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    value={form.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full rounded-lg border px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 focus:outline-none transition resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <div className="pt-2 flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex justify-center items-center px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-70 disabled:cursor-not-allowed transition shadow-md hover:shadow-lg"
                  >
                    {submitting ? (
                      <>
                        <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                        Sending Securely...
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </button>
                  <p className="text-xs text-gray-500 text-center leading-relaxed">
                    By submitting, you agree not to include protected health information (PHI). We will never share or sell your contact details.
                  </p>
                </div>
              </form>
            ) : (
              <div className="text-center py-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                  <HiShieldCheck className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Message Sent Securely</h2>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  Thanks for reaching out. Our team will review and get back to you within 24 hours.
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                  className="text-green-600 font-medium hover:underline"
                >
                  Send another message
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <DoctorFooter />
    </div>
  );
}
