import  type { Request, Response, NextFunction } from 'express';

export const manipuladorGlobalErros = (err: any, req: Request, res: Response, next: NextFunction): void => {
    const erroSanitizado = { ...err, message: err.message, stack: err.stack };

    if (erroSanitizado.instrucaoEstrategica) {
        erroSanitizado.instrucaoEstrategica = "[CONTEÚDO PROTEGIDO]";
    }

    let logString = JSON.stringify(erroSanitizado, Object.getOwnPropertyNames(err), 2);
    logString = logString.replace(
        /("instrucaoEstrategica"\s*:\s*)"[^"]*"/g,
        '$1"[CONTEÚDO PROTEGIDO]"'
    );

    console.error(`\n[Erro de Execução] ${req.method} ${req.originalUrl}`);
    console.error(JSON.parse(logString));

    res.status(500).json({
        error: "Internal Server Error",
        type: err.name || "Error",
        message: "Ocorreu um erro interno no servidor."
    });
};