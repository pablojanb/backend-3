export const handleErrors = (error, _, res, __)=>{
    if (error.code) {
        res.status(error.code).send({error: error.message})
    }
    res.status(500).send({error: 'error interno del servidor'})
}