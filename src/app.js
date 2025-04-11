import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

import testsRouter from './routes/testLogger.router.js';
import usersRouter from './routes/users.router.js';
import mockingRouter from './routes/mocks.router.js'
import petsRouter from './routes/pets.router.js';
import adoptionsRouter from './routes/adoption.router.js';
import sessionsRouter from './routes/sessions.router.js';
import { handleErrors } from './middleware/handleErrors.js';
import { addLogger } from './config/logger.js';
import { config } from './config/config.js';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express'

const app = express();
const PORT = config.PORT||8080;
const connection = mongoose.connect(config.MONGO_URL)

app.use(express.json());
app.use(cookieParser());

app.use(addLogger)
app.use('/api/users',usersRouter);
app.use('/api/pets',petsRouter);
app.use('/api/adoptions',adoptionsRouter);
app.use('/api/sessions',sessionsRouter);
app.use('/api/mocks', mockingRouter);
app.use('/api/loggerTest', testsRouter);

const swaggerOpts = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Api Adopt Me",
            version: "1.0.0",
            description: "APIrest para applicación de adopción de mascotas",
        },
        servers: [
            {
                url: 'http://localhost:8080',
                description: 'Produccion'
            },
            {
                url: 'http://localhost:9090',
                description: 'Desarrollo'
            },
            {
                url: 'http://localhost:8081',
                description: 'Testing'
            }
        ]
    },
    apis: ["./src/docs/*.yaml"]
}

const spec = swaggerJSDoc(swaggerOpts)

app.use('/swagger', swaggerUi.serve,swaggerUi.setup(spec))

app.use(handleErrors)

app.listen(PORT,()=>console.log(`Listening on ${PORT}`))