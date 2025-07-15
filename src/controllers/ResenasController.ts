import express, { Request, Response } from "express";
import { PrismaClient } from "../../prisma/generated/prisma";

const ResenasController = () => {
    const router = express.Router();
    const prisma = new PrismaClient();

    // POST /resenas - Crear una reseña
    router.post("/", async (req: Request, res: Response) => {
        const { texto, puntuacion, juegoId, usuarioId } = req.body;

        if (!texto || !puntuacion || !juegoId || !usuarioId) {
            return res.status(400).json({ error: "Faltan datos obligatorios" });
        }

        try {
            const resena = await prisma.resena.create({
                data: {
                    texto,
                    puntuacion,
                    juegoId,
                    usuarioId,
                },
            });

            res.json(resena);
        } catch (error) {
            console.error("Error al agregar reseña:", error);
            res.status(500).json({ error: "Error interno al agregar reseña" });
        }
    });

    // GET /resenas/juego/:juegoId - Obtener reseñas de un juego
    router.get("/juego/:juegoId", async (req: Request, res: Response) => {
        const juegoId = parseInt(req.params.juegoId);

        if (isNaN(juegoId)) {
            return res.status(400).json({ error: "ID de juego inválido" });
        }

        try {
            const resenas = await prisma.resena.findMany({
                where: { juegoId },
                orderBy: { fechaCreacion: "desc" },
                include: {
                    usuario: { select: { nombre: true } },
                },
            });

            res.json(resenas);
        } catch (error) {
            console.error("Error al obtener reseñas:", error);
            res.status(500).json({ error: "Error interno al obtener reseñas" });
        }
    });

    // PUT /resenas/:id - Editar una reseña
    router.put("/:id", async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        const { texto, puntuacion } = req.body;

        if (isNaN(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        try {
            const resena = await prisma.resena.update({
                where: { id },
                data: {
                    texto,
                    puntuacion,
                },
            });

            res.json(resena);
        } catch (error) {
            console.error("Error al actualizar reseña:", error);
            res.status(500).json({ error: "Error interno al actualizar reseña" });
        }
    });

    // DELETE /resenas/:id - Eliminar una reseña
    router.delete("/:id", async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        try {
            const existe = await prisma.resena.findUnique({ where: { id } });

            if (!existe) {
                return res.status(404).json({ error: "Reseña no encontrada" });
            }

            await prisma.resena.delete({ where: { id } });

            res.json({ mensaje: "Reseña eliminada correctamente" });
        } catch (error) {
            console.error("Error al eliminar reseña:", error);
            res.status(500).json({ error: "Error interno al eliminar reseña" });
        }
    });

    return router;
};

export default ResenasController;
