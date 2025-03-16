const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sourceEmail: {
        type: String,
        required: true
    },
    targetEmail: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Index for efficient querying of chat history
messageSchema.index({ sourceEmail: 1, targetEmail: 1 });
messageSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Message', messageSchema); 