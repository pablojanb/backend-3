import { Router } from 'express'
import { mockPets } from '../mocks/pets.js'
import { mockUsers } from '../mocks/users.js'
import { generateData } from '../mocks/generateData.js'

const router = Router();

router.get('/mockingpets', mockPets)
router.get('/mockingusers', mockUsers)
router.post('/generatedata', generateData)

export default router