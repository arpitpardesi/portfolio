import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock react-router-dom v7 for CRA Jest compatibility
jest.mock('react-router-dom', () => ({
    HashRouter: ({ children }) => <div data-testid="router">{children}</div>,
    Routes: ({ children }) => <div data-testid="routes">{children}</div>,
    Route: ({ element }) => <div data-testid="route">{element}</div>,
    Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
    Navigate: ({ to }) => <div data-testid="navigate">{to}</div>,
    useLocation: () => ({ pathname: '/' }),
    useNavigate: () => jest.fn()
}), { virtual: true });

// Mock Firebase module to prevent network calls during testing
jest.mock('./firebase', () => ({
    auth: {},
    db: {},
    storage: {}
}));

jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    doc: jest.fn(),
    onSnapshot: jest.fn().mockImplementation(() => jest.fn()),
    updateDoc: jest.fn().mockResolvedValue(),
    setDoc: jest.fn().mockResolvedValue(),
    increment: jest.fn(),
    collection: jest.fn(),
    addDoc: jest.fn().mockResolvedValue()
}));

jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(),
    onAuthStateChanged: jest.fn().mockImplementation((auth, callback) => {
        return jest.fn();
    }),
    setPersistence: jest.fn().mockResolvedValue(),
    browserSessionPersistence: {}
}));

import App from './App';

test('renders portfolio app without crashing', async () => {
    render(<App />);
    const headerElement = screen.getByRole('banner');
    expect(headerElement).toBeInTheDocument();
});
