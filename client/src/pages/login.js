import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import styles from '../styles/login.module.css';

const Login = () => {
    const navigate = useNavigate();
    const auth = getAuth();

    useEffect(() => {
        // Check the result of the redirect operation after returning to the app
        getRedirectResult(auth)
            .then((result) => {
                if (result) {
                    navigate('/dashboard');
                    fetch('/user/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: result.user.email,
                        })
                        
                    })
                }

            })
            .catch((error) => {
                console.error('Error retrieving the redirect result:', error);
            });
    }, [navigate, auth]);

    const signInWithGoogle = () => {
        const provider = new GoogleAuthProvider();
        signInWithRedirect(auth, provider)
            .catch((error) => {
                console.error('Error signing in with Google:', error);
            });
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>NoteNest</h1>
            <button className={styles.button} onClick={signInWithGoogle}>
                Sign in with Google
            </button>
        </div>
    );
};

export default Login;
