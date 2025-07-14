import express, { Request, Response } from "express"
import { PrismaClient, Usuario } from "../generated/prisma"

const UsuariosController = () => {
    const router = express.Router()
    const prisma = new PrismaClient()

    // POST /reestablecer - Reestablecer la contraseña del usuario
    router.post("/reestablecer", async (req: Request, res: Response) => {
        const { correo, nuevaContrasena } = req.body

        if (!correo || !nuevaContrasena) {
            return res.status(400).json({ error: "Correo y nueva contraseña son requeridos" })
        }

        try {
            const usuario = await prisma.usuario.findUnique({ where: { correo } })

            if (!usuario) {
                return res.status(404).json({ error: "Usuario no encontrado" })
            }

            await prisma.usuario.update({
                where: { correo },
                data: { contrasena: nuevaContrasena }
            })

            res.json({ mensaje: "Contraseña actualizada correctamente" })
        } catch (error) {
            console.error("Error al reestablecer contraseña:", error)
            res.status(500).json({ error: "Error interno del servidor" })
        } finally {
            await prisma.$disconnect()
        }
    })

    // POST /agregar - Agregar juego al "carrito" (usando JuegoXUsuario)
    router.post("/agregar-a-carrito", async (req: Request, res: Response) => {
        const { usuarioId, juegoId } = req.body

        if (!usuarioId || !juegoId) {
            return res.status(400).json({ error: "usuarioId y juegoId son requeridos" })
        }

        try {
            const existe = await prisma.juegoXUsuario.findFirst({
                where: { usuarioId, juegoId }
            })

            if (existe) {
                return res.status(409).json({ error: "El juego ya está en el carrito" })
            }

            await prisma.juegoXUsuario.create({
                data: { usuarioId, juegoId }
            })

            res.json({ mensaje: "Juego agregado al carrito (simulado)" })
        } catch (error) {
            console.error("Error al agregar al carrito simulado:", error)
            res.status(500).json({ error: "Error al agregar al carrito" })
        } finally {
            await prisma.$disconnect()
        }
    })
    // DELETE /usuarios/eliminar-del-carrito
    router.delete("/eliminar-del-carrito", async (req: Request, res: Response) => {
        console.log("DELETE BODY:", req.body); // 👈 esto es crucial

    const { usuarioId, juegoId } = req.body;

    if (!usuarioId || !juegoId) {
    return res.status(400).json({ error: "usuarioId y juegoId válidos son requeridos" });
    }


        if (isNaN(usuarioId) || isNaN(juegoId)) {
            return res.status(400).json({ error: "usuarioId y juegoId válidos son requeridos" });
        }

        try {
            await prisma.juegoXUsuario.deleteMany({
                where: {
                    usuarioId,
                    juegoId
                }
            });

            res.json({ mensaje: "Juego eliminado del carrito correctamente" });
        } catch (error) {
            console.error("Error al eliminar del carrito:", error);
            res.status(500).json({ error: "Error interno al eliminar del carrito" });
        } finally {
            await prisma.$disconnect();
        }
    });


    router.get("/carrito/:usuarioId", async (req: Request, res: Response) => {
        const usuarioId = parseInt(req.params.usuarioId)

        if (isNaN(usuarioId)) {
            return res.status(400).json({ error: "usuarioId inválido" })
        }

        try {
            const juegos = await prisma.juegoXUsuario.findMany({
                where: { usuarioId },
                select: {
                    juego: {
                        select: {
                            id: true,
                            titulo: true,
                            precio: true,
                            porcentajeOferta: true,
                            fotos: {
                                take: 1,
                                orderBy: { id: "asc" },
                                select: { url: true }
                            }
                        }
                    }
                }
            })

            res.json(juegos.map(entry => entry.juego))
        } catch (error) {
            console.error("Error al obtener el carrito:", error)
            res.status(500).json({ error: "Error al obtener el carrito" })
        } finally {
            await prisma.$disconnect()
        }
    })
    // GET /usuarios/juegos - Obtener todos los juegos disponibles
    router.get("/juegos", async (_req: Request, res: Response) => {

        try {
            const juegos = await prisma.juego.findMany({
                select: {
                    id: true,
                    titulo: true,
                    precio: true,
                    porcentajeOferta: true,
                    fotos: {
                        take: 1,
                        orderBy: { id: "asc" },
                        select: { url: true }
                    }
                }
            })

            res.json(juegos)
        } catch (error) {
            console.error("Error al obtener los juegos:", error)
            res.status(500).json({ error: "Error al obtener los juegos" })
        } finally {
            await prisma.$disconnect()
        }
    })



    return router
}
export default UsuariosController