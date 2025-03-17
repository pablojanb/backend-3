export const createError = (name, message, cause, code)=>{
    const error = new Error(message, {cause})
    error.code = code
    error.name = name
    throw error
}