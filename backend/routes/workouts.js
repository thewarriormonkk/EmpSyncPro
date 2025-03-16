const express = require('express')
const Workout = require('../models/workoutModel')
const {
    getWorkouts,
    getWorkout,
    createWorkout,
    deleteWorkout,
    updateWorkout
} = require('../controllers/workoutController');
const requireAuth = require('../middleware/requireAuth')


const router = express.Router()

// require auth for all workout routes
router.use(requireAuth)

// GET all workouts
router.get('/', getWorkouts)

// GET a single workout
router.get('/:id', getWorkout)

// POST a new workout
router.post('/', createWorkout)

// PATCH a request
router.patch('/:id', updateWorkout)

// DELETE a request
router.delete('/:id', deleteWorkout)

module.exports = router