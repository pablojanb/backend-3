import supertest from 'supertest'
import {describe, it} from 'mocha'
import {expect} from 'chai'
import userModel from '../../src/dao/models/User.js'
import petModel from '../../src/dao/models/Pet.js'
import adoptionModel from '../../src/dao/models/Adoption.js'

const requester = supertest('http://localhost:9090')

describe('Tests sobre el router /api/adoptions', function(){
    this.timeout(5000)
    describe('Método GET', ()=>{
        it('Debe devolver un status 200', async()=>{
            const response = await requester.get('/api/adoptions')
            const {statusCode} = response
            expect(statusCode).to.be.eq(200)
        })
        it('Debe devolver un objeto con propiedades status (succes) y payload (array)', async()=>{
            const response = await requester.get('/api/adoptions')
            const {body} = response
            expect(body).to.have.property('status').and.to.be.eq('success')
            expect(body).to.have.property('payload')
            body.payload && expect(Array.isArray(body.payload)).to.be.true
        })
        it('El array de la propiedad payload debe devolver objetos de users (con propiedades: _id, owner y pet)', async()=>{
            const response = await requester.get('/api/adoptions')
            const {body} = response
            if (body.payload) {
                body.payload.forEach(adoption => {
                    expect(adoption).to.have.property('_id')
                    expect(adoption).to.have.property('owner')
                    expect(adoption).to.have.property('pet')
                });
            }
        })
    })
    describe('Método GET (/api/adoptions/:aid)', ()=>{
        let userId
        let petId
        let adoptionId

        beforeEach(async()=>{
            const user = await userModel.create({first_name: "test", last_name: "Casco", email: "maxcasco@gmail.com", password: "123"})
            const pet = await petModel.create({name: "test", specie: "Labrador", birthDate: "2022-03-12", image: ""})
            const adoption = await adoptionModel.create({owner:user._id,pet:pet._id})
            userId = user._id
            petId = pet._id
            adoptionId = adoption._id
        })
        afterEach(async()=>{
            await userModel.deleteMany({first_name:"test"})
            await petModel.deleteMany({name:"test"})
            await adoptionModel.deleteMany({pet: petId, owner: userId})
        })
        it('Debe devolver un status 200', async()=>{
            const response = await requester.get(`/api/adoptions/${adoptionId}`)
            const {statusCode} = response
            expect(statusCode).to.be.eq(200)
        })
        it('Debe devolver un objeto con propiedades status (success) y payload (array)', async()=>{
            const response = await requester.get(`/api/adoptions/${adoptionId}`)
            const { body } = response
            expect(body).to.have.property('status').and.to.be.eq('success')
            expect(body).to.have.property('payload')
            body.payload && expect(typeof(body.payload)).to.eq('object')
        })
        it('Si recibe como argumento un aid inexistente debe devolver un objeto con propiedades status (error) y error (Adoption not found)', async()=>{
            const response = await requester.get(`/api/adoptions/67de201d57be594b37a311e9`)
            const { body } = response
            expect(body).to.have.property('status').and.to.be.eq('error')
            expect(body).to.have.property('error').and.to.be.eq('Adoption not found')
        })
    })
    describe('Método POST (/api/adoptions/:uid/:pid)', ()=>{
        let userId
        let petId
        let adoptionId

        beforeEach(async()=>{
            const user = await userModel.create({first_name: "test", last_name: "Casco", email: "maxcasco@gmail.com", password: "123"})
            const pet = await petModel.create({name: "test", specie: "Labrador", birthDate: "2022-03-12", image: ""})
            userId = user._id
            petId = pet._id
        })
        afterEach(async()=>{
            await userModel.deleteMany({first_name:"test"})
            await petModel.deleteMany({name:"test"})
            await adoptionModel.deleteMany({pet: petId, owner: userId})
        })
        it('Debe devolver un status 200', async()=>{
            const response = await requester.post(`/api/adoptions/${userId}/${petId}`)
            const {statusCode} = response
            expect(statusCode).to.be.eq(200)
        })
        it('Debe devolver un objeto con propiedades status (succes) y message (Pet adopted) y la propiedad "adopted" de la mascota debe pasar a true en DB', async()=>{
            const response = await requester.post(`/api/adoptions/${userId}/${petId}`)
            const {body} = response
            expect(body).to.have.property('status').and.to.be.eq('success')
            expect(body).to.have.property('message').and.to.be.eq('Pet adopted')
          
            const petDB = await petModel.findOne({_id: petId})
            expect(petDB).to.have.property('adopted').and.to.be.true
        })
        it('Debe guardar la adopción en DB', async()=>{
            await requester.post(`/api/adoptions/${userId}/${petId}`)
            const adoption = await adoptionModel.findOne({pet: petId, owner: userId})
            expect(adoption).to.be.ok
            adoptionId = adoption._id
        })
        it('Si paso como argumento un uid inexistente debe devolver un objeto con propiedades status (error) y error (user Not found)', async()=>{
            const response = await requester.post(`/api/adoptions/67ddfa33dcd5da5569af0aa4/${petId}`)
            const {body} = response
            expect(body).to.have.property('status').and.to.be.eq('error')
            expect(body).to.have.property('error').and.to.be.eq('user Not found')
        })
        it('Si paso como argumento un pid inexistente debe devolver un objeto con propiedades status (error) y error (pet Not found)', async()=>{
            const response = await requester.post(`/api/adoptions/${userId}/67de69d67d594fff77aeb15c`)
            const {body} = response
            expect(body).to.have.property('status').and.to.be.eq('error')
            expect(body).to.have.property('error').and.to.be.eq('Pet not found')
        })
        it('Si paso como argumento un pid de una mascota previamente adoptada debe devolver un objeto con propiedades status (error) y error (Pet is already adopted)', async()=>{
            await requester.post(`/api/adoptions/${userId}/${petId}`)
            const response = await requester.post(`/api/adoptions/${userId}/${petId}`)
            const {body} = response
            expect(body).to.have.property('status').and.to.be.eq('error')
            expect(body).to.have.property('error').and.to.be.eq('Pet is already adopted')
        })
    })
})