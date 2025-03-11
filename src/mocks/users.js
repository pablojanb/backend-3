import {fakerES_MX as faker} from '@faker-js/faker'
import { createHash } from '../utils/index.js'

export const createUsers = async (num)=>{
    const users = []
    for (let i = 0; i < num; i++) {
        const randomNum = Math.floor(Math.random() * 2) + 1
        const first_name = faker.person.firstName()
        const last_name = faker.person.lastName()
        const newUser = {
            _id: faker.database.mongodbObjectId(),
            first_name,
            last_name,
            email: faker.internet.email({ firstName: first_name, lastName: last_name }),
            password: await createHash("coder123"),
            role: randomNum === 1 ? 'user' : 'admin'
        }
        users.push(newUser)
    }
    return users
}

export const mockUsers = async (req,res)=>{
    const {num} = req.query
    const users = await createUsers(num)
    res.send({users})
}