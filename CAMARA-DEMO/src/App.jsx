import React, { useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LoginForm from "./components/LoginForm";
import SuccessSection from "./components/SuccessSection";
import VerificationModal from "./components/VerificationModal";

// 🔐 ACTUAL VALUES
const CLIENT_ID = "b08b52a2-ee2e-430e-8e93-8e9c794d443d";
const CLIENT_SECRET ="QI2Rfl8yiqzMJsRkS7GU2L9lT9Jtn8z6Cs8s-3_I0eQnd0vhgRgLy5BhrE.mn-Cb";
const ENVIRONMENT_ID = "a0986427-cc86-4376-bff6-483e2f0d98ad";

// 🛡️ AUTHENTICATION POLICIES - Use APP policy IDs
const POLICIES = {
  SINGLE_FACTOR: "057f4d62-b480-4fa1-aaf1-bd239f21e173",  // From app
  MULTI_FACTOR: "72c165e4-ebf4-486d-aaee-973ee2093949"   // From app
};

const TOKEN_URL = `https://auth.pingone.sg/${ENVIRONMENT_ID}/as/token`;

// 🌐 GOOGLE API GATEWAY CONFIGURATION
const GOOGLE_API_GATEWAY_URL = "https://camara-gateway-35st6xqt.uc.gateway.dev";

function App() {
  const [username, setUsername] = useState("");
  const [useMFA, setUseMFA] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiValidationResult, setApiValidationResult] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+1234567890");

  // Device Identifier API results
  const [identifierResult, setIdentifierResult] = useState(null);
  const [typeResult, setTypeResult] = useState(null);
  const [ppidResult, setPpidResult] = useState(null);

  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationInfo, setVerificationInfo] = useState({ uri: '', code: '' });

  // Step 1: Request Device Authorization with CORRECT authentication method
  const requestDeviceAuthorization = async () => {
    try {
      const bodyParams = new URLSearchParams({
        scope: "openid profile email p1:read:device p1:read:user", // ✅ Updated scopes
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      });

      // Add authentication policy based on MFA setting
      if (useMFA) {
        bodyParams.append("acr_values", POLICIES.MULTI_FACTOR);
        console.log("Requesting MFA authentication with policy:", POLICIES.MULTI_FACTOR);
      } else {
        bodyParams.append("acr_values", POLICIES.SINGLE_FACTOR);
        console.log("Requesting Single-Factor authentication with policy:", POLICIES.SINGLE_FACTOR);
      }

      const response = await fetch(
        `https://auth.pingone.sg/${ENVIRONMENT_ID}/as/device_authorization`, 
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
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
  };

  // Step 2: Poll for Token
  const pollForToken = async (deviceCode, interval = 5000) => {
    try {
      const response = await fetch(TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
          device_code: deviceCode,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        if (text.includes("authorization_pending")) {
          setTimeout(() => pollForToken(deviceCode, interval), interval);
          return;
        }
        throw new Error(`Token request failed: ${text}`);
      }

      const tokens = await response.json();
      const accessTokenVal = tokens.access_token;
      const refreshTokenVal = tokens.refresh_token;
      
      // ✅ SET THE JWT TOKEN - This is what you want!
      setAccessToken(accessTokenVal);
      setRefreshToken(refreshTokenVal || "");

      setApiValidationResult("✅ User login successful!");
      // Reset device results on login
      setIdentifierResult(null);
      setTypeResult(null);
      setPpidResult(null);
      setShowVerificationModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Step 3: Login Function
  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setApiValidationResult("");

    try {
      const deviceAuth = await requestDeviceAuthorization();
      
      // Show improved verification UI instead of alert
      setVerificationInfo({
        uri: deviceAuth.verification_uri,
        code: deviceAuth.user_code
      });
      setShowVerificationModal(true);
      
      // Start polling for token
      pollForToken(deviceAuth.device_code);
    } catch (err) {
      setLoading(false);
    }
  };

  const handleMFAChange = (e) => {
    setUseMFA(e.target.checked);
  };

  // NEW FUNCTION: Refresh Access Token
  const refreshAccessToken = async () => {
    if (!refreshToken) return;

    setLoading(true);
    try {
      const bodyParams = new URLSearchParams({
        grant_type: "refresh_token",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: refreshToken,
      });

      const response = await fetch(TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: bodyParams,
      });

      if (!response.ok) {
        throw new Error(`Refresh failed: ${await response.text()}`);
      }

      const tokens = await response.json();
      setAccessToken(tokens.access_token);
      if (tokens.refresh_token) setRefreshToken(tokens.refresh_token);
      setApiValidationResult("✅ Token refreshed successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // NEW FUNCTION: Test actual API endpoints with the JWT token using user access token
  const fetchDeviceInfo = async () => {
    if (!phoneNumber.trim()) {
      setApiValidationResult("Please enter a valid phone number.");
      return;
    }

    setLoading(true);
    setApiValidationResult("");

    try {
      const deviceBody = {
        device: { phoneNumber }
      };
      const baseUrl = `${GOOGLE_API_GATEWAY_URL}/device-identifier`;
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      };

      const [idRes, typeRes, ppidRes] = await Promise.all([
        fetch(`${baseUrl}/retrieve-identifier`, { method: "POST", headers, body: JSON.stringify(deviceBody) }),
        fetch(`${baseUrl}/retrieve-type`, { method: "POST", headers, body: JSON.stringify(deviceBody) }),
        fetch(`${baseUrl}/retrieve-ppid`, { method: "POST", headers, body: JSON.stringify(deviceBody) }),
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

      setApiValidationResult(allSuccess ? "✅ All device APIs successful!" : "⚠️ Some APIs failed. Check results below.");
    } catch (err) {
      setApiValidationResult(`❌ Network error: ${err.message}`);
      setIdentifierResult(null);
      setTypeResult(null);
      setPpidResult(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAccessToken("");
    setRefreshToken("");
    setUsername("");
    setPhoneNumber("+1234567890");
    setApiValidationResult("");
    setError("");
    setIdentifierResult(null);
    setTypeResult(null);
    setPpidResult(null);
    setUseMFA(false);
    setShowVerificationModal(false);
  };

  const onPhoneNumberChange = (e) => setPhoneNumber(e.target.value);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <Header />
        {!accessToken ? (
          <LoginForm
            username={username}
            onUsernameChange={(e) => setUsername(e.target.value)}
            useMFA={useMFA}
            onMFAChange={handleMFAChange}
            onSubmit={login}
            loading={loading}
            error={error}
          />
        ) : (
          <SuccessSection
            accessToken={accessToken}
            apiValidationResult={apiValidationResult}
            phoneNumber={phoneNumber}
            onPhoneNumberChange={onPhoneNumberChange}
            identifierResult={identifierResult}
            typeResult={typeResult}
            ppidResult={ppidResult}
            onRefreshAccessToken={refreshAccessToken}
            onFetchDeviceInfo={fetchDeviceInfo}
            onLogout={logout}
            loading={loading}
            useMFA={useMFA}
          />
        )}
        <Footer />
      </div>
      
      <VerificationModal
        show={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        verificationInfo={verificationInfo}
      />
    </div>
  );
}

export default App;
