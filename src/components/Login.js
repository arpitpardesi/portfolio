import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEye, FaEyeSlash, FaCheckCircle, FaExclamationCircle, FaTimes, FaLock } from 'react-icons/fa';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [touched, setTouched] = useState({ email: false, password: false });
    const [retryCountDown, setRetryCountDown] = useState(0);
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetStatus, setResetStatus] = useState({ loading: false, error: '', success: false });
    const { login, resetPassword } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        let timer;
        if (retryCountDown > 0) {
            timer = setInterval(() => {
                setRetryCountDown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [retryCountDown]);

    // Email validation
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const isFormValid = email && password && validateEmail(email) && password.length >= 6;

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Mark all fields as touched
        setTouched({ email: true, password: true });

        // Check for validation errors
        if (!isFormValid) {
            setError('Please check your email and password');
            return;
        }

        setError('');
        setLoading(true);

        try {
            await login(email, password);
            setSuccess(true);

            // Redirect after success animation
            setTimeout(() => {
                navigate('/admin');
            }, 1500);
        } catch (err) {
            setSuccess(false);

            // Detailed Firebase error handling
            let errorMessage = 'Failed to sign in';

            console.error("Login Error:", err.code, err.message); // Debugging

            switch (err.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                case 'auth/invalid-login-credentials': // New standard error
                    errorMessage = 'Invalid email or password';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email format';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'This account has been disabled';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many attempts. Please wait';
                    setRetryCountDown(60); // Start 60s countdown
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Check your connection';
                    break;
                default:
                    errorMessage = 'An error occurred during login';
            }

            setError(errorMessage);
        }

        setLoading(false);
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setResetStatus({ loading: true, error: '', success: false });

        if (!validateEmail(resetEmail)) {
            setResetStatus({ loading: false, error: 'Please enter a valid email address', success: false });
            return;
        }

        try {
            await resetPassword(resetEmail);
            setResetStatus({ loading: false, error: '', success: true });
        } catch (err) {
            let msg = 'Failed to reset password';
            if (err.code === 'auth/user-not-found') msg = 'No account found with this email';
            if (err.code === 'auth/invalid-email') msg = 'Invalid email address';
            setResetStatus({ loading: false, error: msg, success: false });
        }
    };

    const handleBlur = (field) => {
        setTouched({ ...touched, [field]: true });
    };

    return (
        <section style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 10,
            padding: 'calc(2rem + env(safe-area-inset-top)) 1rem 2rem'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    x: error ? [0, -10, 10, -10, 10, 0] : 0 // Shake animation
                }}
                transition={{
                    duration: 0.5,
                    type: 'spring',
                    stiffness: 100,
                    x: { duration: 0.4 } // Shake duration
                }}
                style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '3rem',
                    borderRadius: '24px',
                    width: '100%',
                    maxWidth: '440px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 1px rgba(255, 255, 255, 0.1)'
                }}
            >
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ textAlign: 'center', marginBottom: '2.5rem' }}
                >
                    <h2 style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        marginBottom: 0
                    }}>
                        <span style={{ color: 'var(--accent-color)' }}>Admin </span>
                        <span style={{ color: '#fff' }}>Login</span>
                    </h2>
                </motion.div>

                {/* Error Message */}
                <AnimatePresence>
                    {error && !success && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginBottom: '1.5rem' }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '12px',
                                padding: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                overflow: 'hidden'
                            }}
                        >
                            <FaExclamationCircle style={{
                                color: '#ef4444',
                                fontSize: '1.2rem',
                                flexShrink: 0
                            }} />
                            <span style={{
                                color: '#fca5a5',
                                fontSize: '0.9rem',
                                lineHeight: '1.4'
                            }}>
                                {error}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Success Message */}
                <AnimatePresence>
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            style={{
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                borderRadius: '12px',
                                padding: '1rem',
                                marginBottom: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}
                        >
                            <FaCheckCircle style={{ color: '#10b981', fontSize: '1.2rem' }} />
                            <span style={{ color: '#6ee7b7', fontSize: '0.9rem' }}>
                                Login successful! Redirecting...
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Email Field */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.9rem',
                            fontWeight: '500'
                        }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                            onBlur={() => handleBlur('email')}
                            disabled={loading || success}
                            placeholder="admin@example.com"
                            style={{
                                ...inputStyle,
                                borderColor: touched.email && !validateEmail(email) && email
                                    ? 'rgba(239, 68, 68, 0.5)'
                                    : 'rgba(255, 255, 255, 0.1)'
                            }}
                        />
                        {touched.email && !email && (
                            <span style={errorTextStyle}>Email is required</span>
                        )}
                        {touched.email && email && !validateEmail(email) && (
                            <span style={errorTextStyle}>Please enter a valid email</span>
                        )}
                    </motion.div>

                    {/* Password Field */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.9rem',
                            fontWeight: '500'
                        }}>
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
                                onBlur={() => handleBlur('password')}
                                disabled={loading || success}
                                placeholder="Enter your password"
                                style={{
                                    ...inputStyle,
                                    paddingRight: '45px',
                                    borderColor: touched.password && password && password.length < 6
                                        ? 'rgba(239, 68, 68, 0.5)'
                                        : 'rgba(255, 255, 255, 0.1)'
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading || success}
                                style={{
                                    position: 'absolute',
                                    right: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'rgba(255, 255, 255, 0.5)',
                                    cursor: 'pointer',
                                    fontSize: '1.1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0.5rem',
                                    transition: 'color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {touched.password && password && password.length < 6 && (
                            <span style={errorTextStyle}>Password must be at least 6 characters</span>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                            <button
                                type="button"
                                onClick={() => setShowResetModal(true)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    padding: 0,
                                    transition: 'color 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.color = 'var(--accent-color)'}
                                onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.6)'}
                            >
                                Forgot Password?
                            </button>
                        </div>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        disabled={loading || success || retryCountDown > 0}
                        whileHover={!loading && !success && retryCountDown === 0 ? { scale: 1.02, boxShadow: '0 6px 25px rgba(var(--accent-rgb), 0.4)' } : {}}
                        whileTap={!loading && !success && retryCountDown === 0 ? { scale: 0.98 } : {}}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        style={{
                            padding: '14px',
                            marginTop: '0.5rem',
                            background: loading || success || retryCountDown > 0
                                ? 'rgba(var(--accent-rgb), 0.5)'
                                : 'var(--accent-color)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '1.05rem',
                            fontWeight: '600',
                            cursor: loading || success || retryCountDown > 0 ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 20px rgba(var(--accent-rgb), 0.3)',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                        border: '2px solid rgba(255, 255, 255, 0.3)',
                                        borderTopColor: '#fff',
                                        borderRadius: '50%'
                                    }}
                                />
                                Signing in...
                            </span>
                        ) : retryCountDown > 0 ? (
                            `Try again in ${retryCountDown}s`
                        ) : success ? (
                            'Success!'
                        ) : (
                            'Sign In'
                        )}
                    </motion.button>
                </form>
            </motion.div>

            {/* Password Reset Modal */}
            <AnimatePresence>
                {showResetModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(5px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 100,
                        padding: '1rem'
                    }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            style={{
                                background: '#1a1a1a',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '20px',
                                padding: '2rem',
                                width: '100%',
                                maxWidth: '400px',
                                position: 'relative',
                                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
                            }}
                        >
                            <button
                                onClick={() => setShowResetModal(false)}
                                style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    background: 'none',
                                    border: 'none',
                                    color: 'rgba(255, 255, 255, 0.5)',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem'
                                }}
                            >
                                <FaTimes />
                            </button>

                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    background: 'rgba(var(--accent-rgb), 0.1)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1rem',
                                    color: 'var(--accent-color)',
                                    fontSize: '1.5rem'
                                }}>
                                    <FaLock />
                                </div>
                                <h3 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.5rem' }}>Reset Password</h3>
                                <p style={{ color: 'rgba(255, 255, 255, 0.6)', margin: 0, fontSize: '0.9rem' }}>
                                    Enter your email to receive reset instructions
                                </p>
                            </div>

                            {resetStatus.success ? (
                                <div style={{
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    borderRadius: '12px',
                                    padding: '1rem',
                                    textAlign: 'center',
                                    color: '#6ee7b7'
                                }}>
                                    <FaCheckCircle style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block', margin: '0 auto 0.5rem' }} />
                                    Check your email for the reset link!
                                    <button
                                        onClick={() => setShowResetModal(false)}
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            marginTop: '1rem',
                                            padding: '0.75rem',
                                            background: '#10b981',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Close
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handlePasswordReset}>
                                    {resetStatus.error && (
                                        <div style={{
                                            padding: '0.75rem',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                            borderRadius: '8px',
                                            color: '#fca5a5',
                                            marginBottom: '1rem',
                                            fontSize: '0.9rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <FaExclamationCircle /> {resetStatus.error}
                                        </div>
                                    )}
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            color: '#fff',
                                            fontSize: '1rem',
                                            marginBottom: '1.5rem',
                                            outline: 'none'
                                        }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={resetStatus.loading}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: resetStatus.loading ? 'rgba(var(--accent-rgb), 0.5)' : 'var(--accent-color)',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            cursor: resetStatus.loading ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        {resetStatus.loading ? 'Sending...' : 'Send Reset Link'}
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                input::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                }
                
                input:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                
                input:focus {
                    border-color: var(--accent-color) !important;
                    background: rgba(255, 255, 255, 0.06) !important;
                    outline: none;
                }
                
                @media (max-width: 768px) {
                    section > div {
                        padding: 2rem 1.5rem !important;
                        margin: 0 1rem;
                    }
                }
            `}</style>
        </section>
    );
};

const inputStyle = {
    width: '100%',
    padding: '13px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(255, 255, 255, 0.04)',
    color: '#fff',
    fontSize: '1rem',
    transition: 'all 0.3s ease'
};

const errorTextStyle = {
    display: 'block',
    color: '#fca5a5',
    fontSize: '0.8rem',
    marginTop: '0.4rem',
    marginLeft: '0.25rem'
};

export default Login;