import { NextResponse } from "next/server";
import { ZodError, z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPost } from "@/lib/services/posts";

const schema = z.object({
  title: z.string().trim().min(1).max(180),
  slug: z.string().trim().min(1).max(180),
  excerpt: z.string().max(300).optional(),
  content: z.string().trim().min(1),
  categoryId: z.number().int().positive(),
  tagIds: z.array(z.number().int().positive()).max(30).optional(),
  publish: z.boolean().default(false),
});

export async function GET() {
  const posts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: { not: null },
    },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true,
      author: {
        select: { name: true, username: true },
      },
      category: {
        select: { name: true, slug: true },
      },
      tags: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json(
      { message: "Debes iniciar sesión para publicar." },
      { status: 401 },
    );
  }

  try {
    const input = schema.parse(await request.json());

    const category = await prisma.category.findUnique({
      where: { id: input.categoryId },
      select: { id: true },
    });

    if (!category) {
      return NextResponse.json(
        { message: "La categoría seleccionada no existe." },
        { status: 400 },
      );
    }

    const tagsCount = new Set(input.tagIds ?? []).size;
    const existingTags = await prisma.tag.count({
      where: { id: { in: input.tagIds ?? [] } },
    });

    if (existingTags !== tagsCount) {
      return NextResponse.json(
        { message: "Una o más etiquetas no existen." },
        { status: 400 },
      );
    }

    const post = await createPost(userId, input);

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Los datos de la publicación no son válidos.", issues: error.issues },
        { status: 400 },
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "Ya existe una publicación con ese slug." },
        { status: 409 },
      );
    }

    console.error("Error al crear publicación:", error);

    return NextResponse.json(
      { message: "No se pudo crear la publicación." },
      { status: 500 },
    );
  }
}
