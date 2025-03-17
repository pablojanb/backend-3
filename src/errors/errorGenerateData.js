export const errorGenerateData = (args)=>{
    const {pets, users} = args
    return `
                Error al generar data:
                Se esperaba pets (type string) | Se recibio ${pets}
                Se esperaba users (type string) | Se recibio ${users}
            `
}