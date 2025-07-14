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

    // GET /noticias/slug/:slug
    router.get("/slug/:slug", async (req: Request, res: Response) => {
        const { slug } = req.params;

        try {
            const noticia = await prisma.noticia.findUnique({
                where: { slug },
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

            const categoriasPlanas = noticia.categorias.map(c => c.catNoticia.nombre);

            res.json({
                ...noticia,
                categorias: categoriasPlanas
            });
        } catch (error) {
            console.error("Error al obtener noticia por slug:", error);
            res.status(500).json({ error: "Error interno al obtener la noticia" });
        }
    });




    return router
}

export default NoticiasController
