import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const userId = await getCurrentUserId();

  const [posts, user] = await Promise.all([
    prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { not: null },
      },
      orderBy: { publishedAt: "desc" },
      include: {
        author: {
          select: { name: true, username: true },
        },
        category: {
          select: { name: true },
        },
        tags: {
          select: { name: true },
        },
      },
    }),
    userId
      ? prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, username: true },
        })
      : Promise.resolve(null),
  ]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      {/* Barra de navegación superior */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-[#F8FAFC]/90 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/" className="text-2xl font-bold tracking-tight text-[#0F172A] font-[family-name:var(--font-heebo)]">
              Mi blog
            </Link>
            <p className="text-xs text-slate-500 font-[family-name:var(--font-lekton)]">
              Publicaciones de la comunidad
            </p>
          </div>

          <nav className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-700 hidden sm:inline">
                  Hola, <strong className="text-[#0F172A]">{user.name}</strong>
                </span>
                <Link
                  href="/posts/new"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0F172A] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 transition-colors"
                >
                  ✏️ Escribir artículo
                </Link>
                <form action="/api/auth/logout" method="post">
                  <button
                    type="submit"
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Salir
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-700 hover:text-[#0F172A] transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-[#0F172A] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 transition-colors"
                >
                  Crear cuenta
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="mx-auto max-w-4xl px-6 py-10">
        <section className="space-y-6">
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <p className="text-slate-500 font-medium">Aún no hay publicaciones.</p>
              <p className="text-sm text-slate-400 mt-1">¡Sé el primero en compartir tu conocimiento con la comunidad!</p>
            </div>
          ) : (
            posts.map((post) => (
              <article
                key={post.id}
                className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between text-xs font-[family-name:var(--font-lekton)] text-slate-500 mb-2">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-[#0F172A]">
                    {post.category.name}
                  </span>
                  <span>@{post.author.username}</span>
                </div>

                <h2 className="text-xl font-bold tracking-tight text-[#0F172A] group-hover:text-slate-600 transition-colors">
                  {post.title}
                </h2>

                {post.excerpt && (
                  <p className="mt-2 text-slate-600 font-medium leading-relaxed">
                    {post.excerpt}
                  </p>
                )}

                <p className="mt-3 text-slate-500 text-sm leading-relaxed whitespace-pre-wrap">
                  {post.content.length > 300
                    ? `${post.content.slice(0, 300)}…`
                    : post.content}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag.name}
                      className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-[family-name:var(--font-lekton)] text-slate-600"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-[family-name:var(--font-lekton)] text-slate-400">
                  <span>Por {post.author.name}</span>
                  {post.publishedAt && (
                    <span>{post.publishedAt.toLocaleDateString("es-MX", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  )}
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}