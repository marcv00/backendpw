/*
  Warnings:

  - A unique constraint covering the columns `[titulo]` on the table `Juego` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Juego_titulo_key" ON "Juego"("titulo");
