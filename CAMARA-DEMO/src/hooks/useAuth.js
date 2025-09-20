import { useState, useCallback } from 'react';
import { CLIENT_ID, CLIENT_SECRET, ENVIRONMENT_ID, POLICIES, TOKEN_URL } from '../config/authConfig';

export const useAuth = () => {
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [useMFA, setUseMFA] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationInfo, setVerificationInfo] = useState({ uri: '', code: '' });

  const requestDeviceAuthorization = useCallback(async () => {
    try {
      const bodyParams = new URLSearchParams({
        scope: 'openid profile email p1:read:device p1:read:user',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      });

      if (useMFA) {
        bodyParams.append('acr_values', POLICIES.MULTI_FACTOR);
        console.log('Requesting MFA authentication with policy:', POLICIES.MULTI_FACTOR);
      } else {
        bodyParams.append('acr_values', POLICIES.SINGLE_FACTOR);
        console.log('Requesting Single-Factor authentication with policy:', POLICIES.SINGLE_FACTOR);
      }

      const response = await fetch(
        `https://auth.pingone.sg/${ENVIRONMENT_ID}/as/device_authorization`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: bodyParams,
        }
      );

      if (!response.ok) {
        throw new Error(`Device authorization failed: ${await response.text()}`);
      }

      const deviceAuth = await response.json();
      return deviceAuth;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [useMFA]);

  const pollForToken = useCallback(async (deviceCode, interval = 5000) => {
    try {
      const response = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
          device_code: deviceCode,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        if (text.includes('authorization_pending')) {
          setTimeout(() => pollForToken(deviceCode, interval), interval);
          return;
        }
        throw new Error(`Token request failed: ${text}`);
      }

      const tokens = await response.json();
      const accessTokenVal = tokens.access_token;
      const refreshTokenVal = tokens.refresh_token;

      setAccessToken(accessTokenVal);
      setRefreshToken(refreshTokenVal || '');
      setAuthMessage('✅ User login successful!');
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    console.log('useAuth login called');
    setLoading(true);
    setError('');

    try {
      const deviceAuth = await requestDeviceAuthorization();

      setVerificationInfo({
        uri: deviceAuth.verification_uri,
        code: deviceAuth.user_code,
      });
      setShowVerificationModal(true);

      pollForToken(deviceAuth.device_code);
    } catch (err) {
      setLoading(false);
    }
  }, [requestDeviceAuthorization, pollForToken]);

  const handleMFAChange = useCallback((e) => {
    setUseMFA(e.target.checked);
  }, []);

  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) return;

    setLoading(true);
    try {
      const bodyParams = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: refreshToken,
      });

      const response = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyParams,
      });

      if (!response.ok) {
        throw new Error(`Refresh failed: ${await response.text()}`);
      }

      const tokens = await response.json();
      setAccessToken(tokens.access_token);
      if (tokens.refresh_token) setRefreshToken(tokens.refresh_token);
      setAuthMessage('');
      setError(''); // Clear any error on success
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [refreshToken]);

  const logout = useCallback(() => {
    setAccessToken('');
    setRefreshToken('');
    setAuthMessage('');
    setError('');
    setShowVerificationModal(false);
    setUseMFA(false);
  }, []);

  const closeVerificationModal = useCallback(() => {
    setShowVerificationModal(false);
    setLoading(false);
  }, []);

  return {
    accessToken,
    refreshToken,
    loading,
    error,
    authMessage,
    useMFA,
    showVerificationModal,
    verificationInfo,
    login,
    handleMFAChange,
    refreshAccessToken,
    logout,
    closeVerificationModal,
  };
};
