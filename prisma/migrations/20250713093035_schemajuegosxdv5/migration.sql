/*
  Warnings:

  - A unique constraint covering the columns `[nombre]` on the table `CatNoticia` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CatNoticia_nombre_key" ON "CatNoticia"("nombre");
