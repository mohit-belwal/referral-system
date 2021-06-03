const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const Wallet = require('../src/models/wallet')
const {userOne, userOneId, setupDatabase} = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should sign up a new user',async ()=>{
    const response = await request(app).post('/users').send({
        name: "One",
        email: 'one@example.com',
        password: 'one@123'
    }).expect(201)

    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    expect(user.password).not.toBe('two@123')
}) 

test('Should login existing user',async ()=>{
    const response = await request(app).post('/users/login').send({
        password: userOne.password,
        email: userOne.email
    }).expect(200)

    const user = await User.findById(userOneId)

    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should get user profile', async()=>{
    await request(app).get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get user profile', async()=>{
    await request(app).get('/users/me')
        .send()
        .expect(401)
})

test('Should not delete user', async()=>{
    await request(app).delete('/users/me')
            .send()
            .expect(401)
})

test('Should delete user', async()=>{
    const response = await request(app).delete('/users/me')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
            .expect(200)

    const user = await User.findById(userOneId)

    expect(user).toBeNull()
})

test('Should add amount to wallet',async ()=>{
    const response = await request(app).post('/users/addAmount').send({
        amount: "100",
    }).expect(200)

    const wallet = await Wallet.findOne({userId:response.body.user._id})
    expect(wallet).not.toBeNull()

    expect(wallet.totalAmount).not.toBeNull()
}) 
