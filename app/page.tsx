"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Stethoscope,
  Hospital,
  UserCheck,
  Shield,
  Clock,
  Heart,
  Users,
  Calendar,
  FileText,
  Phone
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Stethoscope className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">MedConnect</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signin">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Modern Healthcare
              <span className="block text-blue-600">Management System</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Streamline your medical practice with our comprehensive platform.
              Manage appointments, patient records, and hospital operations all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signin">
                <Button size="lg" className="text-lg px-8 py-3">
                  Access Dashboard
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built for Healthcare Professionals
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your medical practice efficiently and securely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Hospital className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Hospital Administration</CardTitle>
                <CardDescription>
                  Complete hospital management with doctor verification, department oversight,
                  and operational dashboards.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <UserCheck className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Doctor Portal</CardTitle>
                <CardDescription>
                  Comprehensive doctor dashboard with appointment management, patient lists,
                  and schedule coordination.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Admin Control</CardTitle>
                <CardDescription>
                  System-wide administration with hospital verification, doctor approval,
                  and platform oversight.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Calendar className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle>Appointment Management</CardTitle>
                <CardDescription>
                  Advanced scheduling system with automated confirmations, reminders,
                  and calendar integration.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle>Patient Records</CardTitle>
                <CardDescription>
                  Secure patient data management with comprehensive medical histories
                  and treatment tracking.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Clock className="h-12 w-12 text-indigo-600 mb-4" />
                <CardTitle>24/7 Access</CardTitle>
                <CardDescription>
                  Access your dashboard anytime, anywhere with our responsive web platform
                  and mobile optimization.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Role
            </h2>
            <p className="text-xl text-gray-600">
              Access the platform with your designated role and permissions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-xl transition-all hover:-translate-y-2 border-2 hover:border-blue-200">
              <CardHeader className="pb-4">
                <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full w-fit">
                  <Shield className="h-12 w-12 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">System Admin</CardTitle>
                <CardDescription className="text-base">
                  Manage hospitals, verify doctors, and oversee the entire platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-left space-y-2 text-sm text-gray-600 mb-6">
                  <li>• Hospital verification and approval</li>
                  <li>• Doctor license validation</li>
                  <li>• Platform-wide analytics</li>
                  <li>• System configuration</li>
                </ul>
                <Link href="/signin">
                  <Button className="w-full">Admin Access</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all hover:-translate-y-2 border-2 hover:border-green-200">
              <CardHeader className="pb-4">
                <div className="mx-auto mb-4 p-4 bg-green-100 rounded-full w-fit">
                  <Hospital className="h-12 w-12 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Hospital Admin</CardTitle>
                <CardDescription className="text-base">
                  Manage your hospital operations and doctor assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-left space-y-2 text-sm text-gray-600 mb-6">
                  <li>• Doctor management and approval</li>
                  <li>• Department organization</li>
                  <li>• Hospital analytics dashboard</li>
                  <li>• Patient checkup oversight</li>
                </ul>
                <Link href="/signin">
                  <Button variant="outline" className="w-full border-green-200 hover:bg-green-50">
                    Hospital Portal
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all hover:-translate-y-2 border-2 hover:border-purple-200">
              <CardHeader className="pb-4">
                <div className="mx-auto mb-4 p-4 bg-purple-100 rounded-full w-fit">
                  <UserCheck className="h-12 w-12 text-purple-600" />
                </div>
                <CardTitle className="text-2xl">Doctor</CardTitle>
                <CardDescription className="text-base">
                  Manage appointments, patients, and your medical practice
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-left space-y-2 text-sm text-gray-600 mb-6">
                  <li>• Appointment scheduling</li>
                  <li>• Patient record management</li>
                  <li>• Calendar integration</li>
                  <li>• Prescription management</li>
                </ul>
                <Link href="/signin">
                  <Button variant="outline" className="w-full border-purple-200 hover:bg-purple-50">
                    Doctor Portal
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-200">Hospitals Connected</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">2,500+</div>
              <div className="text-blue-200">Verified Doctors</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-blue-200">Appointments Managed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-blue-200">System Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <Stethoscope className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-xl font-bold">MedConnect</span>
              </div>
              <p className="text-gray-300 mb-4">
                Transforming healthcare management with modern technology.
                Secure, reliable, and user-friendly solutions for medical professionals.
              </p>
              <div className="flex items-center space-x-4">
                <Phone className="h-5 w-5 text-gray-400" />
                <span className="text-gray-300">24/7 Support Available</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/signin" className="hover:text-white">Sign In</Link></li>
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/documentation" className="hover:text-white">Documentation</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MedConnect. All rights reserved. Built with Next.js and modern web technologies.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}