require('dotenv').config({ path: '../.env' });
const express = require('express');
const admin = require('firebase-admin');
const cors = require("cors");
// CORS Options
const corsOptions = {
    origin: '*', 
    credentials: true,            // Access-Control-Allow-Credentials: true
    optionSuccessStatus: 200,
};

const app = express();
// Apply CORS middleware
app.use(cors(corsOptions));

// Initialize Firebase Admin with service account
console.log('Firebase Credentials Path:', process.env.FIREBASE_CREDENTIALS_PATH);
const serviceAccount = require(process.env.FIREBASE_CREDENTIALS_PATH);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


app.use(express.json());
// Register routes
const userRoutes = require('./routes/userRoutes');
const classRoutes = require('./routes/classRoutes');
const notesRoutes = require('./routes/notesRoutes');
app.use('/user', userRoutes);
app.use('/classes', classRoutes);
app.use('/notes', notesRoutes);
// Get the PORT from environment variables
const PORT = process.env.PORT || 3000; 

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
