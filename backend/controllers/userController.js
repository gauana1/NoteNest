const admin = require('firebase-admin');
const db = admin.firestore();

const createUser = async (req, res) => {
    const { email, name, otherDetails } = req.body;

    try {
        // Normalize the email to ensure uniqueness in a case-insensitive manner
        const normalizedEmail = email.toLowerCase();

        // Use the normalized email as the document ID
        const userRef = db.collection('users').doc(normalizedEmail);

        // Check if the document exists
        const doc = await userRef.get();
        if (doc.exists) {
            return  res.status(201).json({ message: 'User logged in successfully', userEmail: normalizedEmail});
        }

        // If no existing user found, create the new user
        await userRef.set({
            email: normalizedEmail
        });

        res.status(201).json({ message: 'User created successfully', userEmail: normalizedEmail });
    } catch (error) {
        console.error('Failed to create user:', error);
        res.status(500).json({ error: error.message });
    }
};


const getUserById = async (req, res) => {
    try {
        const userRef = db.collection('users').doc(req.params.id);
        const doc = await userRef.get();
        if (!doc.exists) {
            res.status(404).send('User not found');
        } else {
            res.status(200).json(doc.data());
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userCredential = await admin.auth().signInWithEmailAndPassword(email, password);
        const token = await userCredential.user.getIdToken();
        res.status(200).send({ token });
    } catch (error) {
        res.status(401).json({ error: 'Login failed', details: error.message });
    }
};

const getClasses = async (req, res) => {
    try {
        const { email } = req.body;  // Email provided in the request body
        const normalizedEmail = email.toLowerCase();  // Normalize email to match document ID

        // Access the user document
        const userRef = db.collection('users').doc(normalizedEmail);
        const doc = await userRef.get();

        if (!doc.exists) {
            return res.status(404).send('User not found');
        }

        // Assuming classes are stored as an array of class IDs or names in the 'classes' field
        const userData = doc.data();
        const classes = userData?.classes || [];
        if (classes.length === 0) {
            return res.status(200).json([]);  // No classes found for the user
        }
        let classesArray = Object.entries(classes).map(([key, value]) => {
            return { name: key, id: value };
        })
        res.status(200).json(classesArray);
    } catch (error) {
        console.error('Failed to fetch classes:', error);
        res.status(500).json({ error: error.message });
    }
};



module.exports = {
    createUser,
    getUserById,
    loginUser, 
    getClasses
};
