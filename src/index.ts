import express, { Request, Response } from "express"
import dotenv from "dotenv"
import bodyParser from "body-parser"
import cors from "cors"
import TodosController from "./controllers/TodosController"
import UsuariosController from "./controllers/UsuariosController"
import CategoriasController from "./controllers/CategoriasController"

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

// Configuracion entidad Todo
app.use("/todos", TodosController())
app.use("/usuarios", UsuariosController())
app.use("/categorias", CategoriasController())



app.listen(PORT, () => {
    console.log(`Se inicio servidor en puerto ${PORT}`)
})