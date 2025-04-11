import supertest from 'supertest'
import {describe, it} from 'mocha'
import {expect} from 'chai'
import userModel from '../../src/dao/models/User.js'
import mongoose from 'mongoose'
import { config } from '../../src/config/config.js'
mongoose.connect(config.MONGO_URL)
const requester = supertest('http://localhost:9090')
let cookie
let cookieUnprotectedLogin

describe('Tests sobre el router /api/sessions', function(){
    this.timeout(5000)
    describe('Método POST (/api/sessions/register)', ()=>{
        afterEach(async()=>{
            await userModel.deleteMany({first_name: 'test'})
        })
        it('Debe devolver un status 200', async()=>{
            const body = {
                first_name: "test",
                last_name: "Perez",
                email: "juanperez@gmail.com",
                password: "123"
              }
            const response = await requester.post('/api/sessions/register').send(body)
            const {statusCode} = response
            expect(statusCode).to.be.eq(200)
        })
        it('Debe devolver un objeto con las propiedades status(success) y payload (user id) ademas de guardar el user en DB', async()=>{
            const bodyUser = {
                first_name: "test",
                last_name: "Perez",
                email: "juanperez@gmail.com",
                password: "123"
            }
            const response = await requester.post('/api/sessions/register').send(bodyUser)
            const {body} = response
            expect(body).to.have.property('status').and.to.be.eq('success')
            expect(body).to.have.property('payload')
            const user = await userModel.findById(body.payload)
            expect(user).to.be.ok
        })
        it('Si falta enviar alguna propiedad debe devolver un status 400', async()=>{
            const body = {
                first_name: "Juan",
                last_name: "Perez",
                password: "123"
            }
            const response = await requester.post('/api/sessions/register').send(body)
            const {statusCode} = response
            expect(statusCode).to.be.eq(400)
        })
        it('Si falta enviar alguna propiedad debe devolver un objeto con las propiedades status(error) y error (Incomplete values)', async()=>{
            const bodyUser = {
                first_name: "Juan",
                last_name: "Perez",
                password: "123"
            }
            const response = await requester.post('/api/sessions/register').send(bodyUser)
            const {body} = response
            expect(body).to.have.property('status').and.to.be.eq('error')
            expect(body).to.have.property('error').and.to.be.eq('Incomplete values')
        })
    })
    describe('Método POST (/api/sessions/login)', ()=>{
        beforeEach(async()=>{
            const body = {
                first_name: "test",
                last_name: "Perez",
                email: "juanperez@gmail.com",
                password: "123"
            }
            await requester.post('/api/sessions/register').send(body)
        })
        afterEach(async()=>{
            await userModel.deleteMany({first_name: 'test'})
        })
        it('Debe devolver un status 200', async()=>{
            const response = await requester.post('/api/sessions/login').send({email: "juanperez@gmail.com", password: "123"})
            const {statusCode} = response
            expect(statusCode).to.be.eq(200)
        })
        it('Debe devolver un objeto con las propiedades status(success) y message (Logged in)', async()=>{
            const response = await requester.post('/api/sessions/login').send({email: "juanperez@gmail.com", password: "123"})
            const {body} = response
            expect(body).to.have.property('status').and.to.be.eq('success')
            expect(body).to.have.property('message').and.to.be.eq('Logged in')
        })
        it('Si faltan enviar propiedades para el login debe devolver un objeto con las propiedades status(error) y error (Incomplete values)', async()=>{
            const response = await requester.post('/api/sessions/login').send({email: "juanperez@gmail.com"})
            const {body} = response
            expect(body).to.have.property('status').and.to.be.eq('error')
            expect(body).to.have.property('error').and.to.be.eq('Incomplete values')
        })
        it("Si recibe un mail no registrado debe devolver un objeto con las propiedades status(error) y error (User doesn't exist)", async()=>{
            const response = await requester.post('/api/sessions/login').send({email: "test@gmail.com", password: '123'})
            const {body} = response
            expect(body).to.have.property('status').and.to.be.eq('error')
            expect(body).to.have.property('error').and.to.be.eq("User doesn't exist")
        })
        it("Si recibe un password incorrecto debe devolver un objeto con las propiedades status(error) y error (Incorrect password)", async()=>{
            const response = await requester.post('/api/sessions/login').send({email: "juanperez@gmail.com", password: '1234'})
            const {body} = response
            expect(body).to.have.property('status').and.to.be.eq('error')
            expect(body).to.have.property('error').and.to.be.eq("Incorrect password")
        })
        it("Debe devolver una cookie llamada coderCookie", async()=>{
            const { headers } = await requester.post('/api/sessions/login').send({email: "juanperez@gmail.com", password: "123"})
            cookie = headers['set-cookie'][0]
            const cookieNombre = cookie.split('=')[0]
            expect(cookieNombre).to.be.eq('coderCookie')
        })
    })
    describe('Método GET (/api/sessions/current)', ()=>{
        it('Debe devolver un status 200', async()=>{
            const { statusCode } = await requester.get('/api/sessions/current').set("Cookie", cookie)
            expect(statusCode).to.be.eq(200)
        })
        it('Debe devolver un objeto con las propiedades status(success) y payload', async()=>{
            const { body } = await requester.get('/api/sessions/current').set("Cookie", cookie)
            expect(body).to.have.property('status').and.to.be.eq('success')
            expect(body).to.have.property('payload')
        })
        it('El payload debe ser un objeto con los datos del usuario logueado', async()=>{
            const { body } = await requester.get('/api/sessions/current').set("Cookie", cookie)
            expect(body.payload).to.have.property('name').and.to.be.eq('test Perez')
            expect(body.payload).to.have.property('role').and.to.be.eq('user')
            expect(body.payload).to.have.property('email').and.to.be.eq('juanperez@gmail.com')
            expect(body.payload).to.have.property('iat')
            expect(body.payload).to.have.property('exp')
        })
    })
    describe('Método GET (/api/sessions/unprotectedLogin)', ()=>{
        beforeEach(async()=>{
            const body = {
                first_name: "test",
                last_name: "unprotected",
                email: "juanperez@gmail.com",
                password: "123"
            }
            await requester.post('/api/sessions/register').send(body)
        })
        afterEach(async()=>{
            await userModel.deleteMany({first_name: 'test'})
        })
        it('Debe devolver un status 200', async()=>{
            const response = await requester.get('/api/sessions/unprotectedLogin').send({email: "juanperez@gmail.com", password: "123"})
            const {statusCode} = response
            expect(statusCode).to.be.eq(200)
        })
        it('Debe devolver un objeto con las propiedades status(success) y message (Unprotected Logged in)', async()=>{
            const response = await requester.get('/api/sessions/unprotectedLogin').send({email: "juanperez@gmail.com", password: "123"})
            const {body} = response
            expect(body).to.have.property('status').and.to.be.eq('success')
            expect(body).to.have.property('message').and.to.be.eq('Unprotected Logged in')
        })
        it('Si faltan enviar propiedades para el login debe devolver un objeto con las propiedades status(error) y error (Incomplete values)', async()=>{
            const response = await requester.get('/api/sessions/unprotectedLogin').send({email: "juanperez@gmail.com"})
            const {body} = response
            expect(body).to.have.property('status').and.to.be.eq('error')
            expect(body).to.have.property('error').and.to.be.eq('Incomplete values')
        })
        it("Si recibe un password incorrecto debe devolver un objeto con las propiedades status(error) y error (Incorrect password)", async()=>{
            const response = await requester.get('/api/sessions/unprotectedLogin').send({email: "juanperez@gmail.com", password: '1234'})
            const {body} = response
            expect(body).to.have.property('status').and.to.be.eq('error')
            expect(body).to.have.property('error').and.to.be.eq("Incorrect password")
        })
        it("Debe devolver una cookie llamada unprotectedCookie", async()=>{
            const { headers } = await requester.get('/api/sessions/unprotectedLogin').send({email: "juanperez@gmail.com", password: "123"})
            cookieUnprotectedLogin = headers['set-cookie'][0]
            const cookieNombre = cookieUnprotectedLogin.split('=')[0]
            expect(cookieNombre).to.be.eq('unprotectedCookie')
        })
    })
    describe('Método GET (/api/sessions/unprotectedCurrent)', ()=>{
        it('Debe devolver un status 200', async()=>{
            const { statusCode } = await requester.get('/api/sessions/unprotectedCurrent').set("Cookie", cookieUnprotectedLogin)
            expect(statusCode).to.be.eq(200)
        })
        it('Debe devolver un objeto con las propiedades status(success) y payload', async()=>{
            const { body } = await requester.get('/api/sessions/unprotectedCurrent').set("Cookie", cookieUnprotectedLogin)
            expect(body).to.have.property('status').and.to.be.eq('success')
            expect(body).to.have.property('payload')
        })
        it('El payload debe ser un objeto con los datos del usuario logueado', async()=>{
            const { body } = await requester.get('/api/sessions/unprotectedCurrent').set("Cookie", cookieUnprotectedLogin)
            expect(body.payload).to.have.property('name').and.to.be.eq('test unprotected')
            expect(body.payload).to.have.property('role').and.to.be.eq('user')
            expect(body.payload).to.have.property('email').and.to.be.eq('juanperez@gmail.com')
            expect(body.payload).to.have.property('iat')
            expect(body.payload).to.have.property('exp')
        })
    })
})