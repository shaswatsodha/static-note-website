const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Mongoose Schema for a Note.
 * A Note must belong to a specific User (using the 'user' field).
 */
const NotesSchema = new Schema({
    // Store the ID of the user who owns this note. 
    // This is crucial for authentication and ensuring users only access their own notes.
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', // Reference to the 'User' model (assuming your User model is named 'user')
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    tag: {
        type: String,
        default: "General" // Optional field for categorization
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('note', NotesSchema);
