import express, { Request, Response } from "express"
import { PrismaClient, Juego } from "../../prisma/generated/prisma"

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
                    slug: true,
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
        const prisma = new PrismaClient();

        try {
            const juegos = await prisma.juego.findMany({
                take: 12,
                orderBy: {
                    ventas: {
                        _count: "desc"
                    }
                },
                select: {
                    id: true,
                    titulo: true,
                    descripcion: true,
                    precio: true,
                    porcentajeOferta: true,
                    slug: true,
                    fotos: {
                        take: 1,
                        orderBy: { id: "asc" },
                        select: {
                            url: true
                        }
                    },
                    plataformas: {
                        select: {
                            plataforma: {
                                select: {
                                    nombre: true
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            ventas: true
                        }
                    }
                }
            });

            const juegosConVentas = juegos.map(({ _count, plataformas, ...resto }) => ({
                ...resto,
                ventas: _count.ventas,
                plataformas: plataformas.map(p => p.plataforma.nombre)
            }));

            res.json(juegosConVentas);
        } catch (error) {
            console.error("Error al obtener juegos mas vendidos:", error);
            res.status(500).json({ error: "Error al obtener juegos mas vendidos" });
        } finally {
            await prisma.$disconnect();
        }
    });

    // GET /explorar - Obtener todos los juegos con sus categorias y plataformas
    router.get("/explorar", async (_req: Request, res: Response) => {
        const prisma = new PrismaClient()

        try {
            const juegos = await prisma.juego.findMany({
                orderBy: {
                    titulo: 'asc'
                },
                select: {
                    id: true,
                    titulo: true,
                    descripcion: true,
                    precio: true,
                    porcentajeOferta: true,
                    slug: true,
                    fotos: {
                        take: 1,
                        orderBy: { id: 'asc' },
                        select: {
                            url: true
                        }
                    },
                    categorias: {
                        select: {
                            categoria: {
                                select: {
                                    nombre: true
                                }
                            }
                        }
                    },
                    plataformas: {
                        select: {
                            plataforma: {
                                select: {
                                    nombre: true
                                }
                            }
                        }
                    }
                }
            })

            const juegosFormateados = juegos.map(juego => ({
                ...juego,
                categorias: juego.categorias.map(c => c.categoria.nombre),
                plataformas: juego.plataformas.map(p => p.plataforma.nombre)
            }))

            res.json(juegosFormateados)
        } catch (error) {
            console.error("Error al obtener todos los juegos:", error)
            res.status(500).json({ error: "Error al obtener todos los juegos" })
        } finally {
            await prisma.$disconnect()
        }
    })

    // GET /juegos/mejor-valorados
    router.get("/mejor-valorados", async (_req: Request, res: Response) => {
        const prisma = new PrismaClient();

        try {
            const juegos = await prisma.juego.findMany({
                take: 12,
                where: {
                    rating: {
                        not: null
                    }
                },
                orderBy: {
                    rating: 'desc'
                },
                select: {
                    titulo: true,
                    rating: true,
                    reviewJuego: true,
                    fotos: {
                        take: 1,
                        orderBy: { id: 'asc' },
                        select: {
                            url: true
                        }
                    },
                    plataformas: {
                        select: {
                            plataforma: {
                                select: {
                                    nombre: true
                                }
                            }
                        }
                    }
                }
            });

            const juegosFormateados = juegos.map(juego => ({
                nombre: juego.titulo,
                descripcion: juego.reviewJuego, // Aquí se usa reviewJuego como resumen
                imagen: juego.fotos[0]?.url ?? "",
                plataformas: juego.plataformas.map(p => p.plataforma.nombre),
                score: parseFloat((juego.rating ?? 0).toFixed(2))
            }));

            res.json(juegosFormateados);
        } catch (error) {
            console.error("Error al obtener juegos mejor valorados:", error);
            res.status(500).json({ error: "Error al obtener juegos mejor valorados" });
        } finally {
            await prisma.$disconnect();
        }
    });

    // GET /ventas-mensuales - estadísticas de ventas para AdminStats
    router.get("/ventas-mensuales", async (_req: Request, res: Response) => {
        const prisma = new PrismaClient();

        try {
            const ventas = await prisma.venta.findMany({
                select: { fechaVenta: true, total: true },
            });

            const ventasPorMes: { [mes: string]: number } = {};

            for (const venta of ventas) {
                const mes = venta.fechaVenta.toLocaleString("es-PE", {
                    month: "long",
                });
                ventasPorMes[mes] = (ventasPorMes[mes] || 0) + venta.total;
            }

            const datosMensuales = Object.entries(ventasPorMes).map(
                ([mes, total]) => ({ mes, total })
            );

            const total = datosMensuales.reduce((s, v) => s + v.total, 0);
            const promedioMensual =
                datosMensuales.length > 0
                    ? parseFloat((total / datosMensuales.length).toFixed(2))
                    : 0;
            const mesConMasVentas =
                datosMensuales.reduce((a, b) =>
                    a.total > b.total ? a : b
                )?.mes ?? "";

            res.json({
                total,
                promedioMensual,
                mesConMasVentas,
                datosMensuales,
            });
        } catch (error) {
            console.error("Error al calcular estadísticas de ventas:", error);
            res.status(500).json({ error: "Error al calcular estadísticas" });
        } finally {
            await prisma.$disconnect();
        }
    });


    // GET /slug/:slug - Obtener detalle de un juego por su slug
    router.get("/slug/:slug", async (req: Request, res: Response) => {
        const prisma = new PrismaClient();
        const { slug } = req.params;

        try {
            const juego = await prisma.juego.findUnique({
                where: { slug },
                select: {
                    id: true,
                    titulo: true,
                    descripcion: true,
                    precio: true,
                    porcentajeOferta: true,
                    slug: true,
                    fotos: {
                        orderBy: { id: 'asc' },
                        select: { url: true }
                    },
                    categorias: {
                        select: {
                            categoria: {
                                select: { nombre: true }
                            }
                        }
                    },
                    plataformas: {
                        select: {
                            plataforma: {
                                select: { nombre: true }
                            }
                        }
                    }
                }
            });

            if (!juego) {
                return res.status(404).json({ error: "Juego no encontrado" });
            }

            const juegoFormateado = {
                ...juego,
                categorias: juego.categorias.map(c => c.categoria.nombre),
                plataformas: juego.plataformas.map(p => p.plataforma.nombre)
            };

            res.json(juegoFormateado);
        } catch (error) {
            console.error("Error al obtener juego por slug:", error);
            res.status(500).json({ error: "Error al obtener el juego" });
        } finally {
            await prisma.$disconnect();
        }
    });

    // GET /juegos/admin - Obtener todos los juegos (Admin)
    router.get("/admin", async (_req: Request, res: Response) => {
        const prisma = new PrismaClient();
        try {
            const juegos = await prisma.juego.findMany({
                orderBy: { fechaLanzamiento: "desc" },
                select: {
                    id: true,
                    titulo: true,
                    precio: true,
                    porcentajeOferta: true,
                    fechaLanzamiento: true,
                    categorias: {
                        take: 1, // Solo una categoría principal (puedes cambiar esto)
                        select: {
                            categoria: {
                                select: { nombre: true }
                            }
                        }
                    }
                }
            });

            const juegosFormateados = juegos.map(j => ({
                id: j.id,
                title: j.titulo,
                price: j.precio,
                discount: j.porcentajeOferta ?? 0,
                releaseDate: j.fechaLanzamiento.toISOString().split("T")[0],
                category: j.categorias[0]?.categoria.nombre ?? "Sin categoría"
            }));

            res.json(juegosFormateados);
        } catch (error) {
            console.error("Error al obtener juegos admin:", error);
            res.status(500).json({ error: "Error al obtener juegos admin" });
        } finally {
            await prisma.$disconnect();
        }
    });

    // POST /juegos/admin - Crear nuevo juego
    router.post("/admin", async (req: Request, res: Response) => {
        const prisma = new PrismaClient();
        const { title, price, releaseDate, discount, category } = req.body;

        try {
            const nuevoJuego = await prisma.juego.create({
                data: {
                    titulo: title,
                    precio: price,
                    porcentajeOferta: discount ?? null,
                    fechaLanzamiento: new Date(releaseDate),
                    slug: title.toLowerCase().replace(/\s+/g, "-"),
                    descripcion: "Descripción pendiente",
                }
            });

            // Asignar categoría (si se provee)
            if (category) {
                const cat = await prisma.categoria.findUnique({ where: { nombre: category } });
                if (cat) {
                    await prisma.categoriaXJuego.create({
                        data: {
                            juegoId: nuevoJuego.id,
                            categoriaId: cat.id
                        }
                    });
                }
            }

            res.status(201).json(nuevoJuego);
        } catch (error) {
            console.error("Error al crear juego:", error);
            res.status(500).json({ error: "Error al crear juego" });
        } finally {
            await prisma.$disconnect();
        }
    });

    // PUT /juegos/admin/:id - Actualizar juego
    // PUT /juegos/admin/:id - Actualizar juego
    router.put("/admin/:id", async (req: Request, res: Response) => {
        const prisma = new PrismaClient();
        const { id } = req.params;
        const { title, price, releaseDate, discount, category, description } = req.body;

        try {
            const juegoActualizado = await prisma.juego.update({
                where: { id: Number(id) },
                data: {
                    titulo: title,
                    descripcion: description, // ✅ Modificamos la descripción
                    precio: price,
                    porcentajeOferta: discount ?? null,
                    fechaLanzamiento: new Date(releaseDate),
                    slug: title.toLowerCase().replace(/\s+/g, "-"),
                }
            });

            if (category) {
                const cat = await prisma.categoria.findUnique({ where: { nombre: category } });
                if (cat) {
                    await prisma.categoriaXJuego.deleteMany({ where: { juegoId: Number(id) } });
                    await prisma.categoriaXJuego.create({
                        data: {
                            juegoId: Number(id),
                            categoriaId: cat.id
                        }
                    });
                }
            }

            res.json(juegoActualizado);
        } catch (error) {
            console.error("Error al actualizar juego:", error);
            res.status(500).json({ error: "Error al actualizar juego" });
        } finally {
            await prisma.$disconnect();
        }
    });

    // DELETE /juegos/admin/:id
    router.delete("/admin/:id", async (req: Request, res: Response) => {
        const prisma = new PrismaClient();
        const { id } = req.params;
        const juegoId = Number(id);

        try {
            // Borrar relaciones hijas
            await prisma.categoriaXJuego.deleteMany({ where: { juegoId } });
            await prisma.plataformaXJuego.deleteMany({ where: { juegoId } });
            await prisma.juegoXVenta.deleteMany({ where: { juegoId } });
            await prisma.juegoXUsuario.deleteMany({ where: { juegoId } });
            await prisma.clave.deleteMany({ where: { juegoId } });
            await prisma.resena.deleteMany({ where: { juegoId } });
            await prisma.carrito.deleteMany({ where: { juegoId } });
            await prisma.foto.deleteMany({ where: { juegoId } });

            // Ahora sí, borrar el juego
            await prisma.juego.delete({ where: { id: juegoId } });

            res.status(204).send();
        } catch (error) {
            console.error("Error al eliminar juego:", error);
            res.status(500).json({ error: "Error al eliminar juego" });
        } finally {
            await prisma.$disconnect();
        }
    });


    return router
}





export default JuegosController