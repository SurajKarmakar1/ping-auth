import { useState, useCallback } from 'react';
import { GOOGLE_API_GATEWAY_URL } from '../config/authConfig';

export const useDeviceAPI = () => {
  const [phoneNumber, setPhoneNumber] = useState('+1234567890');
  const [identifierResult, setIdentifierResult] = useState(null);
  const [typeResult, setTypeResult] = useState(null);
  const [ppidResult, setPpidResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiValidationResult, setApiValidationResult] = useState('');

  const fetchDeviceInfo = useCallback(async (accessToken) => {
    if (!accessToken) {
      setApiValidationResult('No access token available. Please login first.');
      return;
    }

    if (!phoneNumber.trim()) {
      setApiValidationResult('Please enter a valid phone number.');
      return;
    }

    setLoading(true);
    setApiValidationResult('');

    try {
      const deviceBody = {
        device: { phoneNumber },
      };
      const baseUrl = `${GOOGLE_API_GATEWAY_URL}/device-identifier`;
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      };

      const [idRes, typeRes, ppidRes] = await Promise.all([
        fetch(`${baseUrl}/retrieve-identifier`, { method: 'POST', headers, body: JSON.stringify(deviceBody) }),
        fetch(`${baseUrl}/retrieve-type`, { method: 'POST', headers, body: JSON.stringify(deviceBody) }),
        fetch(`${baseUrl}/retrieve-ppid`, { method: 'POST', headers, body: JSON.stringify(deviceBody) }),
      ]);

      let allSuccess = true;

      if (idRes.ok) {
        setIdentifierResult(await idRes.json());
      } else {
        allSuccess = false;
        setIdentifierResult({ error: `${idRes.status}: ${await idRes.text()}` });
      }

      if (typeRes.ok) {
        setTypeResult(await typeRes.json());
      } else {
        allSuccess = false;
        setTypeResult({ error: `${typeRes.status}: ${await typeRes.text()}` });
      }

      if (ppidRes.ok) {
        setPpidResult(await ppidRes.json());
      } else {
        allSuccess = false;
        setPpidResult({ error: `${ppidRes.status}: ${await ppidRes.text()}` });
      }

      setApiValidationResult(allSuccess ? '✅ All device APIs successful!' : '⚠️ Some APIs failed. Check results below.');
    } catch (err) {
      setApiValidationResult(`❌ Network error: ${err.message}`);
      setIdentifierResult(null);
      setTypeResult(null);
      setPpidResult(null);
    } finally {
      setLoading(false);
    }
  }, [phoneNumber]);

  const resetResults = useCallback(() => {
    setIdentifierResult(null);
    setTypeResult(null);
    setPpidResult(null);
    setApiValidationResult('');
    setPhoneNumber('+1234567890');
  }, []);

  return {
    phoneNumber,
    onPhoneNumberChange: (e) => setPhoneNumber(e.target.value),
    identifierResult,
    typeResult,
    ppidResult,
    loading,
    apiValidationResult,
    fetchDeviceInfo,
    resetResults,
  };
};
