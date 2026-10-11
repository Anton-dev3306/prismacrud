import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { bookmarkPost, removeBookmark } from "@/lib/services/interactions";

type Context = { params: Promise<{ id: string }> };

export async function PUT(_request: Request, context: Context) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json(
      { message: "Inicia sesión para guardar favoritos." },
      { status: 401 },
    );
  }

  const postId = Number((await context.params).id);

  if (!Number.isSafeInteger(postId) || postId <= 0) {
    return NextResponse.json(
      { message: "ID inválido." },
      { status: 400 },
    );
  }

  try {
    const bookmark = await bookmarkPost(userId, postId);
    return NextResponse.json({ bookmark });
  } catch {
    return NextResponse.json(
      { message: "No se pudo guardar el favorito." },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: Request, context: Context) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json(
      { message: "Inicia sesión para continuar." },
      { status: 401 },
    );
  }

  const postId = Number((await context.params).id);

  if (!Number.isSafeInteger(postId) || postId <= 0) {
    return NextResponse.json(
      { message: "ID inválido." },
      { status: 400 },
    );
  }

  await removeBookmark(userId, postId);
  return NextResponse.json({ message: "Favorito eliminado." });
}
