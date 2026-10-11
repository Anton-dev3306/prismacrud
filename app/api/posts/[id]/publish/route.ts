import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { publishPost } from "@/lib/services/posts";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json(
      { message: "Inicia sesión para continuar." },
      { status: 401 },
    );
  }

  const { id } = await context.params;
  const postId = Number(id);

  if (!Number.isSafeInteger(postId) || postId <= 0) {
    return NextResponse.json(
      { message: "ID de publicación inválido." },
      { status: 400 },
    );
  }

  try {
    const post = await publishPost(postId, userId);
    return NextResponse.json({ post });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo publicar.";

    const status = message.includes("no existe")
      ? 404
      : message.includes("permiso")
        ? 403
        : 400;

    return NextResponse.json({ message }, { status });
  }
}
