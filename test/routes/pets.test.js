import supertest from 'supertest'
import {describe, it} from 'mocha'
import {expect} from 'chai'
import mongoose from 'mongoose'
import petModel from '../../src/dao/models/Pet.js'
import { config } from '../../src/config/config.js'
import fs from 'fs'

const requester = supertest('http://localhost:9090')
mongoose.connect(config.MONGO_URL)

describe('Tests sobre el router /api/pets', function(){
    this.timeout(5000)
    describe('Método GET', ()=>{
        it('Debe devolver un status 200', async()=>{
            const response = await requester.get('/api/pets')
            const {statusCode} = response
            expect(statusCode).to.be.eq(200)
        })
        it('Debe devolver un objeto con propiedades status (succes) y payload (array)', async()=>{
            const response = await requester.get('/api/pets')
            const {body} = response
            expect(body).to.have.property('status').and.to.be.eq('success')
            expect(body).to.have.property('payload')
            body.payload && expect(Array.isArray(body.payload)).to.be.true
        })
        it('El array de la propiedad payload debe devolver objetos de mascotas (con propiedades: _id, name, specie, birthDate e image)', async()=>{
            const response = await requester.get('/api/pets')
            const {body} = response
            if (body.payload) {
                body.payload.forEach(mascota => {
                    expect(mascota).to.have.property('_id')
                    expect(mascota).to.have.property('name')
                    expect(mascota).to.have.property('specie')
                    expect(mascota).to.have.property('birthDate')
                    expect(mascota).to.have.property('image')
                });
            }
        })
    })
    describe('Método POST', ()=>{
        afterEach(async ()=>{
            await petModel.deleteMany({specie:"test"})
        })
        it('Debe devolver un status 200', async()=>{
            const petTest = {
                name: "Kitty",
                specie: "test",
                birthDate: "2024-04-12"
              }
            const response = await requester.post('/api/pets').send(petTest)
            const {statusCode} = response
            expect(statusCode).to.be.eq(200)
        })
        it('Debe devolver un objeto con propiedades status (succes) y payload (objeto) y guardar la mascota en DB', async()=>{
            const petTest = {
                name: "Kitty",
                specie: "test",
                birthDate: "2024-04-12"
            }
            const response = await requester.post('/api/pets').send(petTest)
            const {body} = response
            expect(body).to.have.property('status').and.to.be.eq('success')
            expect(body).to.have.property('payload')
            body.payload && expect(typeof(body.payload)).to.be.eq('object')
            const petDB = await petModel.findOne({specie: 'test'})
            expect(petDB).to.have.property('_id')
            expect(petDB).to.have.property('name')
            expect(petDB).to.have.property('specie')
            expect(petDB).to.have.property('birthDate')
            expect(petDB).to.have.property('image')
        })
        it('El objeto de la propiedad payload debe ser una mascota (con propiedades: _id, name, specie, birthDate e image)', async()=>{
            const petTest = {
                name: "Kitty",
                specie: "test",
                birthDate: "2024-04-12"
            }
            const response = await requester.post('/api/pets').send(petTest)
            const {body} = response
            expect(body.payload).to.have.property('_id')
            expect(body.payload).to.have.property('name')
            expect(body.payload).to.have.property('specie')
            expect(body.payload).to.have.property('birthDate')
            expect(body.payload).to.have.property('image')
        })
        it('Si faltan enviar propiedades de la mascota debe devolver un status 400', async()=>{
            const petTest = {
                name: "Kitty",
                birthDate: "2024-04-12"
            }
            const response = await requester.post('/api/pets').send(petTest)
            const {statusCode} = response
            expect(statusCode).to.be.eq(400)
        })
        it('Si faltan enviar propiedades de la mascota debe devolver un objeto con las propiedades status(error) y error (Incomplete values)', async()=>{
            const petTest = {
                name: "Kitty",
                birthDate: "2024-04-12"
            }
            const response = await requester.post('/api/pets').send(petTest)
            const {body} = response
            expect(body).to.have.property('status').and.to.be.eq('error')
            expect(body).to.have.property('error').and.to.be.eq('Incomplete values')
        })
    })
    describe('Método PUT (/api/pets/:pid)', ()=>{
        let petId
        before(async()=>{
            const petTest = {
                name: "Kitty",
                specie: "test",
                birthDate: "2024-04-12"
            }
            const response = await requester.post('/api/pets').send(petTest)
            const {body} = response
            petId = body.payload._id
        })
        after(async ()=>{
            await petModel.deleteMany({specie:"test"})
        })
        it('Debe devolver status 200', async()=>{
            const updatedBody = {
                name: "Rocco",
                specie: "test",
                birthDate: "2024-04-12"
            }
            const response = await requester.put(`/api/pets/${petId}`).send(updatedBody)
            const {statusCode} = response
            expect(statusCode).to.be.eq(200)
        })
        it('Debe devolver un objeto con propiedades status (succes) y message (pet updated) y actualizar la mascota en DB', async()=>{
            const updatedBody = {
                name: "Firu",
                specie: "test",
                birthDate: "2024-04-12"
            }
            const response = await requester.put(`/api/pets/${petId}`).send(updatedBody)
            const {body} = response
            expect(body).to.have.property('status').and.to.be.eq('success')
            expect(body).to.have.property('message').and.to.be.eq('pet updated')
            const petDB = await petModel.findOne({_id: petId})
            expect(petDB).to.have.property('_id')
            expect(petDB).to.have.property('name').and.to.be.eq(updatedBody.name)
            expect(petDB).to.have.property('specie').and.to.be.eq(updatedBody.specie)
            expect(petDB).to.have.property('birthDate')
            expect(petDB).to.have.property('image')
        })
    })
    describe('Método DELETE (/api/pets/:pid)', ()=>{
        let petId
        beforeEach(async()=>{
            const petTest = {
                name: "Kitty",
                specie: "test",
                birthDate: "2024-04-12"
            }
            const response = await requester.post('/api/pets').send(petTest)
            const {body} = response
            petId = body.payload._id
        })
        it('Debe devolver status 200', async()=>{
            const response = await requester.delete(`/api/pets/${petId}`)
            const {statusCode} = response
            expect(statusCode).to.be.eq(200)
        })
        it('Debe devolver un objeto con propiedades status (succes) y message (pet deleted) y eliminar la mascota en DB', async()=>{
            const response = await requester.delete(`/api/pets/${petId}`)
            const {body} = response
            expect(body).to.have.property('status').and.to.be.eq('success')
            expect(body).to.have.property('message').and.to.be.eq('pet deleted')
            const petDB = await petModel.findOne({_id: petId})
            expect(petDB).to.be.null
        })
    })
    describe('Método POST (/api/pets/withimage)', ()=>{
        afterEach(async()=>{
            await petModel.deleteMany({name: "test"})
        })
        it("Al enviar datos de una mascota con imagen debe devolver un status 200", async()=>{
            const newPet = {
                name:"test",
                specie:"dog",
                birthDate: '2022-03-01'
            }
            
            const response = await requester.post("/api/pets/withImage")
                                            .field("name", newPet.name)
                                            .field("specie", newPet.specie)
                                            .field("birthDate", newPet.birthDate)
                                            .attach("image", "./test/img-test.webp")

            expect(response.statusCode).to.be.eq(200)
            fs.unlinkSync(response.body.payload.image)
        })
        it("Al enviar datos de una mascota con imagen debe devolver un objeto con propiedades status (succes) y payload", async()=>{
            const newPet = {
                name:"test",
                specie:"dog",
                birthDate: '2022-03-01'
            }
            
            const {body}=await requester.post("/api/pets/withImage")
                                            .field("name", newPet.name)
                                            .field("specie", newPet.specie)
                                            .field("birthDate", newPet.birthDate)
                                            .attach("image", "./test/img-test.webp")

            expect(body).to.be.have.property('status').and.to.be.eq('success')
            expect(body).to.be.have.property('payload')
            fs.unlinkSync(body.payload.image)
        })
        it('El objeto de la propiedad payload debe ser una mascota (con propiedades: _id, name, specie, birthDate e image)', async()=>{
            const newPet = {
                name:"test",
                specie:"dog",
                birthDate: '2022-03-01'
            }
            const {body}=await requester.post("/api/pets/withImage")
                                            .field("name", newPet.name)
                                            .field("specie", newPet.specie)
                                            .field("birthDate", newPet.birthDate)
                                            .attach("image", "./test/img-test.webp")

            expect(body.payload).to.have.property('_id')
            expect(body.payload).to.have.property('name')
            expect(body.payload).to.have.property('specie')
            expect(body.payload).to.have.property('birthDate')
            expect(body.payload).to.have.property('image')
            fs.unlinkSync(body.payload.image)
        })
        it('Debe guardar la mascota en DB', async()=>{
            const newPet = {
                name:"test",
                specie:"dog",
                birthDate: '2022-03-01'
            }
            const {body}=await requester.post("/api/pets/withImage")
                                            .field("name", newPet.name)
                                            .field("specie", newPet.specie)
                                            .field("birthDate", newPet.birthDate)
                                            .attach("image", "./test/img-test.webp")

            const petDB = await petModel.findOne({name:'test'})

            expect(petDB).to.be.ok
            expect(petDB).to.have.property('_id')
            expect(petDB).to.have.property('name')
            expect(petDB).to.have.property('specie')
            expect(petDB).to.have.property('birthDate')
            expect(petDB).to.have.property('image')
            fs.unlinkSync(body.payload.image)
        })
        it('Debe guardar la imagen', async()=>{
            const newPet = {
                name:"test",
                specie:"dog",
                birthDate: '2022-03-01'
            }
            const {body}=await requester.post("/api/pets/withImage")
                                            .field("name", newPet.name)
                                            .field("specie", newPet.specie)
                                            .field("birthDate", newPet.birthDate)
                                            .attach("image", "./test/img-test.webp")


            expect(fs.existsSync(body.payload.image)).to.be.true
            fs.unlinkSync(body.payload.image)
        })
    })
})