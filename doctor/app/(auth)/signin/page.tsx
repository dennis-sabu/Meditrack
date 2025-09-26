"use client";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Building2, User, FileBadge } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import Logo from "@/components/user/logo";
import { api } from "@/utils/react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn, useSession } from "next-auth/react";

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// const patientSignupSchema = z.object({
//   name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name too long"),
//   email: z.string().email("Please enter a valid email address"),
//   phone: z.string().min(10, "Phone number must be at least 10 digits").regex(/^[\d\+\-\s\(\)]+$/, "Invalid phone number format"),
//   dateOfBirth: z.string().optional(),
//   governmentId: z.string().optional(),
//   password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password too long"),
//   confirmPassword: z.string(),
// }).refine((data) => data.password === data.confirmPassword, {
//   message: "Passwords don't match",
//   path: ["confirmPassword"],
// });

const doctorSignupSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name too long"),
    email: z.string().email("Please enter a valid email address"),
    governmentId: z.string().min(5, "Medical license number is required"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password too long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const hospitalSignupSchema = z
  .object({
    hospitalName: z
      .string()
      .min(2, "Hospital name must be at least 2 characters")
      .max(100, "Name too long"),
    email: z.string().email("Please enter a valid email address"),
    governmentId: z.string().min(5, "Hospital registration number is required"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password too long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type LoginFormData = z.infer<typeof loginSchema>;
// type PatientSignupFormData = z.infer<typeof patientSignupSchema>;
type DoctorSignupFormData = z.infer<typeof doctorSignupSchema>;
type HospitalSignupFormData = z.infer<typeof hospitalSignupSchema>;

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const session = useSession();
  // Form configurations
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  useEffect(() => {
    if (session) {
      console.log(session);
      if (session?.data?.user?.role && session.status == 'authenticated') {
        if(session?.data?.user?.isVerified === false){ 
          toast.error("Your account is deactivated. Please contact support.");
        }else{
          const role = session?.data?.user?.role.toLowerCase();
          window.location.href = `/${role}/dashboard`;
        }
        if(session?.data?.user?.role === "HOSPITAL_ADMIN"){
          window.location.href = `/hospitals/dashboard`;
        }
        if(session?.data?.user?.role === "DOCTOR"){
          window.location.href = `/doctors/dashboard`;
        }
        if(session?.data?.user?.role === "ADMIN"){
          window.location.href = `/admin/dashboard`;
        }
      }   
    }
  }, [session]);
  const doctorSignupForm = useForm<DoctorSignupFormData>({
    resolver: zodResolver(doctorSignupSchema),
    defaultValues: {
      name: "",
      email: "",
      governmentId: "",
      password: "",
      confirmPassword: "",
    },
  });

  const hospitalSignupForm = useForm<HospitalSignupFormData>({
    resolver: zodResolver(hospitalSignupSchema),
    defaultValues: {
      hospitalName: "",
      email: "",
      governmentId: "",
      password: "",
      confirmPassword: "",
    },
  });
  const [loading, setLoading] = useState(false);
  // // API mutations
  // const loginMutation = api.auth.loginwithEmail.useMutation();
  const doctorRegisterMutation = api.auth.registerDoctor.useMutation({
    onSuccess: () => {
      doctorSignupForm.reset();
      setMode("login");
      toast.success(
        "Doctor registration submitted for verification! Check your email for updates."
      );
    },
    onError: (error) => {
      toast.error(error.message || "Registration failed");
    },
  });
  const loginverificationmutation = api.auth.verifyLogin.useMutation({
    onSuccess: (data) => {
      console.log(data);
      if (data.data) {
        toast.success("Login successful!");
        setLoading(false);
        const result = signIn("credentials", {
          redirect: false,
          email: loginForm.getValues("email"),
          password: loginForm.getValues("password"),
          callbackUrl: `/dashboard`,
        });
        console.log("Logged in user:", result);
      } else {
        toast.error(data.message || "Login failed");
        setLoading(false);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Login failed");
      setLoading(false);
    },
  });
        
  const hospitalRegisterMutation = api.auth.registerHospitalAdmin.useMutation({
    onSuccess: () => {
      hospitalRegisterMutation.reset();
      setMode("login");
      toast.success(
        "Hospital Admin registration submitted for verification! Check your email for updates."
      );
    },
    onError: (error) => {
      toast.error(error.message || "Registration failed");
    },
  });
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100 p-6">
      <motion.div
        layout
        className="w-full bg-white  max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Left side info */}
        <div className="hidden md:flex flex-col justify-start min-h-[450px] bg-gradient-to-br from-blue-600 to-blue-500 p-10 text-white">
          <Logo text white />
          <h2 className="text-4xl mt-4 font-bold mb-4">
            Employer Medical Portal
          </h2>
          <ul className="space-y-3 text-sm">
            <li>✔ Data Analytics</li>
            <li>✔ Online Scheduling</li>
            <li>✔ Resulting</li>
            <li>✔ Prescription Management</li>
            {/* <li>✔ OSHA Surveillance</li> */}
            {/* <li>✔ Invoicing</li> */}
          </ul>
          <Image
            alt=""
            width={600}
            height={400}
            src={"/loginp.png"}
            className="scale-150 translate-y-[90px]"
          />
        </div>

        {/* Right side auth form */}
        <CardContent className="flex flex-col justify-center p-8">
          <div className="sm:hidden flex">
            <Logo text white={false} />
          </div>

          <div className="flex sm:mt-0 mt-4 justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {mode === "login" ? "Login" : "Sign Up"}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
            >
              {mode === "login" ? "Sign Up" : "Login"}
            </Button>
          </div>

          {mode === "login" ? (
            <form
              onSubmit={loginForm.handleSubmit(async (data) => {
                try {
                  setLoading(true);
                  const result = await loginverificationmutation.mutateAsync({
                    email: data.email,
                    password: data.password,
                  });
                  setLoading(false);
                } catch {
                  toast.error("Login failed. Please check your credentials.");
                }
              })}
              className="space-y-4"
            >
              <div>
                <Label>Email</Label>
                <div className="flex items-center border rounded-md p-2">
                  <Mail className="w-4 h-4 text-gray-400 mr-2" />
                  <Input
                    {...loginForm.register("email")}
                    placeholder="Enter your email"
                    className="border-0 focus-visible:ring-0 shadow-none"
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label>Password</Label>
                <div className="flex items-center border rounded-md p-2">
                  <Lock className="w-4 h-4 text-gray-400 mr-2" />
                  <Input
                    type="password"
                    {...loginForm.register("password")}
                    placeholder="••••••••"
                    className="border-0 focus-visible:ring-0 shadow-none"
                  />
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Login"}
              </Button>
            </form>
          ) : (
            <Tabs defaultValue="doctor">
              <TabsList className="grid grid-cols-2 mb-6 h-[50px]">
                <TabsTrigger className="w-full h-full" value="doctor">
                  Doctor
                </TabsTrigger>
                <TabsTrigger className="w-full h-full" value="hospital">
                  Hospital Admin
                </TabsTrigger>
              </TabsList>

              {/* Patient Signup */}

              {/* Doctor Signup */}
              <TabsContent value="doctor">
                <form
                  onSubmit={doctorSignupForm.handleSubmit(async (data) => {
                    try {
                      const result = await doctorRegisterMutation.mutateAsync({
                        name: data.name,
                        email: data.email,
                        password: data.password,
                        medicalLicenseNumber: data.governmentId,
                        specialization: "General Medicine", // Default value
                        experienceYears: 1,
                        qualifications: "MBBS",
                        consultationFee: 500,
                      });

                      if (result.success) {
                        // toast.success("Doctor registration submitted for verification!");
                        doctorSignupForm.reset();
                      }
                    } catch (error) {
                      toast.error(
                        (error as Error).message || "Registration failed"
                      );
                    }
                  })}
                  className="space-y-4"
                >
                  <div>
                    <Label>Full Name</Label>
                    <div className="flex items-center border rounded-md p-2">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <Input
                        {...doctorSignupForm.register("name")}
                        placeholder="Dr. John Doe"
                        className="border-0 focus-visible:ring-0 shadow-none"
                      />
                    </div>
                    {doctorSignupForm.formState.errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {doctorSignupForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Email</Label>
                    <div className="flex items-center border rounded-md p-2">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      <Input
                        {...doctorSignupForm.register("email")}
                        placeholder="doctor@hospital.com"
                        className="border-0 focus-visible:ring-0 shadow-none"
                      />
                    </div>
                    {doctorSignupForm.formState.errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {doctorSignupForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Medical License Number</Label>
                    <div className="flex items-center border rounded-md p-2">
                      <FileBadge className="w-4 h-4 text-gray-400 mr-2" />
                      <Input
                        {...doctorSignupForm.register("governmentId")}
                        placeholder="Medical License Number"
                        className="border-0 focus-visible:ring-0 shadow-none"
                      />
                    </div>
                    {doctorSignupForm.formState.errors.governmentId && (
                      <p className="text-red-500 text-sm mt-1">
                        {doctorSignupForm.formState.errors.governmentId.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Password</Label>
                    <div className="flex items-center border rounded-md p-2">
                      <Lock className="w-4 h-4 text-gray-400 mr-2" />
                      <Input
                        type="password"
                        {...doctorSignupForm.register("password")}
                        placeholder="••••••••"
                        className="border-0 focus-visible:ring-0 shadow-none"
                      />
                    </div>
                    {doctorSignupForm.formState.errors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {doctorSignupForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Confirm Password</Label>
                    <div className="flex items-center border rounded-md p-2">
                      <Lock className="w-4 h-4 text-gray-400 mr-2" />
                      <Input
                        type="password"
                        {...doctorSignupForm.register("confirmPassword")}
                        placeholder="••••••••"
                        className="border-0 focus-visible:ring-0 shadow-none"
                      />
                    </div>
                    {doctorSignupForm.formState.errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">
                        {
                          doctorSignupForm.formState.errors.confirmPassword
                            .message
                        }
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={
                      !doctorSignupForm.formState.isValid ||
                      doctorRegisterMutation.isPending
                    }
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                  >
                    {doctorRegisterMutation.isPending
                      ? "Registering..."
                      : "Sign Up as Doctor"}
                  </Button>
                </form>
              </TabsContent>

              {/* Hospital Admin Signup */}
              <TabsContent value="hospital">
                <form
                  onSubmit={hospitalSignupForm.handleSubmit(async (data) => {
                    try {
                      const result = await hospitalRegisterMutation.mutateAsync(
                        {
                          name: data.hospitalName,
                          email: data.email,
                          password: data.password,
                          hospitalName: data.hospitalName,
                          contactNumber: "1234567890", // Default value
                          address: "Hospital Address", // Default value
                          registrationNumber: data.governmentId,
                        }
                      );

                      if (result.success) {
                        // toast.success("Hospital admin registration submitted for verification!");
                        hospitalSignupForm.reset();
                      }
                    } catch (error) {
                      toast.error(
                        (error as Error).message || "Registration failed"
                      );
                    }
                  })}
                  className="space-y-4"
                >
                  <div>
                    <Label>Hospital Name</Label>
                    <div className="flex items-center border rounded-md p-2">
                      <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                      <Input
                        {...hospitalSignupForm.register("hospitalName")}
                        placeholder="City General Hospital"
                        className="border-0 focus-visible:ring-0 shadow-none"
                      />
                    </div>
                    {hospitalSignupForm.formState.errors.hospitalName && (
                      <p className="text-red-500 text-sm mt-1">
                        {
                          hospitalSignupForm.formState.errors.hospitalName
                            .message
                        }
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Email</Label>
                    <div className="flex items-center border rounded-md p-2">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      <Input
                        {...hospitalSignupForm.register("email")}
                        placeholder="admin@hospital.com"
                        className="border-0 focus-visible:ring-0 shadow-none"
                      />
                    </div>
                    {hospitalSignupForm.formState.errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {hospitalSignupForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Hospital Registration Number</Label>
                    <div className="flex items-center border rounded-md p-2">
                      <FileBadge className="w-4 h-4 text-gray-400 mr-2" />
                      <Input
                        {...hospitalSignupForm.register("governmentId")}
                        placeholder="Hospital Registration Number"
                        className="border-0 focus-visible:ring-0 shadow-none"
                      />
                    </div>
                    {hospitalSignupForm.formState.errors.governmentId && (
                      <p className="text-red-500 text-sm mt-1">
                        {
                          hospitalSignupForm.formState.errors.governmentId
                            .message
                        }
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Password</Label>
                    <div className="flex items-center border rounded-md p-2">
                      <Lock className="w-4 h-4 text-gray-400 mr-2" />
                      <Input
                        type="password"
                        {...hospitalSignupForm.register("password")}
                        placeholder="••••••••"
                        className="border-0 focus-visible:ring-0 shadow-none"
                      />
                    </div>
                    {hospitalSignupForm.formState.errors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {hospitalSignupForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Confirm Password</Label>
                    <div className="flex items-center border rounded-md p-2">
                      <Lock className="w-4 h-4 text-gray-400 mr-2" />
                      <Input
                        type="password"
                        {...hospitalSignupForm.register("confirmPassword")}
                        placeholder="••••••••"
                        className="border-0 focus-visible:ring-0 shadow-none"
                      />
                    </div>
                    {hospitalSignupForm.formState.errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">
                        {
                          hospitalSignupForm.formState.errors.confirmPassword
                            .message
                        }
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={
                      !hospitalSignupForm.formState.isValid ||
                      hospitalRegisterMutation.isPending
                    }
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                  >
                    {hospitalRegisterMutation.isPending
                      ? "Registering..."
                      : "Sign Up as Hospital Admin"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </motion.div>
    </div>
  );
}
