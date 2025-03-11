export const handleErrors = (error, _, res, __)=>{
    res.send({error: 'error interno del servidor'})
}