// import express, { Request, Response } from "express"
// import { PrismaClient, Todo } from "../generated/prisma"

// const CategoriasController = () => {
//     const router = express.Router()

//     router.get("/", async (req : Request, resp : Response) => {
//         const prisma = new PrismaClient()
//         const usuarioId = req.headers["usuarioid"]

//         if (usuarioId == undefined) {
//             resp.status(400).json({
//                 msg : "Es necesario que envies un codigo de usuario."
//             })
//             return
//         }

//         const usuario = await prisma.usuario.findFirst({
//             relationLoadStrategy : "join",
//             where : {
//                 id : parseInt(usuarioId.toString())
//             },
//             include : {
//                 categorias : true
//             }
//         })

//         if (usuario == undefined) {
//             resp.status(400).json({
//                 msg : "Debe enviar un codigo de usuario que exista."
//             })
//             return
//         }

//         resp.json(usuario.categorias)
//     })

//     return router
// }

// export default CategoriasController