const express = require('express')
const {
    signupEmployee,
    loginEmployee,
    getEmployees,
    getEmployee,
    updateEmployee
} = require('../controllers/employeeController')
const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

// login route
router.post('/login', loginEmployee)

// signup route
router.post('/signup', signupEmployee)

// middleware to protect routes below
router.use(requireAuth)

// GET all employees
router.get('/', getEmployees)

// GET a single employee
router.get('/:id', getEmployee)

// UPDATE employee profile
router.patch('/update', updateEmployee)

module.exports = router 