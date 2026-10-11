"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message ?? "No se pudo iniciar sesión.");
        return;
      }

      window.location.assign("/");
    } catch {
      setMessage("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6 bg-[#F8FAFC]">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">Iniciar sesión</h1>
          <p className="text-sm text-slate-500 mt-1">Bienvenido de vuelta a tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Correo electrónico</label>
            <input
              name="email"
              type="email"
              placeholder="correo@ejemplo.com"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-[#0F172A] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Contraseña</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-[#0F172A] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#0F172A] py-3 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            {loading ? "Validando..." : "Entrar"}
          </button>

          {message && (
            <p role="alert" className="text-sm text-red-600 text-center bg-red-50 p-2 rounded-lg">
              {message}
            </p>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="font-medium text-[#0F172A] hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </main>
  );
}