/*
  Warnings:

  - A unique constraint covering the columns `[nombre]` on the table `Categoria` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[titulo]` on the table `Noticia` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nombre]` on the table `Plataforma` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `color` to the `Plataforma` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Plataforma" ADD COLUMN     "color" VARCHAR(20) NOT NULL;

-- CreateTable
CREATE TABLE "Resena" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "juegoId" INTEGER NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "texto" VARCHAR(1000) NOT NULL,
    "puntuacion" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Resena_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nombre_key" ON "Categoria"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Noticia_titulo_key" ON "Noticia"("titulo");

-- CreateIndex
CREATE UNIQUE INDEX "Plataforma_nombre_key" ON "Plataforma"("nombre");

-- AddForeignKey
ALTER TABLE "Resena" ADD CONSTRAINT "Resena_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resena" ADD CONSTRAINT "Resena_juegoId_fkey" FOREIGN KEY ("juegoId") REFERENCES "Juego"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
