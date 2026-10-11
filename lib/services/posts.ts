
import { prisma } from "../prisma";

type CreatePostInput = {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  categoryId: number;
  tagIds?: number[];
  publish?: boolean;
};

export async function createPost(
  authorId: number,
  input: CreatePostInput,
) {
  const title = input.title.trim();
  const slug = input.slug.trim().toLowerCase();
  const content = input.content.trim();

  if (!title || !slug || !content) {
    throw new Error("El título, slug y contenido son obligatorios.");
  }

  if (title.length > 180) {
    throw new Error("El título no puede superar 180 caracteres.");
  }

  if (slug.length > 180 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("El slug no tiene un formato válido.");
  }

  if (!Number.isInteger(input.categoryId)) {
    throw new Error("Selecciona una categoría válida.");
  }

  const tagIds = [...new Set(input.tagIds ?? [])];

  return prisma.post.create({
    data: {
      title,
      slug,
      excerpt: input.excerpt?.trim() || undefined,
      content,
      status: input.publish ? "PUBLISHED" : "DRAFT",
      publishedAt: input.publish ? new Date() : null,
      authorId,
      categoryId: input.categoryId,
      tags: {
        connect: tagIds.map((id) => ({ id })),
      },
    },
    include: {
      author: {
        select: { id: true, name: true, username: true },
      },
      category: true,
      tags: true,
    },
  });
}

type UpdatePostInput = {
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: string;
  categoryId?: number;
  tagIds?: number[];
};

export async function updatePost(
  postId: number,
  authorId: number,
  input: UpdatePostInput,
) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });

  if (!post) {
    throw new Error("La publicación no existe.");
  }

  if (post.authorId !== authorId) {
    throw new Error("No tienes permiso para editar esta publicación.");
  }

  const { tagIds, ...fields } = input;

  return prisma.post.update({
    where: { id: postId },
    data: {
      ...fields,
      ...(fields.title !== undefined && {
        title: fields.title.trim(),
      }),
      ...(fields.slug !== undefined && {
        slug: fields.slug.trim().toLowerCase(),
      }),
      ...(fields.content !== undefined && {
        content: fields.content.trim(),
      }),
      ...(tagIds !== undefined && {
        tags: {
          set: [...new Set(tagIds)].map((id) => ({ id })),
        },
      }),
    },
    include: {
      category: true,
      tags: true,
    },
  });
}

export async function publishPost(
  postId: number,
  authorId: number,
) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });

  if (!post) {
    throw new Error("La publicación no existe.");
  }

  if (post.authorId !== authorId) {
    throw new Error("No tienes permiso para publicar este artículo.");
  }

  return prisma.post.update({
    where: { id: postId },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
}
