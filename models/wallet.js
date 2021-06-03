const mongoose = require('mongoose')

const walletSchema = mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
        }, 
    totalAmount: {
        type: Number,
        default: 0
        }, 
    document: [{
        amount: Number,
        description: String
    }]
})

const Wallet = mongoose.model('Wallet', walletSchema)

module.exports = Wallet