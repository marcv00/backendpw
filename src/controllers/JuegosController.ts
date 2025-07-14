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

    // GET /mas-vendidos
    router.get("/mas-vendidos", async (_req: Request, res: Response) => {
        const prisma = new PrismaClient()

        try {
            const juegos = await prisma.juego.findMany({
                take: 12,
                orderBy: {
                    ventas: {
                        _count: 'desc'
                    }
                },
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
                    },
                    _count: {
                        select: {
                            ventas: true
                        }
                    }
                }
            })

            const juegosConVentas = juegos.map(({ _count, ...resto }) => ({
                ...resto,
                ventas: _count.ventas
            }))

            res.json(juegosConVentas)
        } catch (error) {
            console.error("Error al obtener juegos mas vendidos:", error)
            res.status(500).json({ error: "Error al obtener juegos mas vendidos" })
        } finally {
            await prisma.$disconnect()
        }
    })



    return router
}

export default JuegosController