import express, { Request, Response } from "express"
import { PrismaClient, Juego } from "../generated/prisma"

const JuegosController = () => {
    const router = express.Router()

    // GET /recientes - Obtener los 10 juegos más recientemente subidos
    router.get("/recientes", async (_req: Request, res: Response) => {
        const prisma = new PrismaClient()

        try {
            const juegosRecientes = await prisma.juego.findMany({
                orderBy: {
                    fechaSubida: "desc"
                },
                take: 12,
                select: {
                    id: true,
                    titulo: true,
                    descripcion: true,
                    precio: true,
                    porcentajeOferta: true,
                    fotos: {
                        take: 1,
                        orderBy: { id: 'asc' },
                        select: {
                            url: true
                        }
                    }
                }
            })

            res.json(juegosRecientes)
        } catch (error) {
            console.error("Error al obtener juegos recientes:", error)
            res.status(500).json({ error: "Error al obtener juegos recientes" })
        } finally {
            await prisma.$disconnect()
        }
    })


    return router
}

export default JuegosController