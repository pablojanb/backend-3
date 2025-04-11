import supertest from 'supertest'
import {describe, it} from 'mocha'
import {expect} from 'chai'
import mongoose from 'mongoose'
import userModel from '../../src/dao/models/User.js'
import { config } from '../../src/config/config.js'
import fs from 'fs'
mongoose.connect(config.MONGO_URL)

const requester = supertest('http://localhost:9090')

describe('Tests sobre el router /api/users', function(){
    this.timeout(5000)
    describe('Método GET', ()=>{
        it('Debe devolver un status 200', async()=>{
            const response = await requester.get('/api/users')
            const {statusCode} = response
            expect(statusCode).to.be.eq(200)
        })
        it('Debe devolver un objeto con propiedades status (succes) y payload (array)', async()=>{
            const response = await requester.get('/api/users')
            const {body} = response
            expect(body).to.have.property('status').and.to.be.eq('success')
            expect(body).to.have.property('payload')
            body.payload && expect(Array.isArray(body.payload)).to.be.true
        })
        it('El array de la propiedad payload debe devolver objetos de users (con propiedades: _id, first_name, last_name, email, password, role, pets, last_connection y documents)', async()=>{
            const response = await requester.get('/api/users')
            const {body} = response
            if (body.payload) {
                body.payload.forEach(user => {
                    expect(user).to.have.property('_id')
                    expect(user).to.have.property('first_name')
                    expect(user).to.have.property('last_name')
                    expect(user).to.have.property('email')
                    expect(user).to.have.property('password')
                    expect(user).to.have.property('role')
                    expect(user).to.have.property('pets')
                    expect(user).to.have.property('last_connection')
                    expect(user).to.have.property('documents')
                });
            }
        })
    })
    describe('Método GET (/api/users/:uid)', ()=>{
        let userId
        before(async()=>{
            const body = {
                first_name: "Coco",
                last_name: "Perez",
                email: "cocoperez@gmail.com",
                password: "123"
            }
            const user = await userModel.create(body)
            userId = user._id
        })
        after(async()=>{
            await userModel.deleteOne({_id:userId})
        })
        it('Debe devolver un status 200', async()=>{
            const response = await requester.get(`/api/users/${userId}`)
            const {statusCode} = response
            expect(statusCode).to.be.eq(200)
        })
        it('Debe devolver un objeto con propiedades status (succes) y payload (object)', async()=>{
            const response = await requester.get(`/api/users/${userId}`)
            const {body} = response
            expect(body).to.have.property('status').and.to.be.eq('success')
            expect(body).to.have.property('payload')
            body.payload && expect(typeof(body.payload)).to.be.eq('object')
        })
        it('El objeto de la propiedad payload debe ser un user (con propiedades: _id, first_name, last_name, email, password, role, pets, last_connection y documents)', async()=>{
            const response = await requester.get(`/api/users/${userId}`)
            const {body} = response
            if (body.payload) {
                expect(body.payload).to.have.property('_id')
                expect(body.payload).to.have.property('first_name')
                expect(body.payload).to.have.property('last_name')
                expect(body.payload).to.have.property('email')
                expect(body.payload).to.have.property('password')
                expect(body.payload).to.have.property('role')
                expect(body.payload).to.have.property('pets')
                expect(body.payload).to.have.property('last_connection')
                expect(body.payload).to.have.property('documents')
            }
        })
        it('Si paso como parametro un uid inexistente debe devolver un status 404', async()=>{
            const response = await requester.get(`/api/users/67ddfa554071dbfcbeedb16c`)
            const {statusCode} = response
            expect(statusCode).to.be.eq(404)
        })
        it('Si paso como parametro un uid inexistente debe devolver un objeto con propiedades status (error) y error (User not found)', async()=>{
            const response = await requester.get(`/api/users/67ddfa554071dbfcbeedb16c`)
            const {body} = response
            expect(body).to.have.property('status').and.to.be.eq('error')
            expect(body).to.have.property('error').and.to.be.eq('User not found')
        })
    })
    describe('Método PUT (/api/users/:uid)', ()=>{
        let userId
        before(async()=>{
            const body = {
                first_name: "Coco",
                last_name: "Perez",
                email: "cocoperez@gmail.com",
                password: "123"
            }
            const user = await userModel.create(body)
            userId = user._id
        })
        after(async()=>{
            await userModel.deleteOne({_id:userId})
        })
        it('Debe devolver un status 200', async()=>{
            const updatedBody = {
                first_name: "Luna",
                last_name: "Sosa",
                email: "lunasosa@gmail.com",
                password: 123
            }
            const response = await requester.put(`/api/users/${userId}`).send(updatedBody)
            const {statusCode} = response
            expect(statusCode).to.be.eq(200)
        })
        it('Debe devolver un objeto con propiedades status (succes) y message (User updated)', async()=>{
            const updatedBody = {
                first_name: "Luna",
                last_name: "Sosa",
                email: "lunasosa@gmail.com",
                password: 123
            }
            const response = await requester.put(`/api/users/${userId}`).send(updatedBody)
            const {body} = response
            expect(body).to.have.property('status').and.to.be.eq('success')
            expect(body).to.have.property('message').and.to.be.eq('User updated')
        })
        it('Debe actualizar el usuario en la DB', async()=>{
            const updatedBody = {
                first_name: "Margarita",
                last_name: "Estevez",
                email: "margaritaestevez@gmail.com",
                password: 123
            }
            await requester.put(`/api/users/${userId}`).send(updatedBody)
            const updatedUser = await userModel.findOne({_id:userId})
            expect(updatedUser).to.have.property('first_name').and.to.be.eq(updatedBody.first_name)
            expect(updatedUser).to.have.property('email').and.to.be.eq(updatedBody.email)
        })
        it('Si paso como parametro un uid inexistente debe devolver un status 404', async()=>{
            const updatedBody = {
                first_name: "Margarita",
                last_name: "Estevez",
                email: "margaritaestevez@gmail.com",
                password: 123
            }
            const response = await requester.put(`/api/users/67ddfa554071dbfcbeedb16c`).send(updatedBody)
            const {statusCode} = response
            expect(statusCode).to.be.eq(404)
        })
        it('Si paso como parametro un uid inexistente debe devolver un objeto con propiedades status (error) y error (User not found)', async()=>{
            const updatedBody = {
                first_name: "Margarita",
                last_name: "Estevez",
                email: "margaritaestevez@gmail.com",
                password: 123
            }
            const response = await requester.put(`/api/users/67ddfa554071dbfcbeedb16c`).send(updatedBody)
            const {body} = response
            expect(body).to.have.property('status').and.to.be.eq('error')
            expect(body).to.have.property('error').and.to.be.eq('User not found')
        })
    })
    describe('Método DELETE (/api/users/:uid)', ()=>{
        let userId
        beforeEach(async()=>{
            const body = {
                first_name: "Coco",
                last_name: "Perez",
                email: "cocoperez@gmail.com",
                password: "123"
            }
            const user = await userModel.create(body)
            userId = user._id
        })
        it('Debe devolver un status 200', async()=>{
            const response = await requester.delete(`/api/users/${userId}`)
            const {statusCode} = response
            expect(statusCode).to.be.eq(200)
        })
        it('Debe devolver un objeto con propiedades status (succes) y message (User deleted)', async()=>{
            const response = await requester.delete(`/api/users/${userId}`)
            const {body} = response
            expect(body).to.have.property('status').and.to.be.eq('success')
            expect(body).to.have.property('message').and.to.be.eq('User deleted')
        })
        it('Debe eliminar el user de la DB', async()=>{
            const response = await requester.delete(`/api/users/${userId}`)
            const user = await userModel.findOne({_id:userId})
            expect(user).to.be.null
        })
    })
    describe('Método POST (/api/users/:uid/documents)', ()=>{
        let userId
        beforeEach(async()=>{
            const body = {
                first_name: "Coco",
                last_name: "Perez",
                email: "cocoperez@gmail.com",
                password: "123"
            }
            const user = await userModel.create(body)
            userId = user._id
        })
        afterEach(async()=>{
            await userModel.deleteOne({_id:userId})
        })
        it('Debe devolver un status 200', async()=>{
            const response = await requester.post(`/api/users/${userId}/documents`)
                                                .attach("doc", "./test/doc-test.txt")
            const {statusCode} = response
            expect(statusCode).to.be.eq(200)
            fs.unlinkSync(response.body.payload.documents[0].reference)
        })
        it('Debe devolver un objeto con propiedades status (succes) y payload (object)', async()=>{
            const {body} = await requester.post(`/api/users/${userId}/documents`)
                                            .attach("doc", "./test/doc-test.txt")
            expect(body).to.have.property('status').and.to.be.eq('success')
            expect(body).to.have.property('payload')
            body.payload && expect(typeof(body.payload)).to.be.eq('object')
            fs.unlinkSync(body.payload.documents[0].reference)
        })
        it('El objeto de la propiedad payload debe ser un user (con propiedades: _id, first_name, last_name, email, password, role, pets last_connection y documents)', async()=>{
            const response = await requester.post(`/api/users/${userId}/documents`)
                                        .attach("doc", "./test/doc-test.txt")
            const {body} = response
            if (body.payload) {
                expect(body.payload).to.have.property('_id')
                expect(body.payload).to.have.property('first_name')
                expect(body.payload).to.have.property('last_name')
                expect(body.payload).to.have.property('email')
                expect(body.payload).to.have.property('password')
                expect(body.payload).to.have.property('role')
                expect(body.payload).to.have.property('pets')
                expect(body.payload).to.have.property('last_connection')
                expect(body.payload).to.have.property('documents')
            }
            fs.unlinkSync(body.payload.documents[0].reference)
        })
        it('La propiedad documents del payload debe ser un array de objetos con propiedades name y reference', async()=>{
            const {body} = await requester.post(`/api/users/${userId}/documents`)
                                            .attach("doc", "./test/doc-test.txt")
            expect(Array.isArray(body.payload.documents)).to.be.true
            body.payload.documents.forEach(doc=>{
                expect(doc).to.have.property('name')
                expect(doc).to.have.property('reference')
            })
            fs.unlinkSync(body.payload.documents[0].reference)
        })
        it('Debe guardar el documento', async()=>{
            const {body} = await requester.post(`/api/users/${userId}/documents`)
                                            .attach("doc", "./test/doc-test.txt")
            expect(Array.isArray(body.payload.documents)).to.be.true
            body.payload.documents.forEach(doc=>{
                expect(doc).to.have.property('name')
                expect(doc).to.have.property('reference')
            })

            expect(fs.existsSync(body.payload.documents[0].reference)).to.be.true
            fs.unlinkSync(body.payload.documents[0].reference)
        })
    })
})