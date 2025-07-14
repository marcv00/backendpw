import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "mi_jwt_default_inseguro";

export interface AuthRequest extends Request {
    usuario?: { id: number; rol: string };
}

export function verificarToken(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Token no proporcionado" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: number; rol: string };
        req.usuario = { id: decoded.id, rol: decoded.rol };
        next();
    } catch (error) {
        return res.status(401).json({ error: "Token inválido" });
    }
}

export function soloAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    if (req.usuario?.rol !== "ADMIN") {
        return res.status(403).json({ error: "Acceso denegado: requiere rol ADMIN" });
    }
    next();
}
