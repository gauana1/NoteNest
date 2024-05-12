const admin = require('firebase-admin');
const db = admin.firestore();

const createClass = async (req, res) => {
    const { classname, emails } = req.body;
    const normalizedEmails = emails.map(email => email.toLowerCase().trim());

    const classDocRef = db.collection('classes').doc(classname);

    try {
        // Check if all user emails exist in the 'users' collection
        const userChecks = normalizedEmails.map(email => db.collection('users').doc(email).get());
        const userDocs = await Promise.all(userChecks);
        if (userDocs.some(doc => !doc.exists)) {
            return res.status(400).send('One or more member emails do not correspond to registered users.');
        }

        // Create or update the class document
        const classDoc = await classDocRef.get();
        if (!classDoc.exists) {
            await classDocRef.set({ classname });
        }

        // Create a new group under the class
        const groupDocRef = classDocRef.collection('groups').doc();
        await groupDocRef.set({
            groupId: groupDocRef.id,
            members: normalizedEmails
        });

        // Update each user's document to map this class to the newly created group ID
        const userUpdates = normalizedEmails.map(email => 
            db.collection('users').doc(email).set({
                classes: { [classname]: groupDocRef.id }
            }, { merge: true })
        );
        await Promise.all(userUpdates);

        res.status(200).json({ message: `Group created successfully with ID: ${groupDocRef.id}` });
    } catch (error) {
        console.error("Error creating class or group:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { createClass };
