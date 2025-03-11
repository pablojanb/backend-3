import {fakerES_MX as faker} from '@faker-js/faker'


const generarFechaRandom = (fechaInicio, fechaFin) => {
    const inicio = fechaInicio.getTime()
    const fin = fechaFin.getTime()
    const fechaAleatoria = new Date(inicio + Math.random() * (fin - inicio))
    
    return fechaAleatoria
  }
  
  const fechaInicio = new Date('2020-01-01');
  const fechaFin = new Date()

export const createPets = (num)=>{
    const pets = []
    for (let i = 0; i < num; i++) {
        const randomNum = Math.floor(Math.random() * 2) + 1
        const newPet = {
            _id: faker.database.mongodbObjectId(),
            name: faker.animal.petName(),
            specie: randomNum === 1 ? 'dog' : 'cat',
            birthDate: generarFechaRandom(fechaInicio, fechaFin)
        }
        pets.push(newPet)
    }
    return pets
}

export const mockPets = (req,res)=>{
    const {num} = req.query
    const pets = createPets(num)
    res.send({pets})
}