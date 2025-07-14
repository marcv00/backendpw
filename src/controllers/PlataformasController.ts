import express, { Request, Response } from "express"
import { PrismaClient, Plataforma } from "../generated/prisma"

const PlataformasController = () => {
    const router = express.Router()

    // GET /
    router.get("/", async (_req: Request, res: Response) => {
        const prisma = new PrismaClient()
        try {
            const plataformas = await prisma.plataforma.findMany()
            res.json(plataformas)
        } catch (error) {
            console.error("Error al obtener plataformas:", error)
            res.status(500).json({ error: "Error interno al obtener las plataformas" })
        }
    })

    return router
}

export default PlataformasController