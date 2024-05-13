// src/pages/CompiledNotes.js
import React from 'react';
import { useParams } from 'react-router-dom';

const CompiledNotes = () => {
    const { groupId } = useParams();  // Destructure classId from useParams

    React.useEffect(() => {
        // Logic to fetch compiled notes based on classId
        console.log(`Fetching compiled notes for group ID: ${groupId}`);
        // You can put fetch API call or other side effects here
    }, [groupId]);

    return (
        <div>
            <h1>Compiled Notes</h1>
            <p>Displaying compiled notes for groupId ID: {groupId}</p>
        </div>
    );
}

export default CompiledNotes;
