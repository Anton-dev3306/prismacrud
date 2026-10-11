import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { followUser, unfollowUser } from "@/lib/services/interactions";

type Context = { params: Promise<{ id: string }> };

export async function PUT(_request: Request, context: Context) {
  const followerId = await getCurrentUserId();

  if (!followerId) {
    return NextResponse.json(
      { message: "Inicia sesión para seguir usuarios." },
      { status: 401 },
    );
  }

  const followingId = Number((await context.params).id);

  if (!Number.isSafeInteger(followingId) || followingId <= 0) {
    return NextResponse.json(
      { message: "ID de usuario inválido." },
      { status: 400 },
    );
  }

  try {
    const follow = await followUser(followerId, followingId);
    return NextResponse.json({ follow });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "No se pudo seguir al usuario." },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: Request, context: Context) {
  const followerId = await getCurrentUserId();

  if (!followerId) {
    return NextResponse.json(
      { message: "Inicia sesión para continuar." },
      { status: 401 },
    );
  }

  const followingId = Number((await context.params).id);

  if (!Number.isSafeInteger(followingId) || followingId <= 0) {
    return NextResponse.json(
      { message: "ID inválido." },
      { status: 400 },
    );
  }

  await unfollowUser(followerId, followingId);
  return NextResponse.json({ message: "Dejaste de seguir al usuario." });
}
