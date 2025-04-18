import { usersService } from "../services/index.js";
import { createHash, passwordValidation } from "../utils/index.js";
import jwt from 'jsonwebtoken';
import UserDTO from '../dto/User.dto.js';

const register = async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;
        if (!first_name || !last_name || !email || !password) return res.status(400).send({ status: "error", error: "Incomplete values" });
        const exists = await usersService.getUserByEmail(email);
        if (exists) return res.status(400).send({ status: "error", error: "User already exists" });
        const hashedPassword = await createHash(password);
        const user = {
            first_name,
            last_name,
            email,
            password: hashedPassword
        }
        let result = await usersService.create(user);
        res.send({ status: "success", payload: result._id });
    } catch (error) {
        req.logger.error(`Error: ${error}`)
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).send({ status: "error", error: "Incomplete values" });
        let user = await usersService.getUserByEmail(email);
        if(!user) return res.status(404).send({status:"error",error:"User doesn't exist"});
        const isValidPassword = await passwordValidation(user,password);
        if(!isValidPassword) return res.status(400).send({status:"error",error:"Incorrect password"});
        user.last_connection = "online"
        await usersService.update(user._id, user)
        const userDto = UserDTO.getUserTokenFrom(user);
        const token = jwt.sign(userDto,'tokenSecretJWT',{expiresIn:"1h"});
        res.cookie('coderCookie',token,{maxAge:3600000}).send({status:"success",message:"Logged in"})
    } catch (error) {
        req.logger.error(`Error: ${error}`)
    }
}

const logout = async (req, res) => {
    try {
        const cookie = req.cookies['coderCookie']
        let user = jwt.verify(cookie,'tokenSecretJWT');
        user = await usersService.getBy({email: user.email})
        user.last_connection = new Date().toUTCString()
        await usersService.update(user._id, user)
        res.clearCookie('coderCookie').send({msg:'Logout correct'})
    } catch (error) {
        req.logger.error(`Error: ${error}`)
    }
}

const current = async(req,res) =>{
    try {
        const cookie = req.cookies['coderCookie']
        if (!cookie) return res.send({status:"unauthorized"})
        const user = jwt.verify(cookie,'tokenSecretJWT');
        if(user) return res.send({status:"success",payload:user})
    } catch (error) {
        req.logger.error(`Error: ${error}`)
    }
}

const unprotectedLogin  = async(req,res) =>{
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).send({ status: "error", error: "Incomplete values" });
        const user = await usersService.getUserByEmail(email);
        if(!user) return res.status(404).send({status:"error",error:"User doesn't exist"});
        const isValidPassword = await passwordValidation(user,password);
        if(!isValidPassword) return res.status(400).send({status:"error",error:"Incorrect password"});
        const userDto = UserDTO.getUserTokenFrom(user);
        const token = jwt.sign(userDto,'tokenSecretJWT',{expiresIn:"1h"});
        res.cookie('unprotectedCookie',token,{maxAge:3600000}).send({status:"success",message:"Unprotected Logged in"})
    } catch (error) {
        req.logger.error(`Error: ${error}`)
    }
}
const unprotectedCurrent = async(req,res)=>{
    try {
        const cookie = req.cookies['unprotectedCookie']
        const user = jwt.verify(cookie,'tokenSecretJWT');
        if(user) return res.send({status:"success",payload:user})
    } catch (error) {
        req.logger.error(`Error: ${error}`)
    }
}
export default {
    current,
    login,
    logout,
    register,
    current,
    unprotectedLogin,
    unprotectedCurrent
}