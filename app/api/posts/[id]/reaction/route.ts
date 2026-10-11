import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { reactToPost } from "@/lib/services/interactions";

const schema = z.object({
  type: z.enum(["LIKE", "LOVE", "CLAP", "INSIGHTFUL"]),
});

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json(
      { message: "Inicia sesión para reaccionar." },
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
    const { type } = schema.parse(await request.json());
    const reaction = await reactToPost(userId, postId, type);

    return NextResponse.json({ reaction });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Tipo de reacción inválido." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "No se pudo guardar la reacción." },
      { status: 500 },
    );
  }
}
