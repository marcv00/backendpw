import { PrismaClient } from './generated/prisma';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  // ----- Seed de usuarios -----
  const usuariosPath = path.join(__dirname, '..', 'data', 'usuarios.json');
  const usuariosRaw = fs.readFileSync(usuariosPath, 'utf-8');
  const usuariosData = JSON.parse(usuariosRaw);

  await prisma.usuario.createMany({
    data: usuariosData,
    skipDuplicates: true // evita error si ya existen usuarios con el mismo correo
  });

  console.log('✅ Seed de usuarios completado');

  // ----- Seed de categorías -----
  const categoriasPath = path.join(__dirname, '..', 'data', 'categorias.json');
  const categoriasRaw = fs.readFileSync(categoriasPath, 'utf-8');
  const categoriasData = JSON.parse(categoriasRaw);

  await prisma.categoria.createMany({
    data: categoriasData,
    skipDuplicates: true // evita error si ya existen categorías con el mismo nombre
  });

  console.log('✅ Seed de categorías completado');

  // ----- Seed de plataformas -----
  const plataformasPath = path.join(__dirname, '..', 'data', 'plataformas.json');
  const plataformasRaw = fs.readFileSync(plataformasPath, 'utf-8');
  const plataformasData = JSON.parse(plataformasRaw);

  await prisma.plataforma.createMany({
    data: plataformasData,
    skipDuplicates: true // evita error si ya existen plataformas con el mismo nombre
  });

  console.log('✅ Seed de plataformas completado');

    // ----- Seed de juegos -----
  const juegosPath = path.join(__dirname, '..', 'data', 'juegos.json');
  const juegosRaw = fs.readFileSync(juegosPath, 'utf-8');
  const juegosData = JSON.parse(juegosRaw);

  await prisma.juego.createMany({
    data: juegosData,
    skipDuplicates: true // evita error si ya existen juegos con mismo título
  });

  console.log('✅ Seed de juegos completado');

  // ----- Seed de relaciones categoriaXJuego -----
  const categoriasXJuegosPath = path.join(__dirname, '..', 'data', 'categoriasXjuegos.json');
  const categoriasXJuegosRaw = fs.readFileSync(categoriasXJuegosPath, 'utf-8');
  const categoriasXJuegosData = JSON.parse(categoriasXJuegosRaw);

  for (const item of categoriasXJuegosData) {
    const juego = await prisma.juego.findUnique({
      where: { titulo: item.juegoTitulo },
    });

    if (!juego) {
      console.warn(`❌ Juego no encontrado: ${item.juegoTitulo}`);
      continue;
    }

    for (const categoriaNombre of item.categorias) {
      const categoria = await prisma.categoria.findUnique({
        where: { nombre: categoriaNombre },
      });

      if (!categoria) {
        console.warn(`❌ Categoria no encontrada: ${categoriaNombre}`);
        continue;
      }

      await prisma.categoriaXJuego.create({
        data: {
          juegoId: juego.id,
          categoriaId: categoria.id,
        },
      });
    }
  }

  console.log('✅ Seed de relaciones categoriaXJuego completado');

  // ----- Seed de relaciones plataformaXJuego -----
  const plataformasXJuegosPath = path.join(__dirname, '..', 'data', 'plataformasXjuegos.json');
  const plataformasXJuegosRaw = fs.readFileSync(plataformasXJuegosPath, 'utf-8');
  const plataformasXJuegosData = JSON.parse(plataformasXJuegosRaw);

  for (const item of plataformasXJuegosData) {
    const juego = await prisma.juego.findUnique({
      where: { titulo: item.tituloJuego },
    });

    if (!juego) {
      console.warn(`❌ Juego no encontrado: ${item.tituloJuego}`);
      continue;
    }

    for (const plataformaNombre of item.plataformas) {
      const plataforma = await prisma.plataforma.findUnique({
        where: { nombre: plataformaNombre },
      });

      if (!plataforma) {
        console.warn(`❌ Plataforma no encontrada: ${plataformaNombre}`);
        continue;
      }

      await prisma.plataformaXJuego.create({
        data: {
          juegoId: juego.id,
          plataformaId: plataforma.id,
        },
      });
    }
  }

  console.log('✅ Seed de relaciones plataformaXJuego completado');


  // ----- Seed de CatNoticias -----
  const catNoticiaPath = path.join(__dirname, '..', 'data', 'catNoticias.json');
  const catNoticiaRaw = fs.readFileSync(catNoticiaPath, 'utf-8');
  const catNoticiaData = JSON.parse(catNoticiaRaw);

  for (const item of catNoticiaData) {
    await prisma.catNoticia.createMany({
        data: item,
        skipDuplicates: true // evita error si ya existen categorías de noticias con el mismo nombre
    });
  }

  console.log('✅ Seed de CatNoticia completado');


  // ----- Seed de Fotos -----
  const fotosPath = path.join(__dirname, '..', 'data', 'fotos.json');
  const fotosRaw = fs.readFileSync(fotosPath, 'utf-8');
  const fotosData = JSON.parse(fotosRaw);

  for (const item of fotosData) {
    await prisma.foto.create({
      data: item,
    });
  }
  console.log('✅ Seed de fotos completado');

  // ----- Seed de Noticias -----
  const noticiasPath = path.join(__dirname, '..', 'data', 'noticias.json');
  const noticiasRaw = fs.readFileSync(noticiasPath, 'utf-8');
  const noticiasData = JSON.parse(noticiasRaw);

  for (const item of noticiasData) {
    await prisma.noticia.create({
      data: item,
    });
  }
  console.log('✅ Seed de noticias completado');

  // ----- Seed de relaciones catNoticiaXNoticia -----
  const catNoticiaXNoticiaPath = path.join(__dirname, '..', 'data', 'catNoticiasXnoticias.json');
  const catNoticiaXNoticiaRaw = fs.readFileSync(catNoticiaXNoticiaPath, 'utf-8');
  const catNoticiaXNoticiaData = JSON.parse(catNoticiaXNoticiaRaw);

  for (const item of catNoticiaXNoticiaData) {
    const noticia = await prisma.noticia.findUnique({
      where: { titulo: item.noticiaTitulo },
    });

    if (!noticia) {
      console.warn(`❌ Noticia no encontrada: ${item.noticiaTitulo}`);
      continue;
    }

    for (const categoriaNombre of item.categorias) {
      const catNoticia = await prisma.catNoticia.findUnique({
        where: { nombre: categoriaNombre },
      });

      if (!catNoticia) {
        console.warn(`❌ Categoria de noticia no encontrada: ${categoriaNombre}`);
        continue;
      }

      await prisma.catNoticiaXNoticia.create({
        data: {
          noticiaId: noticia.id,
          catNoticiaId: catNoticia.id,
        },
      });
    }
  }

  console.log('✅ Seed de relaciones catNoticiaXNoticia completado');


  // ----- Seed de resenas -----
  const resenasPath = path.join(__dirname, '..', 'data', 'resenas.json');
  const resenasRaw = fs.readFileSync(resenasPath, 'utf-8');
  const resenasData = JSON.parse(resenasRaw);

  for (const item of resenasData) {
    const usuario = await prisma.usuario.findUnique({
      where: { correo: item.usuarioCorreo },
    });

    const juego = await prisma.juego.findUnique({
      where: { titulo: item.juegoTitulo },
    });

    if (!usuario || !juego) {
      console.warn(`❌ No encontrado: ${item.usuarioCorreo} o ${item.juegoTitulo}`);
      continue;
    }

    await prisma.resena.create({
      data: {
        texto: item.texto,
        puntuacion: item.puntuacion,
        fechaCreacion: new Date(item.fechaCreacion),
        usuarioId: usuario.id,
        juegoId: juego.id,
      },
    });

  }
  
  console.log('✅ Seed de resenas completado');


  // ----- Seed de ventas + juegoXVenta -----

  const ventasPath = path.join(__dirname, '..', 'data', 'ventas.json')
  const ventasRaw = fs.readFileSync(ventasPath, 'utf-8')
  const ventas = JSON.parse(ventasRaw)

  for (const venta of ventas) {
    const usuario = await prisma.usuario.findUnique({
      where: { correo: venta.correoUsuario }
    })

    if (!usuario) {
      console.warn(`Usuario no encontrado: ${venta.correoUsuario}`)
      continue
    }

    // Crear la venta base
    const nuevaVenta = await prisma.venta.create({
      data: {
        usuarioId: usuario.id,
        total: venta.total,
        fechaVenta: new Date(venta.fechaVenta)
      }
    })

    // Buscar los juegos por título
    const juegos = await prisma.juego.findMany({
      where: {
        titulo: { in: venta.juegos }
      }
    })

    if (juegos.length !== venta.juegos.length) {
      console.warn(`Algunos juegos no se encontraron para la venta de ${venta.correoUsuario}`)
    }

    // Relacionar cada juego con la venta
    await prisma.juegoXVenta.createMany({
      data: juegos.map((juego: { id: number }) => ({
        juegoId: juego.id,
        ventaId: nuevaVenta.id
      })),
      skipDuplicates: true
    })
  }

  console.log('✅ Seed de ventas + juegoXventa completado.')

  // ----- Seed de claves -----
  const clavesPath = path.join(__dirname, '..', 'data', 'claves.json')
  const clavesRaw = fs.readFileSync(clavesPath, 'utf-8')
  const claves = JSON.parse(clavesRaw)

  for (const clave of claves) {
    const usuario = await prisma.usuario.findUnique({
      where: { correo: clave.correoUsuario }
    })

    if (!usuario) {
      console.warn(`Usuario no encontrado: ${clave.correoUsuario}`)
      continue
    }

    const juego = await prisma.juego.findUnique({
      where: { titulo: clave.juegoTitulo }
    })

    if (!juego) {
      console.warn(`Juego no encontrado: ${clave.juegoTitulo}`)
      continue
    }

    const venta = await prisma.venta.findFirst({
      where: {
        usuarioId: usuario.id,
        juegos: {
          some: {
            juegoId: juego.id
          }
        }
      },
      orderBy: {
        fechaVenta: 'asc'
      }
    })

    if (!venta) {
      console.warn(`Venta no encontrada para ${clave.correoUsuario} y ${clave.juegoTitulo}`)
      continue
    }

    await prisma.clave.create({
      data: {
        texto: clave.texto,
        usada: clave.usada,
        juegoId: juego.id,
        ventaId: venta.id
      }
    })
  }

  console.log('✅ Seed de claves completado.')


  // ----- Seed de relaciones juegoXUsuario -----
  const pathRelaciones = path.join(__dirname, '..', 'data', 'juegosXusuarios.json')
  const relacionesRaw = fs.readFileSync(pathRelaciones, 'utf-8')
  const relaciones = JSON.parse(relacionesRaw)

  for (const relacion of relaciones) {
    const usuario = await prisma.usuario.findUnique({
      where: { correo: relacion.correoUsuario }
    })

    if (!usuario) {
      console.warn(`⚠ Usuario no encontrado: ${relacion.correoUsuario}`)
      continue
    }

    const juego = await prisma.juego.findUnique({
      where: { titulo: relacion.juegoTitulo }
    })

    if (!juego) {
      console.warn(`⚠ Juego no encontrado: ${relacion.juegoTitulo}`)
      continue
    }

    await prisma.juegoXUsuario.create({
      data: {
        usuarioId: usuario.id,
        juegoId: juego.id
      }
    })
  }

  console.log('✅ Seed de JuegoXUsuario completado.')

  // ----- Seed de relaciones Carrito -----
  const carritoPath = path.join(__dirname, '..', 'data', 'carrito.json')
  const carritoRaw = fs.readFileSync(carritoPath, 'utf-8')
  const carritoData = JSON.parse(carritoRaw)

  await prisma.carrito.createMany({
    data: carritoData,
    skipDuplicates: true
  })

  console.log('✅ Seed de relaciones Carrito completado.')

}



main()
  .catch((error) => {
    console.error('❌ Error durante seed de la db:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
