/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Noticia` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Noticia` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Noticia" ADD COLUMN     "slug" VARCHAR(120) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Noticia_slug_key" ON "Noticia"("slug");
