"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          username: form.get("username"),
          email: form.get("email"),
          password: form.get("password"),
          bio: form.get("bio") || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message ?? "No se pudo crear la cuenta.");
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
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">Crear cuenta</h1>
          <p className="text-sm text-slate-500 mt-1">Únete a la comunidad de escritores</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Nombre completo</label>
            <input
              name="name"
              placeholder="Ej. Ana Pérez"
              required
              maxLength={100}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-[#0F172A] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Nombre de usuario</label>
            <input
              name="username"
              placeholder="ana_dev"
              required
              minLength={3}
              maxLength={30}
              pattern="[A-Za-z0-9_]+"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-[#0F172A] focus:outline-none font-[family-name:var(--font-lekton)]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Correo electrónico</label>
            <input
              name="email"
              type="email"
              placeholder="correo@ejemplo.com"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-[#0F172A] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Contraseña</label>
            <input
              name="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              required
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-[#0F172A] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Biografía (opcional)</label>
            <textarea
              name="bio"
              placeholder="Cuéntanos brevemente sobre ti..."
              maxLength={300}
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-[#0F172A] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#0F172A] py-3 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            {loading ? "Creando cuenta..." : "Registrarme"}
          </button>

          {message && (
            <p role="alert" className="text-sm text-red-600 text-center bg-red-50 p-2 rounded-lg">
              {message}
            </p>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-[#0F172A] hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}