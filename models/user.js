const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Wallet = require('./wallet')

const userSchema = mongoose.Schema({
        name:{
            type: String,
            required: true,
            trim: true
            }, 
        age:{
            type: Number,
            default: 0,
            validate(value){
                if(value<0) {
                    throw new Error('Age must be a positive number')
                }
            }}, 
        email:{
            type: String,
            required: true,
            lowercase: true,
            unique: true,
            trim: true,
            validate(value){
                if(!validator.isEmail(value)) {
                    throw new Error('Enter a valid email')
                }
            }}, 
        password:{
            type: String,
            required: true,
            trim: true,
            minlength: 6,
            validate(value){
                if(value.toLowerCase().includes('password')) {
                    throw new Error('Password cannot contain "password". Try another one')
                }
            }}, 
        parent1UserId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
            },
        parent2UserId:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                default: null
            },
        parent3UserId:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                default: null
            },
        tokens:[{
            token:{
                type: String,
                required: true
            }
        }], 
    }, {
    timestamps: true
})

//Hinding confidential data, like password
userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

//Generating user authentication token (expires in 24 hours)
userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, 'secREtkeY', {expiresIn: '24h'})
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

//Logging in user    
userSchema.statics.findByCredentials = async (email, password)=>{
    const user = await User.findOne({email})

    if(!user){
        throw new Error('Email or/and password is incorrect')
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        throw new error('Email or/and password is incorrect')
    }

    return user
}

//Hashing the password before saving
userSchema.pre('save', async function(next) {
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

//Deleting user's wallet when user is deleted
userSchema.pre('remove', async function(next) {
    const user = this
    await Wallet.deleteOne({userId: user._id})  

    next()
})

const User = mongoose.model('User', userSchema)

module.exports= User
