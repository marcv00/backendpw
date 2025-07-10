/*
  Warnings:

  - You are about to drop the column `estado` on the `Categoria` table. All the data in the column will be lost.
  - You are about to alter the column `nombre` on the `Categoria` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to drop the column `password` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the `InfPersonal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Todo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CategoriaXUsuario` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[correo]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `apellido` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contrasena` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `correo` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('USER', 'ADMIN');

-- DropForeignKey
ALTER TABLE "InfPersonal" DROP CONSTRAINT "InfPersonal_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "Todo" DROP CONSTRAINT "Todo_categoriaId_fkey";

-- DropForeignKey
ALTER TABLE "Todo" DROP CONSTRAINT "Todo_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "_CategoriaXUsuario" DROP CONSTRAINT "_CategoriaXUsuario_A_fkey";

-- DropForeignKey
ALTER TABLE "_CategoriaXUsuario" DROP CONSTRAINT "_CategoriaXUsuario_B_fkey";

-- AlterTable
ALTER TABLE "Categoria" DROP COLUMN "estado",
ALTER COLUMN "nombre" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "password",
DROP COLUMN "username",
ADD COLUMN     "apellido" VARCHAR(50) NOT NULL,
ADD COLUMN     "contrasena" VARCHAR(100) NOT NULL,
ADD COLUMN     "correo" VARCHAR(100) NOT NULL,
ADD COLUMN     "nombre" VARCHAR(50) NOT NULL,
ADD COLUMN     "rol" "Rol" NOT NULL DEFAULT 'USER';

-- DropTable
DROP TABLE "InfPersonal";

-- DropTable
DROP TABLE "Todo";

-- DropTable
DROP TABLE "_CategoriaXUsuario";

-- CreateTable
CREATE TABLE "Juego" (
    "id" SERIAL NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "porcentajeOferta" DOUBLE PRECISION,
    "trailerUrl" VARCHAR(200),
    "rating" DOUBLE PRECISION,
    "fechaLanzamiento" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Juego_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Noticia" (
    "id" SERIAL NOT NULL,
    "titulo" VARCHAR(120) NOT NULL,
    "tiempoLectura" INTEGER NOT NULL,
    "fechaPub" TIMESTAMP(3) NOT NULL,
    "texto" TEXT NOT NULL,
    "resumen" VARCHAR(300) NOT NULL,
    "fotoId" INTEGER NOT NULL,

    CONSTRAINT "Noticia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Foto" (
    "id" SERIAL NOT NULL,
    "url" VARCHAR(300) NOT NULL,
    "juegoId" INTEGER,

    CONSTRAINT "Foto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plataforma" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "Plataforma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venta" (
    "id" SERIAL NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "fechaVenta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER NOT NULL,

    CONSTRAINT "Venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JuegoXVenta" (
    "id" SERIAL NOT NULL,
    "juegoId" INTEGER NOT NULL,
    "ventaId" INTEGER NOT NULL,

    CONSTRAINT "JuegoXVenta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JuegoXUsuario" (
    "id" SERIAL NOT NULL,
    "juegoId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,

    CONSTRAINT "JuegoXUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clave" (
    "id" SERIAL NOT NULL,
    "texto" VARCHAR(40) NOT NULL,
    "usada" BOOLEAN NOT NULL DEFAULT false,
    "juegoId" INTEGER NOT NULL,
    "ventaId" INTEGER NOT NULL,

    CONSTRAINT "Clave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoriaXJuego" (
    "id" SERIAL NOT NULL,
    "juegoId" INTEGER NOT NULL,
    "categoriaId" INTEGER NOT NULL,

    CONSTRAINT "CategoriaXJuego_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlataformaXJuego" (
    "id" SERIAL NOT NULL,
    "juegoId" INTEGER NOT NULL,
    "plataformaId" INTEGER NOT NULL,

    CONSTRAINT "PlataformaXJuego_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatNoticia" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "CatNoticia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatNoticiaXNoticia" (
    "id" SERIAL NOT NULL,
    "noticiaId" INTEGER NOT NULL,
    "catNoticiaId" INTEGER NOT NULL,

    CONSTRAINT "CatNoticiaXNoticia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Noticia_fotoId_key" ON "Noticia"("fotoId");

-- CreateIndex
CREATE UNIQUE INDEX "Clave_texto_key" ON "Clave"("texto");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- AddForeignKey
ALTER TABLE "Noticia" ADD CONSTRAINT "Noticia_fotoId_fkey" FOREIGN KEY ("fotoId") REFERENCES "Foto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Foto" ADD CONSTRAINT "Foto_juegoId_fkey" FOREIGN KEY ("juegoId") REFERENCES "Juego"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JuegoXVenta" ADD CONSTRAINT "JuegoXVenta_juegoId_fkey" FOREIGN KEY ("juegoId") REFERENCES "Juego"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JuegoXVenta" ADD CONSTRAINT "JuegoXVenta_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JuegoXUsuario" ADD CONSTRAINT "JuegoXUsuario_juegoId_fkey" FOREIGN KEY ("juegoId") REFERENCES "Juego"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JuegoXUsuario" ADD CONSTRAINT "JuegoXUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clave" ADD CONSTRAINT "Clave_juegoId_fkey" FOREIGN KEY ("juegoId") REFERENCES "Juego"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clave" ADD CONSTRAINT "Clave_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoriaXJuego" ADD CONSTRAINT "CategoriaXJuego_juegoId_fkey" FOREIGN KEY ("juegoId") REFERENCES "Juego"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoriaXJuego" ADD CONSTRAINT "CategoriaXJuego_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlataformaXJuego" ADD CONSTRAINT "PlataformaXJuego_juegoId_fkey" FOREIGN KEY ("juegoId") REFERENCES "Juego"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlataformaXJuego" ADD CONSTRAINT "PlataformaXJuego_plataformaId_fkey" FOREIGN KEY ("plataformaId") REFERENCES "Plataforma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatNoticiaXNoticia" ADD CONSTRAINT "CatNoticiaXNoticia_noticiaId_fkey" FOREIGN KEY ("noticiaId") REFERENCES "Noticia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatNoticiaXNoticia" ADD CONSTRAINT "CatNoticiaXNoticia_catNoticiaId_fkey" FOREIGN KEY ("catNoticiaId") REFERENCES "CatNoticia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
