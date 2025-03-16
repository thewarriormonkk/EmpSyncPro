require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const { createServer } = require('http')
const { Server } = require('socket.io')
const setupSocketServer = require('./socketServer')

// Import routes
const employeeRoutes = require('./routes/employee')

// Express app
const app = express()

// Create HTTP server
const httpServer = createServer(app)

// Create Socket.IO server
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
})

// Setup WebSocket server
setupSocketServer(io)

// Middleware
app.use(express.json())
app.use(cors())

app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

// Routes
app.use('/api/employee', employeeRoutes)

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        // Start server
        httpServer.listen(process.env.PORT, () => {
            console.log('Connected to MongoDB & listening on port', process.env.PORT)
        })
    })
    .catch((error) => {
        console.log(error)
    })


