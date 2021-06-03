const express = require('express')
const User = require('../models/user')
const Wallet = require('../models/wallet')
const auth = require('../middleware/auth')
const router = new express.Router()

// Sign up a new user
router.post('/users', async (req, res)=>{
    const parent1UserId = req.body.parent1UserId
    if(parent1UserId){
        parent2UserId = await User.findOne({_id:parent1UserId}).parent1UserId
           
        if(parent2UserId){
            req.body.parent2UserId= parent2UserId

            parent3UserId = await User.findOne({_id:parent2UserId}).parent1UserId
            if(parent3UserId){
                req.body.parent3UserId= parent3UserId
            }
        }
    }
       
    const user = new User({
        ...req.body,
    })

    try {
        await user.save()
        const token = await user.generateAuthToken()

        const userId = await User.findOne({email:req.body.email})
        const wallet = new Wallet({userId: userId._id})
        await wallet.save()

        res.status(201).send({user, wallet, token})
    } catch (e) {
        res.status(400).send(e)
    }
})

// Login existing user
router.post('/users/login', async (req, res)=>{
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch (e) {
        res.status(400).send({error: 'Email or/and password is incorrect'})
    }
})

// Amount addition to wallet
router.patch('/users/addAmount', auth, async (req, res)=>{
    const amount = req.body.amount
    
    try {
        const walletUser = await Wallet.findOne({userId:req.user._id})
        walletUser.totalAmount = parseInt(walletUser.totalAmount) + parseInt(amount)
        walletUser.document = walletUser.document.concat({amount, description: 'Self addition to wallet'})
        await walletUser.save()
        
        const walletParent1 = await Wallet.findOne({userId:req.user.parent1UserId})
        if(walletParent1){
            walletParent1.totalAmount = parseInt(walletParent1.totalAmount) + parseInt(amount)*0.4
            walletParent1.document = walletParent1.document.concat({amount:parseInt(amount)*0.4, description: 'Referral Earning'})
            await walletParent1.save()
        }

        const walletParent2 = await Wallet.findOne({userId:req.user.parent2UserId})
        if(walletParent2){
            walletParent2.totalAmount = parseInt(walletParent2.totalAmount) + parseInt(amount)*0.2
            walletParent2.document = walletParent2.document.concat({amount:parseInt(amount)*0.2, description: 'Referral Earning'})
            await walletParent2.save()
        }

        const walletParent3 = await Wallet.findOne({userId:req.user.parent3UserId})
        if(walletParent3){
            walletParent3.totalAmount = parseInt(walletParent3.totalAmount) + parseInt(amount)*0.1
            walletParent3.document = walletParent3.document.concat({amount:parseInt(amount)*0.1, description: 'Referral Earning'})
            await walletParent3.save()
        }
        
        res.send(walletUser)
    } catch (e) {
        res.status(400).send(e)
    }
})

// Get user's profile and wallet
router.get('/users/me', auth, async (req, res)=>{
    const user = req.user
    const wallet = await Wallet.findOne({userId:req.user._id})
    res.send({user, wallet})
})

// Logout from current device 
router.post('/users/logout', auth, async (req, res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token         
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})

// Logout from all devices 
router.post('/users/logoutAll', auth, async (req, res)=>{
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})

// Delete user's profile
router.delete('/users/me', auth, async (req, res)=>{
    try {
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router