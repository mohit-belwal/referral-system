const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../src/models/user')
const Wallet = require('../../src/models/wallet')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: 'One',
    email: 'one@example.com',
    password: 'one@123',
    tokens: [{
        token: jwt.sign({_id: userOneId}, process.env.JWT_SECRET)
    }]
}

const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
    _id: userTwoId,
    name: 'Two',
    email: 'two@example.com',
    password: 'two@123',
    parent1UserId: userOneId,
    tokens: [{
        token: jwt.sign({_id: userTwoId}, process.env.JWT_SECRET)
    }]
}

const walletOne = {
    _id: new mongoose.Types.ObjectId(),
    totalAmount: 0,
    user: userOneId
}

const walletTwo = {
    _id: new mongoose.Types.ObjectId(),
    totalAmount: 0,
    user: userTwoId
}

const setupDatabase = async() =>{
    await User.deleteMany()
    await Wallet.deleteMany()
    await User(userOne).save()
    await User(userTwo).save()
    await Wallet(walletOne).save()
    await Wallet(walletTwo).save()
    await Wallet(walletThree).save()
}

module.exports = {
    userOne,
    userOneId,
    userTwo,
    walletOne,
    walletTwo,
    setupDatabase
}