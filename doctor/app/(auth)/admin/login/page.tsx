"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/utils/react";
import { TRPCError } from "@trpc/server";
import { TRPCClientError } from "@trpc/client";
import { signIn, useSession } from "next-auth/react";

export default function AdminLoginPage() {
  const router = useRouter();
  const user  = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loginMutation = api.admin.createAdmin.useMutation();
  if(user?.data?.user?.role === 'ADMIN'){
    router.push('/admin/dashboard');
  }
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }

    try {
      setLoading(true);
      const result = await loginMutation.mutateAsync({
        email,
        password,
        name: "Admin",
        phone: "93993939",
      });
      console.log(result);
      if(result.success){
        router.push("/admin/dashboard");
        signIn("credentials", { email, password, callbackUrl: "/admin/dashboard" });
      }else{
        setError("Login failed");
      }
    } catch (err) {
      if (err instanceof TRPCClientError) {
       
        const msg = (err.data?.zodError?.fieldErrors?.password?.[0] ||
          err.data?.zodError?.fieldErrors?.email?.[0] ||
          err.message ||
          "Login failed") as string;
        setError(msg);
        return;
      }
      setError((err as unknown as any)?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <div style={styles.imageWrap}>
          <img
            src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=8b1b9a4f8f4b7b6d8f5c6b7a8c9d0e1f"
            alt="Super admin"
            style={styles.image}
          />
        </div>

        <h1 style={styles.title}>Super Admin Login</h1>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
              placeholder="admin@example.com"
            />
          </label>

          <label style={styles.label}>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
              placeholder="••••••••"
            />
          </label>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Logging in..." : "Sign in as Super Admin"}
          </button>
        </form>
      </div>
    </main>
  );
}

const styles: { [k: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f5f7fb",
    padding: 20,
  },
  card: {
    width: 420,
    maxWidth: "100%",
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 8px 30px rgba(22,23,24,0.08)",
    padding: 24,
    textAlign: "center",
  },
  imageWrap: {
    width: 96,
    height: 96,
    margin: "0 auto 12px",
    overflow: "hidden",
    borderRadius: "50%",
    border: "2px solid #eef2ff",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  title: {
    margin: "8px 0 18px",
    fontSize: 20,
    color: "#0f172a",
  },
  form: {
    display: "grid",
    gap: 12,
  },
  label: {
    display: "block",
    textAlign: "left",
    fontSize: 13,
    color: "#334155",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    marginTop: 6,
    borderRadius: 8,
    border: "1px solid #e6e9ef",
    outline: "none",
    fontSize: 14,
  },
  button: {
    marginTop: 8,
    padding: "10px 12px",
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },
  error: {
    color: "#b91c1c",
    fontSize: 13,
    textAlign: "left",
    marginTop: 4,
  },
};
