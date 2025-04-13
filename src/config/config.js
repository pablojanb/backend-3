process.loadEnvFile('./.env')

export const config = {
    PORT: process.env.PORT,
    MONGO_URL: process.env.MONGO_URL
}