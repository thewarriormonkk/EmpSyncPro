const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')

const Schema = mongoose.Schema

const employeeSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    designation: {
        type: String
    },
    department: {
        type: String
    },
    skills: [{
        type: String
    }],
    salary: {
        type: Number
    },
    joinDate: {
        type: Date,
        default: Date.now
    },
    phoneNumber: {
        type: String
    },
    address: {
        type: String
    }
}, { timestamps: true })

// static signup method
employeeSchema.statics.signup = async function (email, password, name) {
    // validation
    if (!email || !password || !name) {
        throw Error('All required fields must be filled')
    }
    if (!validator.isEmail(email)) {
        throw Error('Email not valid')
    }
    if (!validator.isStrongPassword(password)) {
        throw Error('Password not strong enough')
    }

    const exists = await this.findOne({ email })

    if (exists) {
        throw Error('Email already in use')
    }

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const employee = await this.create({
        email,
        password: hash,
        name
    })

    return employee
}

// static login method
employeeSchema.statics.login = async function (email, password) {
    if (!email || !password) {
        throw Error('All fields must be filled')
    }

    const employee = await this.findOne({ email })
    if (!employee) {
        throw Error('Incorrect email')
    }

    const match = await bcrypt.compare(password, employee.password)
    if (!match) {
        throw Error('Incorrect password')
    }

    return employee
}

module.exports = mongoose.model('Employee', employeeSchema) 