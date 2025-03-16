const Employee = require('../models/employeeModel')
const jwt = require('jsonwebtoken')

const createToken = (_id, email) => {
    return jwt.sign({ _id, email }, process.env.SECRET, { expiresIn: '3d' })
}

// login employee
const loginEmployee = async (req, res) => {
    const { email, password } = req.body

    try {
        const employee = await Employee.login(email, password)

        // create a token
        const token = createToken(employee._id, email)

        res.status(200).json({
            email,
            token,
            name: employee.name,
            designation: employee.designation,
            department: employee.department,
            skills: employee.skills,
            salary: employee.salary,
            joinDate: employee.joinDate,
            phoneNumber: employee.phoneNumber,
            address: employee.address
        })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// signup employee
const signupEmployee = async (req, res) => {
    const {
        email,
        password,
        name,
        designation,
        department,
        skills,
        salary,
        phoneNumber,
        address
    } = req.body

    try {
        const employee = await Employee.signup(
            email,
            password,
            name,
            designation,
            department,
            skills,
            salary,
            phoneNumber,
            address
        )

        // create a token
        const token = createToken(employee._id, email)

        res.status(200).json({
            email,
            token,
            name,
            designation,
            department,
            skills,
            salary,
            joinDate: employee.joinDate,
            phoneNumber,
            address
        })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// get all employees
const getEmployees = async (req, res) => {
    try {
        const employees = await Employee.find({}).select('-password')
        res.status(200).json(employees)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// get a single employee
const getEmployee = async (req, res) => {
    const { id } = req.params

    try {
        const employee = await Employee.findById(id).select('-password')
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' })
        }
        res.status(200).json(employee)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// update employee profile
const updateEmployee = async (req, res) => {
    const { designation, department, skills, salary, phoneNumber, address } = req.body

    try {
        const employee = await Employee.findById(req.employee._id)

        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' })
        }

        // Update only the fields that are provided
        if (designation) employee.designation = designation
        if (department) employee.department = department
        if (skills) employee.skills = skills
        if (salary) employee.salary = salary
        if (phoneNumber !== undefined) employee.phoneNumber = phoneNumber
        if (address !== undefined) employee.address = address

        await employee.save()

        res.status(200).json({
            designation: employee.designation,
            department: employee.department,
            skills: employee.skills,
            salary: employee.salary,
            phoneNumber: employee.phoneNumber,
            address: employee.address
        })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = {
    signupEmployee,
    loginEmployee,
    getEmployees,
    getEmployee,
    updateEmployee
} 