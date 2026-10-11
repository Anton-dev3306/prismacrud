# 🚀 DevBlog · Plataforma de Publicaciones de la Comunidad

Aplicación web full-stack tipo Blog / CRUD construida con **Next.js (App Router)**, **TypeScript**, **Tailwind CSS** y **Prisma ORM** respaldado por una base de datos **PostgreSQL**.

Diseñada con un enfoque limpio y moderno de UX/UI enfocado en legibilidad, jerarquía tipográfica y rendimiento visual.

---

## 🎨 Sistema de Diseño (UX/UI)

- **Tipografía Principal:** `Heebo` (Medium / Bold) — Identidad principal, encabezados e interfaz de usuario.
- **Tipografía Secundaria / Monospace:** `Lekton` (Regular) — Metadatos, fechas, usernames, siglas y etiquetas técnicas.
- **Paleta de Colores:**
  - **Color Principal / Acentuado (`#0F172A`):** Navegación, encabezados, botones de acción primaria y elementos interactivos.
  - **Color de Fondo / Superficie (`#F8FAFC`):** Fondos limpios, tarjetas elevadas y contenedores de formularios.

---

## 📸 Vista Previa del Sistema

| Vista Principal (Dashboard) | Nueva Publicación |
| :---: | :---: |
| ![Dashboard Principal](./docs/dashboard.png) | ![Crear Publicación](./docs/new-post.png) |

| Iniciar Sesión | Crear Cuenta |
| :---: | :---: |
| ![Login](./docs/login.png) | ![Register](./docs/register.png) |

> *Nota: Asegúrate de guardar tus capturas de pantalla en la carpeta `docs/` con los nombres `dashboard.png`, `new-post.png`, `login.png` y `register.png`.*

---

## 🛠️ Tecnologías Utilizadas

- **Framework:** Next.js 16 (App Router + React Server Components)
- **Lenguaje:** TypeScript
- **ORM:** Prisma ORM v7
- **Base de Datos:** PostgreSQL
- **Estilos:** Tailwind CSS v3
- **Paquetes:** `pnpm` (Gestor de dependencias)

---

## 🗄️ Modelo de Datos y Esquema Prisma

El modelo relacional soporta autenticación, publicaciones, categorización, interacciones (comentarios, reacciones, marcadores) y red de seguidores.

```prisma
enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum ReactionType {
  LIKE
  LOVE
  CLAP
  INSIGHTFUL
}

model User {
  id           Int        @id @default(autoincrement())
  email        String     @unique
  username     String     @unique
  name         String
  passwordHash String
  role         String     @default("USER")
  isActive     Boolean    @default(true)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  profile      Profile?
  posts        Post[]
  comments     Comment[]
  reactions    Reaction[]
  bookmarks    Bookmark[]
  following    Follow[]   @relation("UserFollowing")
  followers    Follow[]   @relation("UserFollowers")
}

model Profile {
  id        Int      @id @default(autoincrement())
  bio       String?  @db.VarChar(300)
  avatarUrl String?
  website   String?
  location  String?
  userId    Int      @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id          Int        @id @default(autoincrement())
  title       String     @db.VarChar(180)
  slug        String     @unique
  excerpt     String?    @db.VarChar(300)
  content     String     @db.Text
  status      PostStatus @default(DRAFT)
  publishedAt DateTime?
  viewCount   Int        @default(0)
  authorId    Int
  categoryId  Int
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  author      User       @relation(fields: [authorId], references: [id], onDelete: Cascade)
  category    Category   @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  tags        Tag[]
  comments    Comment[]
  reactions   Reaction[]
  bookmarks   Bookmark[]

  @@index([authorId, createdAt])
  @@index([categoryId, status])
  @@index([status, publishedAt])
}

model Category {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  slug        String   @unique
  description String?
  posts       Post[]
  createdAt   DateTime @default(now())
}

model Tag {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  slug      String   @unique
  posts     Post[]
  createdAt DateTime @default(now())
}

model Comment {
  id        Int      @id @default(autoincrement())
  content   String   @db.Text
  userId    Int
  postId    Int
  parentId  Int?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  author    User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  post      Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  parent    Comment?  @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies   Comment[] @relation("CommentReplies")

  @@index([postId, createdAt])
  @@index([parentId])
}

model Reaction {
  id        Int          @id @default(autoincrement())
  type      ReactionType @default(LIKE)
  userId    Int
  postId    Int
  createdAt DateTime     @default(now())

  user      User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  post      Post         @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([userId, postId])
  @@index([postId, type])
}

model Bookmark {
  id        Int      @id @default(autoincrement())
  userId    Int
  postId    Int
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([userId, postId])
  @@index([userId, createdAt])
}

model Follow {
  id          Int      @id @default(autoincrement())
  followerId  Int
  followingId Int
  createdAt   DateTime @default(now())

  follower    User     @relation("UserFollowing", fields: [followerId], references: [id], onDelete: Cascade)
  following   User     @relation("UserFollowers", fields: [followingId], references: [id], onDelete: Cascade)

  @@unique([followerId, followingId])
  @@index([followingId])
}
