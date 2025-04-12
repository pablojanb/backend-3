import PetDTO from "../dto/Pet.dto.js";
import { petsService } from "../services/index.js"
import __dirname from "../utils/index.js";

const getAllPets = async(req,res)=>{
    try {
        const pets = await petsService.getAll();
        res.send({status:"success",payload:pets})
    } catch (error) {
        req.logger.error(`Error: ${error}`)
    }
}

const createPet = async(req,res)=> {
    try {
        const {name,specie,birthDate} = req.body;
        if(!name||!specie||!birthDate) return res.status(400).send({status:"error",error:"Incomplete values"})
        const pet = PetDTO.getPetInputFrom({name,specie,birthDate});
        const result = await petsService.create(pet);
        res.send({status:"success",payload:result})
    } catch (error) {
        req.logger.error(`Error: ${error}`)
    }
}

const updatePet = async(req,res) =>{
    try {
        const petUpdateBody = req.body;
        const petId = req.params.pid;
        const result = await petsService.update(petId,petUpdateBody);
        res.send({status:"success",message:"pet updated"})
    } catch (error) {
        req.logger.error(`Error: ${error}`)
    }
}

const deletePet = async(req,res)=> {
    try {
        const petId = req.params.pid;
        const result = await petsService.delete(petId);
        res.send({status:"success",message:"pet deleted"});
    } catch (error) {
        req.logger.error(`Error: ${error}`)
    }
}

const createPetWithImage = async(req,res) =>{
    try {
        const file = req.file;
        const {name,specie,birthDate} = req.body;
        if(!name||!specie||!birthDate) return res.status(400).send({status:"error",error:"Incomplete values"})
        const pet = PetDTO.getPetInputFrom({
            name,
            specie,
            birthDate,
            image:`${__dirname}/../public/pets/${file.filename}`
        });
        const result = await petsService.create(pet);
        res.send({status:"success",payload:result})
    } catch (error) {
        req.logger.error(`Error: ${error}`)
    }
}

export default {
    getAllPets,
    createPet,
    updatePet,
    deletePet,
    createPetWithImage
}