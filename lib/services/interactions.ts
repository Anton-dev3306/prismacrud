
import { prisma } from "../prisma";

// Crear un comentario o una respuesta a otro comentario.
export async function createComment(
  userId: number,
  postId: number,
  content: string,
  parentId?: number,
) {
  const text = content.trim();

  if (!text) {
    throw new Error("El comentario no puede estar vacío.");
  }

  if (parentId !== undefined) {
    const parent = await prisma.comment.findUnique({
      where: { id: parentId },
      select: { postId: true },
    });

    if (!parent || parent.postId !== postId) {
      throw new Error("El comentario al que respondes no es válido.");
    }
  }

  return prisma.comment.create({
    data: {
      content: text,
      userId,
      postId,
      ...(parentId !== undefined && { parentId }),
    },
    include: {
      author: {
        select: { id: true, name: true, username: true },
      },
    },
  });
}

// Dar una reacción o cambiar el tipo de reacción.
export async function reactToPost(
  userId: number,
  postId: number,
  type: "LIKE" | "LOVE" | "CLAP" | "INSIGHTFUL",
) {
  return prisma.reaction.upsert({
    where: {
      userId_postId: { userId, postId },
    },
    create: { userId, postId, type },
    update: { type },
  });
}

// Guardar una publicación.
export async function bookmarkPost(
  userId: number,
  postId: number,
) {
  return prisma.bookmark.upsert({
    where: {
      userId_postId: { userId, postId },
    },
    create: { userId, postId },
    update: {},
  });
}

// Quitar una publicación de favoritos.
export async function removeBookmark(
  userId: number,
  postId: number,
) {
  return prisma.bookmark.deleteMany({
    where: { userId, postId },
  });
}

// Seguir a otro usuario.
export async function followUser(
  followerId: number,
  followingId: number,
) {
  if (followerId === followingId) {
    throw new Error("No puedes seguirte a ti mismo.");
  }

  return prisma.follow.upsert({
    where: {
      followerId_followingId: { followerId, followingId },
    },
    create: { followerId, followingId },
    update: {},
  });
}

// Dejar de seguir a un usuario.
export async function unfollowUser(
  followerId: number,
  followingId: number,
) {
  return prisma.follow.deleteMany({
    where: { followerId, followingId },
  });
}
