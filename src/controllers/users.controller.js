import { usersService } from "../services/index.js"
import __dirname from "../utils/index.js";

const getAllUsers = async(req,res)=>{
    try {
        const users = await usersService.getAll();
        res.send({status:"success",payload:users})
    } catch (error) {
        req.logger.error(`Error: ${error}`)
    }
}

const getUser = async(req,res)=> {
    try {
        const userId = req.params.uid;
        const user = await usersService.getUserById(userId);
        if(!user) return res.status(404).send({status:"error",error:"User not found"})
        res.send({status:"success",payload:user})
    } catch (error) {
        req.logger.error(`Error: ${error}`)
    }
}

const updateUser =async(req,res)=>{
    try {
        const updateBody = req.body;
        const userId = req.params.uid;
        const user = await usersService.getUserById(userId);
        if(!user) return res.status(404).send({status:"error", error:"User not found"})
        const result = await usersService.update(userId,updateBody);
        res.send({status:"success",message:"User updated"})
    } catch (error) {
        req.logger.error(`Error: ${error}`)
    }
}

const deleteUser = async(req,res) =>{
    try {
        const userId = req.params.uid;
        const result = await usersService.getUserById(userId);
        res.send({status:"success",message:"User deleted"})
    } catch (error) {
        req.logger.error(`Error: ${error}`)
    }
}

const uploadDocument = async(req,res) =>{
    try {
        const file = req.file;
        const {uid} = req.params
        let user = await usersService.getUserById(uid);
        user.documents.push({
            name: `${file.filename}`,
            reference: `${__dirname}/../public/documents/${file.filename}`
        })
        await usersService.update(uid,user);
        res.send({status:"success",message:"document uploaded"})
    } catch (error) {
        req.logger.error(`Error: ${error}`)
    }
}

export default {
    deleteUser,
    getAllUsers,
    getUser,
    updateUser,
    uploadDocument
}