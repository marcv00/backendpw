import express, { Request, Response } from "express"
import { PrismaClient, Usuario } from "../../prisma/generated/prisma"
import jwt, {SignOptions} from "jsonwebtoken";
import { verificarToken } from "../middlewares/authMiddleware";


const JWT_SECRET = process.env.JWT_SECRET || "";

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

    // POST /usuarios/agregar-a-carrito Agregar juego al "carrito" del usuario autenticado
    router.post("/agregar-a-carrito", verificarToken, async (req: Request, res: Response) => {
        const { juegoId } = req.body;
        const usuarioId = (req as any).usuario?.id;

        if (!usuarioId || !juegoId) {
            return res.status(400).json({ error: "usuarioId y juegoId son requeridos" });
        }

        try {
            const existe = await prisma.carrito.findFirst({
                where: { usuarioId, juegoId }
            });

            if (existe) {
                return res.status(409).json({ error: "El juego ya está en el carrito" });
            }

            await prisma.carrito.create({
                data: { usuarioId, juegoId }
            });

            res.json({ mensaje: "Juego agregado al carrito correctamente" });
        } catch (error) {
            console.error("Error al agregar al carrito:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        } finally {
            await prisma.$disconnect();
        }
    });

    // DELETE /usuarios/eliminar-del-carrito  Quitar juego del "carrito" del usuario autenticado
    router.delete("/eliminar-del-carrito", verificarToken, async (req: Request, res: Response) => {
        const { juegoId } = req.body;
        const usuarioId = (req as any).usuario?.id;

        if (!usuarioId || !juegoId) {
            return res.status(400).json({ error: "usuarioId y juegoId válidos son requeridos" });
        }

        try {
            await prisma.carrito.deleteMany({
                where: { usuarioId, juegoId }
            });

            res.json({ mensaje: "Juego eliminado del carrito correctamente" });
        } catch (error) {
            console.error("Error al eliminar del carrito:", error);
            res.status(500).json({ error: "Error interno al eliminar del carrito" });
        } finally {
            await prisma.$disconnect();
        }
    });

    // GET /usuarios/carrito  Obtener los juegos en el "carrito" del usuario autenticado
    router.get("/carrito", verificarToken, async (req: Request, res: Response) => {
        const usuarioId = (req as any).usuario?.id;

        if (!usuarioId) {
            return res.status(401).json({ error: "No autorizado" });
        }

        try {
            const juegos = await prisma.carrito.findMany({
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
            });

            res.json(juegos.map(entry => entry.juego));
        } catch (error) {
            console.error("Error al obtener el carrito:", error);
            res.status(500).json({ error: "Error al obtener el carrito" });
        } finally {
            await prisma.$disconnect();
        }
    });

    // GET /usuarios/mis-juegos - Obtener los juegos que le pertenecen al usuario
    router.get("/mis-juegos", verificarToken, async (req: Request, res: Response) => {
        const usuarioId = (req as any).usuario?.id;

        if (!usuarioId) {
            return res.status(401).json({ error: "No autorizado" });
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
                            slug: true,
                            descripcion: true,
                            fotos: {
                                take: 1,
                                orderBy: { id: "asc" },
                                select: { url: true }
                            }
                        }
                    }
                }
            });

            res.json(juegos.map(entry => entry.juego));
        } catch (error) {
            console.error("Error al obtener los juegos del usuario:", error);
            res.status(500).json({ error: "Error al obtener los juegos" });
        } finally {
            await prisma.$disconnect();
        }
    });

    
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

    // POST /usuarios/login - Registrar un nuevo usuario
    router.post("/login", async (req: Request, res: Response) => {
        const { correo, contrasena } = req.body;

        if (!correo || !contrasena) {
            return res.status(400).json({ error: "Correo y contraseña son requeridos" });
        }

        try {
            const usuario = await prisma.usuario.findUnique({
                where: { correo }
            });

            if (!usuario) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }

            if (usuario.contrasena !== contrasena) {
                return res.status(401).json({ error: "Contraseña incorrecta" });
            }

            const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret"; // nunca null o undefined
            const token = jwt.sign(
                {
                    id: usuario.id,
                    correo: usuario.correo,
                    rol: usuario.rol
                },
                JWT_SECRET,
                {
                    expiresIn: process.env.JWT_EXPIRES_IN || "1h"
                } as SignOptions
            );

            res.json({
                mensaje: "Login exitoso",
                token,
                usuario: {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    correo: usuario.correo,
                    rol: usuario.rol
                }
            });
        } catch (error) {
            console.error("Error en login:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        } finally {
            await prisma.$disconnect();
        }
    });


    return router
}
export default UsuariosController