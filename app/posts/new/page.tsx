"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type Category = { id: number; name: string; slug: string };
type Tag = { id: number; name: string; slug: string };

export default function NewPostPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadOptions() {
      try {
        const [categoryResponse, tagResponse] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/tags"),
        ]);

        if (!categoryResponse.ok || !tagResponse.ok) {
          throw new Error("No se pudieron cargar las opciones.");
        }

        const categoryData = await categoryResponse.json();
        const tagData = await tagResponse.json();

        setCategories(categoryData.categories);
        setTags(tagData.tags);
      } catch {
        setMessage("No se pudieron cargar las categorías y etiquetas.");
      }
    }

    void loadOptions();
  }, []);

  function toggleTag(id: number) {
    setSelectedTags((current) =>
      current.includes(id)
        ? current.filter((tagId) => tagId !== id)
        : [...current, id],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const publish = form.get("publish") === "on";

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.get("title"),
          slug: form.get("slug"),
          excerpt: form.get("excerpt") || undefined,
          content: form.get("content"),
          categoryId: Number(form.get("categoryId")),
          tagIds: selectedTags,
          publish,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message ?? "No se pudo guardar la publicación.");
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
    <main className="mx-auto max-w-3xl p-6 py-10 bg-[#F8FAFC]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">Nueva publicación</h1>
          <p className="text-sm text-slate-500">Comparte tus ideas con la comunidad</p>
        </div>
        <Link
          href="/"
          className="text-sm font-medium text-slate-600 hover:text-[#0F172A] transition-colors"
        >
          ← Volver al inicio
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">Título</span>
            <input
              name="title"
              required
              maxLength={180}
              placeholder="Ej. Introducción a Next.js App Router"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-[#0F172A] focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">Slug (URL del artículo)</span>
            <input
              name="slug"
              required
              maxLength={180}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              placeholder="introduccion-a-nextjs"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-[#0F172A] focus:outline-none font-[family-name:var(--font-lekton)]"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">Resumen (opcional)</span>
            <textarea
              name="excerpt"
              maxLength={300}
              rows={2}
              placeholder="Breve descripción de lo que trata tu artículo..."
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-[#0F172A] focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">Contenido</span>
            <textarea
              name="content"
              required
              minLength={1}
              rows={10}
              placeholder="Escribe el contenido completo de tu artículo aquí..."
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-[#0F172A] focus:outline-none leading-relaxed"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">Categoría</span>
            <select
              name="categoryId"
              required
              defaultValue=""
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-[#0F172A] focus:outline-none bg-white"
            >
              <option value="" disabled>Selecciona una categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <fieldset className="rounded-lg border border-slate-200 p-4 bg-slate-50/50">
            <legend className="px-2 text-xs font-medium text-slate-600">Etiquetas</legend>
            <div className="flex flex-wrap gap-4 mt-2">
              {tags.map((tag) => (
                <label key={tag.id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag.id)}
                    onChange={() => toggleTag(tag.id)}
                    className="rounded border-slate-300 text-[#0F172A] focus:ring-[#0F172A]"
                  />
                  <span className="font-[family-name:var(--font-lekton)]">#{tag.name}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer select-none pt-2">
            <input type="checkbox" name="publish" className="rounded border-slate-300 text-[#0F172A] focus:ring-[#0F172A] w-4 h-4" />
            <span>Publicar inmediatamente (si no se selecciona, se guardará como borrador)</span>
          </label>

          <button
            type="submit"
            disabled={loading || categories.length === 0}
            className="w-full rounded-lg bg-[#0F172A] py-3 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            {loading ? "Guardando..." : "Guardar publicación"}
          </button>

          {message && (
            <p role="alert" className="text-sm text-red-600 text-center bg-red-50 p-2 rounded-lg">
              {message}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}