import express, { Request, Response } from "express"
import { PrismaClient, Noticia } from "../generated/prisma"

const NoticiasController = () => {
    const router = express.Router()
    const prisma = new PrismaClient()

    // GET /noticias/page
    router.get("/page", async (_req: Request, res: Response) => {
        try {
            const noticiasEnPagina = await prisma.noticia.findMany({
                orderBy: {
                    fechaPub: "desc"
                },
                take: 25,
                select: {
                    id: true,
                    titulo: true,
                    resumen: true,
                    tiempoLectura: true,
                    slug: true,
                    foto: {
                        select: {
                            url: true
                        }
                    },
                    categorias: {
                        select: {
                            catNoticia: {
                                select: {
                                    nombre: true
                                }
                            }
                        }
                    }
                }
            });

            // 🔄 Transformar las categorias de cada noticia
            const noticiasConCategoriasPlanas = noticiasEnPagina.map(noticia => ({
                ...noticia,
                categorias: noticia.categorias.map(c => c.catNoticia.nombre)
            }));

            res.json(noticiasConCategoriasPlanas);
        } catch (error) {
            console.error("Error al obtener noticias:", error);
            res.status(500).json({ error: "Error interno al obtener las noticias" });
        }
    });

    // GET /noticias/carousel
    router.get("/carousel", async (_req: Request, res: Response) => {
        try {
            const noticiasEnCarousel = await prisma.noticia.findMany({
                orderBy: {
                    fechaPub: "desc"
                },
                take: 8,
                select: {
                    id: true,
                    titulo: true,
                    resumen: true,
                    slug: true,
                    foto: {
                        select: {
                            url: true
                        }
                    }
                }
            })
            res.json(noticiasEnCarousel)
        } catch (error) {
            console.error("Error al obtener noticias:", error)
            res.status(500).json({ error: "Error interno al obtener las noticias" })
        }
    })

    // GET /noticias?id=123
    router.get("/", async (req: Request, res: Response) => {
        const id = parseInt(req.query.id as string);

        if (isNaN(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        try {
            const noticia = await prisma.noticia.findUnique({
                where: { id },
                select: {
                    id: true,
                    titulo: true,
                    texto: true,
                    slug: true,
                    tiempoLectura: true,
                    fechaPub: true,
                    foto: {
                        select: {
                            url: true
                        }
                    },
                    categorias: {
                        select: {
                            catNoticia: {
                                select: {
                                    nombre: true
                                }
                            }
                        }
                    }
                }
            });

            if (!noticia) {
                return res.status(404).json({ error: "Noticia no encontrada" });
            }

            // 🔄 Opcional: transformar `categorias` para que sea un array simple
            const categoriasPlanas = noticia.categorias.map(c => c.catNoticia);

            res.json({
                ...noticia,
                categorias: categoriasPlanas.map(c => c.nombre)
            });
        } catch (error) {
            console.error("Error al obtener noticia:", error);
            res.status(500).json({ error: "Error interno al obtener la noticia" });
        }
    });


    // GET /noticias/admin – Lista completa para administración
    router.get("/admin", async (_req: Request, res: Response) => {
        try {
            const noticias = await prisma.noticia.findMany({
                orderBy: { fechaPub: "desc" },
                select: {
                    id: true,
                    titulo: true,
                    resumen: true,
                    texto: true,
                    slug: true,
                    tiempoLectura: true,
                    fechaPub: true,
                    foto: {
                        select: { url: true }
                    }
                }
            });

            res.json(noticias);
        } catch (error) {
            console.error("Error al obtener noticias admin:", error);
            res.status(500).json({ error: "Error interno al obtener noticias completas" });
        }
    });


    //PUT /noticias/:id – Actualizar una noticia
    router.put("/:id", async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        const { titulo, resumen, texto, slug, tiempoLectura, fechaPub, fotoUrl } = req.body;

        if (isNaN(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        try {
            const noticia = await prisma.noticia.findUnique({ where: { id } });
            if (!noticia) {
                return res.status(404).json({ error: "Noticia no encontrada" });
            }

            // Actualizar la foto
            await prisma.foto.update({
                where: { id: noticia.fotoId },
                data: { url: fotoUrl }
            });

            // Actualizar la noticia
            const noticiaActualizada = await prisma.noticia.update({
                where: { id },
                data: {
                    titulo,
                    resumen,
                    texto,
                    slug,
                    tiempoLectura,
                    fechaPub: new Date(fechaPub)
                }
            });

            res.json(noticiaActualizada);
        } catch (error) {
            console.error("Error al actualizar noticia:", error);
            res.status(500).json({ error: "Error interno al actualizar noticia" });
        }
    });

    //DELETE /noticias/:id – Eliminar noticia
    router.delete("/:id", async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        try {
            const noticia = await prisma.noticia.findUnique({ where: { id } });
            if (!noticia) {
                return res.status(404).json({ error: "Noticia no encontrada" });
            }

            await prisma.catNoticiaXNoticia.deleteMany({ where: { noticiaId: id } });

            await prisma.noticia.delete({ where: { id } });

            await prisma.foto.delete({ where: { id: noticia.fotoId } });

            res.json({ mensaje: "Noticia eliminada correctamente" });
        } catch (error) {
            console.error("Error al eliminar noticia:", error);
            res.status(500).json({ error: "Error interno al eliminar noticia" });
        }
    });

    //POST /noticias – Crear noticia
    router.post("/", async (req: Request, res: Response) => {
        const { titulo, resumen, texto, slug, tiempoLectura, fechaPub, fotoUrl } = req.body;

        try {
            const nuevaFoto = await prisma.foto.create({
                data: { url: fotoUrl }
            });

            const noticia = await prisma.noticia.create({
                data: {
                    titulo,
                    resumen,
                    texto,
                    slug,
                    tiempoLectura,
                    fechaPub: new Date(fechaPub),
                    fotoId: nuevaFoto.id
                },
                include: {
                    foto: true
                }
            });

            res.json(noticia);
        } catch (error) {
            console.error("Error al crear noticia:", error);
            res.status(500).json({ error: "Error interno al crear noticia" });
        }
    });

    return router
}

export default NoticiasController
