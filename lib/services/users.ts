import { hash } from "bcryptjs";
import { prisma } from "../prisma";

type RegisterUserInput = {
  name: string;
  username: string;
  email: string;
  password: string;
  bio?: string;
  location?: string;
  website?: string;
};
    
export async function registerUser(input: RegisterUserInput) {
  const name = input.name.trim();
  const username = input.username.trim().toLowerCase();
  const email = input.email.trim().toLowerCase();

  if (!name || !username || !email || !input.password) {
    throw new Error("Todos los campos obligatorios deben completarse.");
  }

  if (input.password.length < 8) {
    throw new Error("La contraseña debe tener al menos 8 caracteres.");
  }

  if (!/^[a-z0-9_]{3,30}$/.test(username)) {
    throw new Error("El nombre de usuario no es válido.");
  }

  const passwordHash = await hash(input.password, 12);

  return prisma.user.create({
    data: {
      name,
      username,
      email,
      passwordHash,
      profile: {
        create: {
          bio: input.bio?.trim() || undefined,
          location: input.location?.trim() || undefined,
          website: input.website?.trim() || undefined,
        },
      },
    },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      createdAt: true,
      profile: true,
    },
  });
}
