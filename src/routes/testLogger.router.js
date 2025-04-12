import { Router} from 'express'

const router = Router()

router.get('/', async(req, res, next)=>{
    try {
        console.log(inexistentVariable)
    } catch (error) {
        req.logger.error(`Testeando error: ${error}`)
        return next(error)
    }
})

export default router