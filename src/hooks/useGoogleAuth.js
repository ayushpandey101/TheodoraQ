import { useEffect } from 'react';

/**
 * Custom hook to load and initialize Google Identity Services
 * Compatible with React 19
 */
export const useGoogleAuth = (clientId) => {
  useEffect(() => {
    if (!clientId) return;

    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) return;

    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    // Add load event listener
    script.onload = () => {
      console.log('Google Identity Services script loaded');
    };
    
    script.onerror = () => {
      console.error('Failed to load Google Identity Services script');
    };
    
    document.body.appendChild(script);

    return () => {
      // Don't remove script on cleanup to prevent re-loading
      // The script is shared across components
    };
  }, [clientId]);
};

/**
 * Initialize Google One Tap Sign-In
 */
export const initializeGoogleOneTap = (clientId, callback) => {
  if (!window.google || !clientId) return;

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: callback,
  });
};

/**
 * Render Google Sign-In Button
 */
export const renderGoogleButton = (elementId, clientId, callback, options = {}) => {
  if (!window.google || !clientId) return;

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: callback,
  });

  window.google.accounts.id.renderButton(
    document.getElementById(elementId),
    {
      theme: options.theme || 'outline',
      size: options.size || 'large',
      text: options.text || 'continue_with',
      shape: options.shape || 'rectangular',
      logo_alignment: options.logo_alignment || 'left',
      width: options.width || '100%',
    }
  );
};
