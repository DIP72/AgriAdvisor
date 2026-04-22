import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(false); // Start with false to prevent hanging

    const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000';

    // Fetch user profile on mount if token exists
    useEffect(() => {
        // Immediately set loading to false for demo mode
        setLoading(false);
        setUser(null);
    }, []);

    const login = async (googleResponse) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    googleId: googleResponse.sub,
                    email: googleResponse.email,
                    name: googleResponse.name,
                    picture: googleResponse.picture
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);
            setToken(data.token);
            setUser(data.user);
            return data.user;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const loginEmail = async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const contentType = response.headers.get("content-type");
            if (!response.ok) {
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || errorData.message || 'Login failed');
                } else {
                    const text = await response.text();
                    console.error('Server error (non-JSON):', text);
                    throw new Error(`Server error (${response.status}). Please check if the backend is running.`);
                }
            }

            if (contentType && contentType.indexOf("application/json") !== -1) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                setToken(data.token);
                setUser(data.user);
                return data.user;
            } else {
                throw new Error("Invalid response from server. Expected JSON.");
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const register = async (name, email, password) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });

            const contentType = response.headers.get("content-type");
            if (!response.ok) {
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || errorData.message || 'Signup failed');
                } else {
                    const text = await response.text();
                    console.error('Server error (non-JSON):', text);
                    throw new Error(`Server error (${response.status}). Please check if the backend is running.`);
                }
            }

            if (contentType && contentType.indexOf("application/json") !== -1) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                setToken(data.token);
                setUser(data.user);
                return data.user;
            } else {
                throw new Error("Invalid response from server. Expected JSON.");
            }
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            if (token) {
                await fetch(`${API_URL}/api/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
        }
    };

    const updateFarmInfo = async (farmData) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/farm-info`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(farmData)
            });

            if (!response.ok) {
                throw new Error('Failed to update farm info');
            }

            const data = await response.json();
            setUser(data.user);
            return data.user;
        } catch (error) {
            console.error('Update farm info error:', error);
            throw error;
        }
    };

    const value = {
        user,
        token,
        loading,
        login,
        loginEmail,
        register,
        logout,
        updateFarmInfo,
        isAuthenticated: !!user,
        isOnboarded: user?.isOnboarded || false
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
