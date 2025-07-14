import express, { Request, Response } from "express"
import { PrismaClient, Categoria } from "../generated/prisma"

const CategoriasController = () => {
    const router = express.Router()

    // GET /juegos
    router.get("/juegos", async (_req: Request, res: Response) => {
        const prisma = new PrismaClient()
        try {
            const categorias = await prisma.categoria.findMany()
            res.json(categorias)
        } catch (error) {
            console.error("Error al obtener categorias:", error)
            res.status(500).json({ error: "Error interno al obtener las categorias" })
        }
    })

    // GET /noticias
    router.get("/noticias", async (_req: Request, res: Response) => {
        const prisma = new PrismaClient()
        try {
            const categoriasNoticias = await prisma.catNoticia.findMany()
            res.json(categoriasNoticias)
        } catch (error) {
            console.error("Error al obtener categorias:", error)
            res.status(500).json({ error: "Error interno al obtener las categorias" })
        }
    })
    return router
}

export default CategoriasController