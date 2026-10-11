import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, setSessionCookie } from "@/lib/auth";

const schema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());

    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (
      !user ||
      !user.isActive ||
      !(await compare(input.password, user.passwordHash))
    ) {
      return NextResponse.json(
        { message: "Correo o contraseña incorrectos." },
        { status: 401 },
      );
    }

    const token = await createSession(user.id);
    await setSessionCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Introduce un correo y una contraseña válidos." },
        { status: 400 },
      );
    }

    console.error("Error al iniciar sesión:", error);

    return NextResponse.json(
      { message: "No se pudo iniciar sesión." },
      { status: 500 },
    );
  }
}
