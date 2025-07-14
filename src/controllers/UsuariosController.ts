import express, { Request, Response } from "express"
import { PrismaClient, Usuario } from "../generated/prisma"

const UsuariosController = () => {
    const router = express.Router()

    // GET /usuarios-lista - Obtener todos los usuarios
    router.get("/lista", async (_req: Request, res: Response) => {
        const prisma = new PrismaClient()

        try {
            const usuarios = await prisma.usuario.findMany({
                select: {
                    id: true,
                    nombre: true,
                    apellido: true,
                    correo: true,
                    rol: true
                }
            })

            res.json(usuarios)
        } catch (error) {
            console.error("Error al obtener usuarios:", error)
            res.status(500).json({ error: "Error al obtener usuarios" })
        } finally {
            await prisma.$disconnect()
        }
    })

    return router
}

export default UsuariosController