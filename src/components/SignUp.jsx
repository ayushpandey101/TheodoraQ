import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../services/api';
import { useGoogleAuth, renderGoogleButton } from '../hooks/useGoogleAuth';

/**
 * A modern, two-panel signup component matching the login design.
 * Features a background image in the left panel and a clean form in the right.
 * Includes a toggle for "Candidate" and "Admin" account types.
 */
function SignUp({ onNavigate }) {
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  
  // Load Google Auth script
  useGoogleAuth(GOOGLE_CLIENT_ID);
  // STATE: Stores account type
  const [accountType, setAccountType] = useState('candidate'); // 'candidate' or 'admin'

  // STATE: Stores form data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // STATE: Toggles password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // STATE: Stores form validation errors
  const [errors, setErrors] = useState({});

  // STATE: Tracks loading state during form submission
  const [isLoading, setIsLoading] = useState(false);

  // STATE: Tracks successful signup
  const [signupSuccess, setSignupSuccess] = useState(false);

  // EFFECT: Load Google Fonts (Playfair Display and Inter)
  useEffect(() => {
    const link = document.createElement('link');
    link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Playfair+Display:wght@700&display=swap";
    link.rel = 'stylesheet';
    document.head.appendChild(link);

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
    setSignupSuccess(false);
  };

  // FUNCTION: Check password strength
  const checkPasswordStrength = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
      isStrong: hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar
    };
  };

  // FUNCTION: Validate form data
  const validateForm = () => {
    const newErrors = {};
    
    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else {
      const strength = checkPasswordStrength(formData.password);
      if (!strength.isStrong) {
        newErrors.password = 'Password must contain uppercase, lowercase, number, and special character';
      }
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  // FUNCTION: Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSignupSuccess(false);
    setErrors({});
    
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call backend API
      const response = await authAPI.register({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: accountType
      });
      
      console.log('Sign up successful!', response);
      setIsLoading(false);
      setSignupSuccess(true);
      
      // Redirect to login page after successful signup
      setTimeout(() => {
        onNavigate('login');
      }, 2000);
      
    } catch (error) {
      setIsLoading(false);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      setErrors({ submit: errorMessage });
      console.error('Registration error:', error);
    }
  };

  // FUNCTION: Handle Google Sign Up
  const handleGoogleSignUp = async (response) => {
    try {
      setIsLoading(true);
      
      const result = await authAPI.googleAuth(response.credential, accountType);
      
      console.log('Google signup successful!', result);
      
      // Store token and user data
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      setIsLoading(false);
      setSignupSuccess(true);
      
      // Redirect to login page
      setTimeout(() => {
        onNavigate('login');
      }, 2000);
      
    } catch (error) {
      setIsLoading(false);
      const errorMessage = error.response?.data?.message || 'Google signup failed. Please try again.';
      setErrors({ submit: errorMessage });
      console.error('Google signup error:', error);
    }
  };

  // Initialize Google button with retry logic
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 20;
    
    const initGoogleButton = () => {
      if (GOOGLE_CLIENT_ID && window.google) {
        try {
          renderGoogleButton('googleSignUpButton', GOOGLE_CLIENT_ID, handleGoogleSignUp, {
            theme: 'outline',
            size: 'large',
            text: 'signup_with',
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
  }, [GOOGLE_CLIENT_ID, accountType]);

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
      
      {/* MAIN CARD */}
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row relative md:h-[700px]">
        
        {/* --- LEFT COLUMN (Image Panel) --- */}
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

        {/* --- RIGHT COLUMN (Form) --- */}
        <div className="md:w-7/12 py-6 px-12 md:px-0 md:pl-28 md:pr-16 bg-white flex flex-col justify-center items-center rounded-2xl h-full">
          
          <div className="w-full max-w-sm">
            {/* Logo */}
            <div className="mb-4">
              <TheodoraQLogo />
            </div>

            {/* Title */}
            <h2 className="font-serif text-2xl font-bold text-gray-800 mb-4 text-center">
              Create an Account
            </h2>

            {/* Success Message */}
            {signupSuccess && (
              <div className="mb-2 text-sm text-green-700 bg-green-100 border border-green-300 rounded-lg p-2 text-center flex items-center justify-center gap-2">
                <span className="text-lg">✓</span>
                <span>Account created successfully! Redirecting to login...</span>
              </div>
            )}

            {/* Error Message */}
            {errors.submit && (
              <div className="mb-2 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg p-2 text-center flex items-center justify-center gap-2">
                <span className="text-lg">⚠</span>
                <span>{errors.submit}</span>
              </div>
            )}

            {/* FORM SECTION */}
            <form onSubmit={handleSubmit} className="space-y-3">
              
              {/* ACCOUNT TYPE TOGGLE */}
              <div className="space-y-1">
                <label className="font-sans text-sm font-medium text-gray-500 block">
                  Account Type
                </label>
                <div className="flex w-full rounded-lg bg-gray-100 p-1">
                  <button
                    type="button"
                    onClick={() => setAccountType('candidate')}
                    className={`
                      w-1/2 py-2 text-sm font-semibold rounded-md
                      transition-colors duration-200
                      ${accountType === 'candidate' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    Candidate
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('admin')}
                    className={`
                      w-1/2 py-2 text-sm font-semibold rounded-md
                      transition-colors duration-200
                      ${accountType === 'admin' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    Admin
                  </button>
                </div>
              </div>

              {/* FULL NAME INPUT GROUP */}
              <div className="space-y-1">
                <label 
                  htmlFor="fullName" 
                  className="font-sans text-sm font-medium text-gray-500 block"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={`
                    w-full px-4 py-2.5 text-sm 
                    rounded-lg bg-gray-100 border-transparent 
                    focus:bg-white focus:border-gray-300
                    focus:outline-none focus:ring-2 focus:ring-purple-500
                    transition-all duration-200
                    ${errors.fullName ? 'ring-2 ring-red-500 bg-red-50' : ''}
                  `}
                />
                {errors.fullName && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <span>⚠</span> {errors.fullName}
                  </p>
                )}
              </div>

              {/* EMAIL INPUT GROUP */}
              <div className="space-y-1">
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
                    w-full px-4 py-2.5 text-sm 
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
              <div className="space-y-1">
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
                    placeholder="Min 8 chars with uppercase, number & symbol"
                    className={`
                      w-full px-4 py-2.5 text-sm
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
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <span>⚠</span> {errors.password}
                  </p>
                )}
              </div>

              {/* CONFIRM PASSWORD INPUT GROUP */}
              <div className="space-y-1">
                <label 
                  htmlFor="confirmPassword" 
                  className="font-sans text-sm font-medium text-gray-500 block"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className={`
                      w-full px-4 py-2.5 text-sm
                      rounded-lg bg-gray-100 border-transparent 
                      focus:bg-white focus:border-gray-300
                      focus:outline-none focus:ring-2 focus:ring-purple-500
                      transition-all duration-200
                      ${errors.confirmPassword ? 'ring-2 ring-red-500 bg-red-50' : ''}
                    `}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <span>⚠</span> {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* SIGN UP BUTTON */}
              <button
                type="submit"
                disabled={isLoading}
                className="
                  w-full py-2.5 px-4 text-sm font-sans
                  bg-gray-900 hover:bg-gray-800
                  text-white font-semibold rounded-lg 
                  shadow-lg shadow-gray-900/20
                  transform hover:-translate-y-0.5 
                  transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2
                "
              >
                {isLoading ? 'Creating...' : 'Create Account'}
              </button>

              {/* OR Divider */}
              <div className="relative flex items-center justify-center py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative bg-white px-3">
                  <span className="text-sm text-gray-500 font-medium">or</span>
                </div>
              </div>

              {/* Google Sign Up Button */}
              <div id="googleSignUpButton" className="w-full"></div>
            </form>

            {/* FOOTER */}
            <p className="font-sans text-center text-sm text-gray-600 mt-4">
              Already have an account?{' '}
              <button 
                onClick={() => onNavigate('login')}
                className="font-sans text-purple-600 font-semibold hover:text-purple-700 hover:underline bg-transparent border-none cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default SignUp;