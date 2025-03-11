const createError = (name, message, cause, code)=>{
    const error = new Error(message, {cause})
    error.code = code
    error.cause = name
    throw error
}