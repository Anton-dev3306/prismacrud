import { NextResponse } from "next/server";
import { ZodError, z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { registerUser } from "@/lib/services/users";
import { createSession, setSessionCookie } from "@/lib/auth";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  username: z.string().trim().toLowerCase()
    .regex(/^[a-z0-9_]{3,30}$/),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(72),
  bio: z.string().max(300).optional(),
  location: z.string().max(150).optional(),
  website: z.string().url().optional().or(z.literal("")),
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const user = await registerUser(input);
    const token = await createSession(user.id);

    await setSessionCookie(token);

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Revisa los campos del formulario.", issues: error.issues },
        { status: 400 },
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "El correo o nombre de usuario ya está registrado." },
        { status: 409 },
      );
    }

    console.error("Error al registrar usuario:", error);

    return NextResponse.json(
      { message: "No se pudo completar el registro." },
      { status: 500 },
    );
  }
}
