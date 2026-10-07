import type { Request, Response, NextFunction } from 'express';

declare module 'express-serve-static-core' {
    interface Request {
        usuario?: {
            id: number;
            [key: string]: any;
        };
        simulacao?: {
            owner_id: number;
            [key: string]: any;
        };
    }
}

export const verificarProprietarioSimulacao = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const usuarioId = req.usuario?.id; 
        const simulacao = req.simulacao; 

        if (!simulacao) {
            res.status(404).json({ error: "Not Found", message: "Simulação não encontrada." });
            return;
        }

        if (simulacao.owner_id !== usuarioId) {
            res.status(403).json({
                error: "Forbidden",
                message: "Acesso negado. Apenas a proprietária pode iniciar, pausar ou encerrar esta simulação."
            });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
};