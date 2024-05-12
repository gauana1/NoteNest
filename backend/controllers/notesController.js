const { subscribe } = require('diagnostics_channel');
const admin = require('firebase-admin');
require('dotenv').config();
const OpenAI = require("openai");
const {Pinecone} = require("@pinecone-database/pinecone");

// Initialize OpenAI client using API key from environment variables
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // This is also the default, can be omitted
});


const pc = new Pinecone({
    apiKey: '4cc31e9c-aee2-4b49-9b6b-60fd136ba69b'
});

const index = pc.index('notes-compiler');




const saveNotes = async (req, res) => {
    const { groupId } = req.params;
    const { notes } = req.body;
    const token = req.headers.authorization.split('Bearer ')[1];

    if (!token) {
        return res.status(401).send('Authorization token is required');
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const userId = decodedToken.uid;
        const db = admin.firestore();
        const docRef = db.collection('notes').doc(groupId).collection('userId').doc(userId);

        await docRef.set({ notes: notes });
        const sections = await generateCompletion(notes);
        let embeddings = await text_to_embeddings(sections);
        await upsertEmbeddings(embeddings, userId, groupId);
        res.status(200).json({ message: 'Notes saved and inserted successfully' });
    } catch (error) {
        console.error('Failed to save notes:', error);
        res.status(500).send('Failed to authenticate or save data');
    }
};

const getNotes = async (req, res) => {
    const { groupId } = req.params;
    const token = req.headers.authorization.split('Bearer ')[1];

    if (!token) {
        return res.status(401).send('Authorization token is required');
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const userId = decodedToken.uid;
        const db = admin.firestore();
        const docRef = db.collection('notes').doc(groupId).collection('userId').doc(userId);

        const doc = await docRef.get();
        if (!doc.exists) {
            res.status(404).send('No notes found');
        } else {
            res.status(200).json(doc.data());
        }
    } catch (error) {
        console.error('Failed to retrieve notes:', error);
        res.status(500).send('Failed to authenticate or retrieve data');
    }
};

const reformatNotes = async (req, res) => {
    const { groupId } = req.params;
    const token = req.headers.authorization.split('Bearer ')[1];

    if (!token) {
        return res.status(401).send('Authorization token is required');
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const userId = decodedToken.uid;
        const notes = req.body.notes;

        const gptResponse = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: "Reformat the following notes into structured subsections:\n\n" + notes,
            max_tokens: 1500
        });

        const formattedNotes = gptResponse.data.choices[0].text.trim();
        const db = admin.firestore();
        const docRef = db.collection('notes').doc(groupId).collection('userId').doc(userId);

        await docRef.set({ notes: formattedNotes });

        res.status(200).json({ message: 'Notes reformatted and saved successfully', reformattedNotes: formattedNotes });
    } catch (error) {
        console.error('Failed to reformat and save notes:', error);
        res.status(500).send('Failed to authenticate or save data');
    }
};

const generateCompletion = async (notes) => {
    const p = "Compile the provided notes into a structured compilation with clear subtitles and bullet points under each subtitle, maintaining the original content of the notes. Ensure that code segments are enclosed in quotation marks. Start each section with the delimiter '!!!' on a separate line followed by the subtitle. The resulting compilation should follow a logical flow, with each subtitle summarizing the content of its corresponding section and bullet points providing concise summaries of the main points or details mentioned in the notes. By following these guidelines, the compiled notes will be easier to navigate and understand."
    const promptText = `${p} -  Here are the notes:${notes}`;

    try {
        const completionResponse = await openai.completions.create({
            model: 'gpt-3.5-turbo-instruct',
            prompt: promptText,
            max_tokens: 1500
        });
        const text = completionResponse["choices"][0]["text"].trim();
        const sections = parse_text_to_subsections(text);
        return sections;
    } catch (error) {
        console.error('Error generating completion:', error);
        throw error;
    }
}

function parse_text_to_subsections(text, separator='!!!') {
    const subsections = [];
    const lines = text.split('\n');

    let currentSubsection = null;

    for (const line of lines) {
        if (line.startsWith(separator)) {
            if (currentSubsection !== null) {
                subsections.push(currentSubsection);
            }
            currentSubsection = { title: line.substring(separator.length).trim(), content: [] };
        } else if (currentSubsection !== null) {
            currentSubsection.content.push(line.trim());
        }
    }

    // Push the last subsection
    if (currentSubsection !== null) {
        subsections.push(currentSubsection);
    }
    console.log(subsections);
    return subsections;
}
const text_to_embeddings = async (subsections)  => {
    const embeddings = [];

    for (const subsection of subsections) {
        const text = subsection.content.join(' '); // Concatenate content into a single string

        try {
            // Use OpenAI to generate embedding for the text
            const embedding = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: text,
                encoding_format: "float",
                max_tokens: 1000, // Adjust max_tokens as needed
            });

            // Extract the embedding from the response            
            // Store the title and embedding in the embeddings array
            embeddings.push({ title: subsection.title, embedding: embedding });
        } catch (error) {
            console.error('Error generating embedding:', error);
            // Handle error
        }
    }
    return embeddings;
}

async function upsertEmbeddings(embeddings, userId, groupId)  {
    try {
        let vectors = [];

        // Generate embeddings for each subsection and format the data
        for (let i = 0; i < embeddings.length; i++) {
            const embedding = embeddings[i];
            console.log(embedding);
            
            // Construct the vector object with id, values, and metadata
            const vector = {
                id: `vec_${userId}_${groupId}_${i+1}`, // Assign a unique id for each subsection
                values: embedding.embedding.data[0].embedding, // Use the embedding values directly
                metadata: {
                    title: embedding.title
                    // You can add more metadata if needed
                }
            };
            vectors.push(vector);
        }
        // Perform upsert operation using Pinecone client
        console.log(groupId);
        await index.namespace(`${groupId}`).upsert(vectors);

        console.log('Subsections upserted successfully.');
    } catch (error) {
        console.error('Error upserting subsections:', error);
        // Handle error
    }
}

module.exports = {
    saveNotes, getNotes, reformatNotes
};
