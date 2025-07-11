// import express, { Request, Response } from "express"
// import { PrismaClient, Todo } from "../generated/prisma"

// const UsuariosController = () => {
//     const router = express.Router()

//     // /usuarios/login
//     router.post("/login", async (req : Request, resp : Response) => {
//         const prisma = new PrismaClient()
//         const requestData = req.body

//         const username = requestData.username
//         const password = requestData.password

//         if (username == undefined || password == undefined) {
//             resp.status(400).json({
//                 msg : "Debe enviar username y password."
//             })
//             return
//         }

//         const usuario = await prisma.usuario.findFirst({
//             omit : {
//                 password : true
//             },
//             where : {
//                 username : username,
//                 password : password
//             }
//         })

//         if (usuario == undefined) {
//             // Error en el login
//             resp.status(400).json({
//                 msg : "Login incorrecto."
//             })
//             return
//         }

//         resp.json({
//             msg : "",
//             usuario : usuario
//         })
//     })

//     return router
// }

// export default UsuariosController