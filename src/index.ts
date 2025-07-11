import express, { Request, Response } from "express"
import dotenv from "dotenv"
import bodyParser from "body-parser"
import cors from "cors"
import PlataformasController from "./controllers/PlataformasController"
import JuegosController from "./controllers/JuegosController"
import UsuariosController from "./controllers/UsuariosController"
import CategoriasController from "./controllers/CategoriasController"
import NoticiasController from "./controllers/NoticiasController"
import ResenasController from "./controllers/ResenasController"

dotenv.config()
const app = express()

// Configuracion del servidor HTTP para recibir peticiones
// por el payload (cuerpo)y convertirlos en objetos js/ts
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended : true
}))
app.use(cors({
    origin : process.env.FRONTEND_URL,
    methods : ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["usuarioid", "content-type"],
    credentials : true
})) // Configurando cors

app.use(express.static("assets"))

const PORT = process.env.PORT


app.get("/", (req : Request, resp : Response) => {
    resp.send("Endpoint raiz")
})


app.use("/plataformas", PlataformasController())
app.use("/juegos", JuegosController())
app.use("/usuarios", UsuariosController())
app.use("/categorias", CategoriasController())
app.use("/noticias", NoticiasController())
app.use("/resenas", ResenasController())


app.listen(PORT, () => {
    console.log(`Se inicio servidor en puerto ${PORT}`)
})