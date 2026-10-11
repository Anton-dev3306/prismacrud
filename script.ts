
import { prisma } from "./lib/prisma";

async function main() {
  console.log("Limpiando datos anteriores de prueba...");

  // ADVERTENCIA: elimina todos los registros de estas tablas.
  // Utiliza este script únicamente en una base de datos de desarrollo.
  await prisma.follow.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();

  // 1. Categorías
  const [technology, databases, tutorials] = await Promise.all([
    prisma.category.create({
      data: {
        name: "Tecnología",
        slug: "tecnologia",
        description: "Noticias y tendencias tecnológicas.",
      },
    }),
    prisma.category.create({
      data: {
        name: "Bases de datos",
        slug: "bases-de-datos",
        description: "Bases de datos SQL y NoSQL.",
      },
    }),
    prisma.category.create({
      data: {
        name: "Tutoriales",
        slug: "tutoriales",
        description: "Guías prácticas para desarrolladores.",
      },
    }),
  ]);

  // 2. Etiquetas
  const [prismaTag, typescriptTag, postgresTag, backendTag] =
    await Promise.all([
      prisma.tag.create({ data: { name: "Prisma", slug: "prisma" } }),
      prisma.tag.create({
        data: { name: "TypeScript", slug: "typescript" },
      }),
      prisma.tag.create({
        data: { name: "PostgreSQL", slug: "postgresql" },
      }),
      prisma.tag.create({ data: { name: "Backend", slug: "backend" } }),
    ]);

  // 3. Usuarios
  const antonio = await prisma.user.create({
    data: {
      name: "Antonio Mora",
      username: "antonio_dev",
      email: "antonio@example.com",
      passwordHash: "dev-only-not-a-real-hash",
      profile: {
        create: {
          bio: "Desarrollador web interesado en backend y bases de datos.",
          website: "https://anton-dev.vercel.app/",
          location: "Veracruz, México",
        },
      },
    },
  });

  const maria = await prisma.user.create({
    data: {
      name: "María López",
      username: "maria_codes",
      email: "maria@example.com",
      passwordHash: "dev-only-not-a-real-hash",
      profile: {
        create: {
          bio: "Desarrolladora de software y entusiasta de TypeScript.",
          location: "Ciudad de México",
        },
      },
    },
  });

  const carlos = await prisma.user.create({
    data: {
      name: "Carlos García",
      username: "carlos_db",
      email: "carlos@example.com",
      passwordHash: "dev-only-not-a-real-hash",
      profile: {
        create: {
          bio: "Especialista en bases de datos y arquitectura backend.",
          location: "Monterrey, México",
        },
      },
    },
  });

  // 4. Publicaciones
  const post1 = await prisma.post.create({
    data: {
      title: "Introducción a Prisma ORM 7",
      slug: "introduccion-prisma-orm-7",
      excerpt: "Primeros pasos para trabajar con Prisma ORM.",
      content:
        "Prisma ORM permite consultar bases de datos con un cliente tipado. En este artículo exploramos su configuración y sus principales ventajas.",
      status: "PUBLISHED",
      publishedAt: new Date(),
      authorId: antonio.id,
      categoryId: technology.id,
      tags: {
        connect: [{ id: prismaTag.id }, { id: typescriptTag.id }],
      },
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: "Cómo modelar relaciones en PostgreSQL",
      slug: "relaciones-postgresql",
      excerpt: "Aprende a representar relaciones entre entidades.",
      content:
        "Las relaciones uno a uno, uno a muchos y muchos a muchos permiten organizar los datos y mantener su integridad.",
      status: "PUBLISHED",
      publishedAt: new Date(),
      authorId: carlos.id,
      categoryId: databases.id,
      tags: {
        connect: [{ id: postgresTag.id }, { id: backendTag.id }],
      },
    },
  });

  const post3 = await prisma.post.create({
    data: {
      title: "Consultas tipadas con TypeScript",
      slug: "consultas-tipadas-typescript",
      excerpt: "Mejora la seguridad de tipos al consultar tus datos.",
      content:
        "Un cliente tipado ayuda a detectar errores durante el desarrollo y facilita el mantenimiento de las consultas.",
      status: "PUBLISHED",
      publishedAt: new Date(),
      authorId: maria.id,
      categoryId: tutorials.id,
      tags: {
        connect: [
          { id: typescriptTag.id },
          { id: prismaTag.id },
          { id: backendTag.id },
        ],
      },
    },
  });

  const post4 = await prisma.post.create({
    data: {
      title: "Próximo tutorial sobre transacciones",
      slug: "proximo-tutorial-transacciones",
      excerpt: "Una introducción a las transacciones en bases de datos.",
      content:
        "Esta publicación todavía está en preparación y no debe mostrarse en el listado público.",
      status: "DRAFT",
      authorId: antonio.id,
      categoryId: databases.id,
      tags: {
        connect: [{ id: postgresTag.id }, { id: prismaTag.id }],
      },
    },
  });

  // 5. Comentarios
  const comment1 = await prisma.comment.create({
    data: {
      content: "Muy buena introducción, me ayudó a entender Prisma.",
      userId: maria.id,
      postId: post1.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: "Gracias. Después publicaré más ejemplos prácticos.",
      userId: antonio.id,
      postId: post1.id,
      parentId: comment1.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: "La explicación de las relaciones es muy útil.",
      userId: antonio.id,
      postId: post2.id,
    },
  });

  // 6. Reacciones
  await prisma.reaction.createMany({
    data: [
      { type: "LIKE", userId: maria.id, postId: post1.id },
      { type: "LOVE", userId: carlos.id, postId: post1.id },
      { type: "INSIGHTFUL", userId: antonio.id, postId: post2.id },
      { type: "CLAP", userId: maria.id, postId: post2.id },
    ],
  });

  // 7. Publicaciones guardadas
  await prisma.bookmark.createMany({
    data: [
      { userId: antonio.id, postId: post2.id },
      { userId: maria.id, postId: post1.id },
      { userId: carlos.id, postId: post3.id },
    ],
  });

  // 8. Seguidores
  await prisma.follow.createMany({
    data: [
      { followerId: antonio.id, followingId: maria.id },
      { followerId: antonio.id, followingId: carlos.id },
      { followerId: maria.id, followingId: antonio.id },
      { followerId: carlos.id, followingId: maria.id },
    ],
  });

  console.log("\nDatos de prueba creados correctamente.");
  console.log({
    users: 3,
    profiles: 3,
    categories: 3,
    tags: 4,
    posts: 4,
    comments: 3,
    reactions: 4,
    bookmarks: 3,
    follows: 4,
  });

  console.log("\nPublicaciones creadas:");
  console.log({
    published: [post1.slug, post2.slug, post3.slug],
    draft: post4.slug,
  });
}

main()
  .catch((error) => {
    console.error("Error al crear los datos de prueba:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
