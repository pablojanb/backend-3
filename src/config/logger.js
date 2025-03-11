import winston from "winston"
import options from "../config/commander.js"

const customLevels = {
    levels: {fatal: 0, error: 1, warning: 2,info: 3, http: 4,debug: 5}
}

const logger = winston.createLogger({
    levels: customLevels.levels,
    transports: [
        new winston.transports.Console({
            level: "info",
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({
            filename: "./src/error.log",
            level: "error",
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.simple()
            )
        })
    ]
})

if (options.modo === 'dev') {

    const transportConsoleDev = new winston.transports.Console({
        level: "debug",
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.simple()
        )
    })

    logger.add(transportConsoleDev)
}

export const addLogger = (req, res, next)=>{
    req.logger = logger
    next()
}