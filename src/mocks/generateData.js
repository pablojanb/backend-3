import { createUsers } from "./users.js"
import { createPets } from "./pets.js"
import petModel from "../dao/models/Pet.js"
import userModel from "../dao/models/User.js"

export const generateData = async (req,res)=>{
    try {
        const {cantPets, cantUsers} = req.body
        const users = await createUsers(cantUsers)
        const pets = createPets(cantPets)
        await petModel.insertMany(pets)
        await userModel.insertMany(users)
        res.send({msg: "Data generada"})
    } catch (error) {
        req.logger.error(`Error al generar data: ${error}`)
    }
}