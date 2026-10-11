import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { createComment } from "@/lib/services/interactions";

const schema = z.object({
  content: z.string().trim().min(1).max(5000),
  parentId: z.number().int().positive().optional(),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json(
      { message: "Inicia sesión para comentar." },
      { status: 401 },
    );
  }

  const postId = Number((await context.params).id);

  if (!Number.isSafeInteger(postId) || postId <= 0) {
    return NextResponse.json(
      { message: "ID de publicación inválido." },
      { status: 400 },
    );
  }

  try {
    const input = schema.parse(await request.json());
    const comment = await createComment(
      userId,
      postId,
      input.content,
      input.parentId,
    );

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "El comentario no es válido." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: error instanceof Error ? error.message : "No se pudo comentar." },
      { status: 400 },
    );
  }
}
