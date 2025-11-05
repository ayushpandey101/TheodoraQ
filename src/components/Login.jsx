import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../services/api';
import { useGoogleAuth, renderGoogleButton } from '../hooks/useGoogleAuth';

/**
 * A modern, two-panel login component matching a specific design.
 * Features a background image in the left panel and a clean form in the right.
 */
function Login({ onNavigate, onLogin }) {
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    // Load Google Auth script
    useGoogleAuth(GOOGLE_CLIENT_ID);
    // STATE: Stores form data (email, password)
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    // STATE: Toggles password visibility
    const [showPassword, setShowPassword] = useState(false);

    // STATE: Stores form validation errors
    const [errors, setErrors] =useState({});

    // STATE: Tracks loading state during form submission
    const [isLoading, setIsLoading] = useState(false);

    // STATE: Tracks successful login
    const [loginSuccess, setLoginSuccess] = useState(false);

    // STATE: Tracks login failure
    const [loginError, setLoginError] = useState('');

    // EFFECT: Load Google Fonts (Playfair Display and Inter)
    useEffect(() => {
        const link = document.createElement('link');
        link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Playfair+Display:wght@700&display=swap";
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        // Add a style tag for font-family definitions
        const style = document.createElement('style');
        style.innerHTML = `
            .font-serif { font-family: 'Playfair Display', serif; }
            .font-sans { font-family: 'Inter', sans-serif; }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(link);
            document.head.removeChild(style);
        };
    }, []);

    // FUNCTION: Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        setLoginSuccess(false);
        setLoginError('');
    };

    // FUNCTION: Validate form data
    const validateForm = () => {
        const newErrors = {};
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        }
        return newErrors;
    };

    // FUNCTION: Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoginSuccess(false);
        setLoginError('');
        setErrors({});
        
        const newErrors = validateForm();
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        setIsLoading(true);
        
        try {
            // Call backend API
            const response = await authAPI.login({
                email: formData.email,
                password: formData.password
            });
            
            console.log('Login successful!', response);
            
            // Store token and user data
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            
            setIsLoading(false);
            setLoginSuccess(true);
            setErrors({});
            setLoginError('');
            
            // Call onLogin with user data
            if (onLogin) {
                setTimeout(() => {
                    onLogin(response.user.email, '', response.user.role);
                }, 1000);
            }
            
        } catch (error) {
            setIsLoading(false);
            setLoginSuccess(false); // Clear success message on error
            console.error('Login error:', error);
            
            // Extract error message
            let errorMessage = 'Login failed. Please check your credentials.';
            if (error.response?.data) {
                if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
                    errorMessage = error.response.data.errors.join(', ');
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setLoginError(errorMessage);
        }
    };

    // FUNCTION: Handle Google Sign In
    const handleGoogleSignIn = async (response) => {
        try {
            setIsLoading(true);
            // Clear any previous errors
            setLoginError('');
            setErrors({});
            setLoginSuccess(false);
            
            // For login, we don't need to specify role (backend will use existing user's role)
            const result = await authAPI.googleAuth(response.credential, null);
            
            console.log('Google login successful!', result);
            
            // Store token and user data
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            
            setIsLoading(false);
            setLoginSuccess(true);
            
            // Call onLogin with user data
            if (onLogin) {
                setTimeout(() => {
                    onLogin(result.user.email, '', result.user.role);
                }, 1000);
            }
            
        } catch (error) {
            setIsLoading(false);
            setLoginSuccess(false); // Clear success message on error
            console.error('Google login error:', error);
            
            // Extract error message
            let errorMessage = 'Google sign-in failed. Please try again.';
            if (error.response?.data) {
                if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
                    errorMessage = error.response.data.errors.join(', ');
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setLoginError(errorMessage);
        }
    };

    // Initialize Google button with retry logic
    useEffect(() => {
        let attempts = 0;
        const maxAttempts = 20;
        
        const initGoogleButton = () => {
            if (GOOGLE_CLIENT_ID && window.google) {
                try {
                    renderGoogleButton('googleSignInButton', GOOGLE_CLIENT_ID, handleGoogleSignIn, {
                        theme: 'outline',
                        size: 'large',
                        text: 'signin_with',
                        width: '100%',
                    });
                } catch (error) {
                    console.error('Error rendering Google button:', error);
                }
            } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(initGoogleButton, 200);
            }
        };
        
        initGoogleButton();
    }, [GOOGLE_CLIENT_ID]);

    // Google 'G' logo SVG
    const GoogleG = () => (
        <svg className="w-4 h-4" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
    );    
    
    // Simple logo icon
    const TheodoraQLogo = () => (
        <div className="flex items-center justify-center gap-1">
            <img 
                src="/src/assets/dark_mode_theodoraQ_logo.svg" 
                alt="TheodoraQ Logo" 
                className="h-10 w-auto"
            />
            <span className="font-sans font-extrabold text-lg text-gray-800">TheodoraQ</span>
        </div>
    );

    return (
        // CONTAINER: Full screen, centered
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
            
            {/* MAIN CARD: 
                - REMOVED 'overflow-hidden'
                - ADDED 'relative' to allow panel overlap 
            */}
            <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row relative md:h-[700px]">
                
                {/* --- LEFT COLUMN (Image Panel) ---
                    - CHANGED width to 'md:w-1/2'
                    - KEPT 'rounded-2xl', 'relative', 'z-10'
                    - KEPT 'md:-mr-12' (negative 3rem margin) to pull it RIGHT
                */}
                <div 
                    className="md:w-1/2 p-8 md:p-16 bg-cover bg-center flex flex-col justify-between text-white rounded-2xl relative z-10 md:-mr-12 h-full min-h-[300px]"
                    style={{ backgroundImage: "url('https://plus.unsplash.com/premium_photo-1673795754005-214e3e1fccba?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cGF0dGVybnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600')" }}
                >
                    <div>
                        <p className="font-sans text-sm font-medium tracking-wider">A WISE QUOTE</p>
                    </div>
                    <div>
                        <h1 className="font-serif text-3xl font-bold leading-tight mb-4">
                            Get Everything<br/>You Want
                        </h1>
                        <p className="font-sans text-sm max-w-md">
                            You can get everything you want if you work hard, trust the process, and stick to the plan.
                        </p>
                    </div>
                </div>

                {/* --- RIGHT COLUMN (Form) ---
                    - CHANGED width to 'md:w-7/12'
                    - KEPT 'rounded-2xl'
                    - UPDATED padding to handle overlap and centering:
                        - 'py-12 px-12' (for mobile)
                        - 'md:px-0' (resets horizontal padding)
                        - 'md:pl-28' (7rem, to clear the 4rem overlap + add 3rem buffer)
                        - 'md:pr-16' (4rem, to balance the right side)
                */}
                <div className="md:w-7/12 py-10 px-12 md:px-0 md:pl-28 md:pr-16 bg-white flex flex-col justify-center items-center rounded-2xl h-full">
                    
                    <div className="w-full max-w-sm">
                        {/* Logo */}
                        <div className="mb-8">
                            <TheodoraQLogo />
                        </div>

                        {/* Title */}
                        <h2 className="font-serif text-2xl font-bold text-gray-800 mb-2 text-center">
                            Welcome Back
                        </h2>
                        <p className="font-sans text-sm text-gray-500 mb-6 text-center">
                            Enter your email and password to access your account
                        </p>

                        {/* Success Message */}
                        {loginSuccess && (
                            <div className="mb-3 text-sm text-green-700 bg-green-100 border border-green-300 rounded-lg p-2.5 text-center flex items-center justify-center gap-2">
                                <span className="text-lg">✓</span>
                                <span>Login successful! Welcome back.</span>
                            </div>
                        )}

                        {/* Error Message */}
                        {loginError && (
                            <div className="mb-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg p-2.5 text-center flex items-center justify-center gap-2">
                                <span className="text-lg">⚠</span>
                                <span>{loginError}</span>
                            </div>
                        )}

                        {/* FORM SECTION */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            
                            {/* EMAIL INPUT GROUP */}
                            <div className="space-y-1.5">
                                <label 
                                    htmlFor="email" 
                                    className="font-sans text-sm font-medium text-gray-500 block"
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    className={`
                                        w-full px-4 py-3 text-sm 
                                        rounded-lg bg-gray-100 border-transparent 
                                        focus:bg-white focus:border-gray-300
                                        focus:outline-none focus:ring-2 focus:ring-purple-500
                                        transition-all duration-200
                                        ${errors.email ? 'ring-2 ring-red-500 bg-red-50' : ''}
                                    `}
                                />
                                {errors.email && (
                                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                        <span>⚠</span> {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* PASSWORD INPUT GROUP */}
                            <div className="space-y-1.5">
                                <label 
                                    htmlFor="password" 
                                    className="font-sans text-sm font-medium text-gray-500 block"
                                >
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        className={`
                                            w-full px-4 py-3 text-sm
                                            rounded-lg bg-gray-100 border-transparent 
                                            focus:bg-white focus:border-gray-300
                                            focus:outline-none focus:ring-2 focus:ring-purple-500
                                            transition-all duration-200
                                            ${errors.password ? 'ring-2 ring-red-500 bg-red-50' : ''}
                                        `}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                        <span>⚠</span> {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* FORM OPTIONS: Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer"
                                    />
                                    <span className="font-sans text-gray-600 group-hover:text-gray-800">
                                        Remember me
                                    </span>
                                </label>
                                <a 
                                    href="#" 
                                    className="font-sans text-purple-600 hover:text-purple-700 font-medium hover:underline"
                                >
                                    Forgot Password?
                                </a>
                            </div>

                            {/* LOGIN BUTTON */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="
                                    w-full py-3 px-4 text-sm font-sans
                                    bg-gray-900 hover:bg-gray-800
                                    text-white font-semibold rounded-lg 
                                    shadow-lg shadow-gray-900/20
                                    transform hover:-translate-y-0.5 
                                    transition-all duration-200
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    flex items-center justify-center gap-2
                                "
                            >
                                {isLoading ? 'Loading...' : 'Sign In'}
                            </button>

                            {/* OR Divider */}
                            <div className="relative flex items-center justify-center py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative bg-white px-3">
                                    <span className="text-sm text-gray-500 font-medium">or</span>
                                </div>
                            </div>

                            {/* Google Sign In Button */}
                            <div id="googleSignInButton" className="w-full"></div>
                        </form>

                        {/* FOOTER */}
                        <p className="font-sans text-center text-sm text-gray-600 mt-8">
                            Don't have an account?{' '}
                            <button 
                                onClick={() => onNavigate('signup')}
                                className="font-sans text-purple-600 font-semibold hover:text-purple-700 hover:underline bg-transparent border-none cursor-pointer"
                            >
                                Sign Up
                            </button>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Login;

