import { Router} from 'express'

const router = Router()

router.get('/', async(req, res)=>{
    try {
        console.log(inexistentVariable)
    } catch (error) {
        req.logger.error(`Testeando error: ${error}`)
    }
})

export default router