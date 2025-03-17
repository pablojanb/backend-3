import { createUsers } from "./users.js"
import { createPets } from "./pets.js"
import petModel from "../dao/models/Pet.js"
import userModel from "../dao/models/User.js"
import { errorEnums } from "../errors/errorsEnum.js"
import { errorGenerateData } from "../errors/errorGenerateData.js"
import { createError } from "../errors/createError.js"

export const generateData = async (req,res)=>{
    try {
        const {pets, users} = req.body
        if (!pets || !users) return createError('Parametros', 'Parametro no puede ser null', errorGenerateData(req.body), errorEnums.INVALID_TYPES)
        const cantUsers = await createUsers(users)
        const cantPets = createPets(pets)
        await petModel.insertMany(cantPets)
        await userModel.insertMany(cantUsers)
        res.send({msg: "Data generada"})
    } catch (error) {
        req.logger.error(`Error al generar data: ${error}`)
    }
}