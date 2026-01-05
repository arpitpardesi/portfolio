import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, setPersistence, browserSessionPersistence } from 'firebase/auth';
import LoadingScreen from '../components/LoadingScreen';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Session Timeout Logic
    useEffect(() => {
        let timeoutId;
        const TIMEOUT_DURATION = 15 * 60 * 1000; // 15 minutes

        const resetTimer = () => {
            if (timeoutId) clearTimeout(timeoutId);
            if (currentUser) {
                timeoutId = setTimeout(() => {
                    logout();
                    alert("Session timed out due to inactivity");
                }, TIMEOUT_DURATION);
            }
        };

        const handleActivity = () => resetTimer();

        if (currentUser) {
            resetTimer(); // Start timer on login
            window.addEventListener('mousemove', handleActivity);
            window.addEventListener('keydown', handleActivity);
            window.addEventListener('click', handleActivity);
            window.addEventListener('scroll', handleActivity);
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('keydown', handleActivity);
            window.removeEventListener('click', handleActivity);
            window.removeEventListener('scroll', handleActivity);
        };
    }, [currentUser]);

    const login = async (email, password) => {
        await setPersistence(auth, browserSessionPersistence);
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        return signOut(auth);
    };

    const resetPassword = (email) => {
        return sendPasswordResetEmail(auth, email);
    };

    const value = {
        currentUser,
        login,
        logout,
        resetPassword
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? <LoadingScreen /> : children}
        </AuthContext.Provider>
    );
};
