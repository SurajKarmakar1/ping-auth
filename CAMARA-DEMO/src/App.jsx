// src/App.js - CUSTOM LOGIN VERSION WITH GOOGLE API GATEWAY INTEGRATION
import React, { useState } from "react";
import Header from "./components/Header";
import LoginForm from "./components/LoginForm";
import SuccessSection from "./components/SuccessSection";

import VerificationModal from "./components/VerificationModal";
import Footer from "./components/Footer";

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
  const [password, setPassword] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiValidationResult, setApiValidationResult] = useState("");
  const [useMFA, setUseMFA] = useState(false);
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
        `https://auth.pingone.sg/${ENVIRONMENT_ID}/as/device_authorization`, // 
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
      const accessToken = tokens.access_token;
      const refreshToken = tokens.refresh_token;
      
      // ✅ SET THE JWT TOKEN - This is what you want!
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);

      // Test API Gateway with the JWT token
      await testApiEndpoints(accessToken);
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // NEW FUNCTION: Refresh Access Token
  const refreshAccessToken = async () => {
    try {
      const response = await fetch(TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        }),
      });

      if (!response.ok) {
        throw new Error(`Refresh failed: ${await response.text()}`);
      }

      const tokens = await response.json();
      const accessToken = tokens.access_token;
      setAccessToken(accessToken); // ✅ Update token display
      
      await testApiEndpoints(accessToken);
    } catch (err) {
      setError(err.message);
    }
  };

  // NEW FUNCTION: Test actual API endpoints with the JWT token
  const testApiEndpoints = async (token) => {
    const testRequestBody = {
      device: {
        phoneNumber: "+1234567890",
      },
    };

    try {
      const response = await fetch(
        `${GOOGLE_API_GATEWAY_URL}/device-identifier/retrieve-identifier`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Sending JWT token to API Gateway
            "Content-Type": "application/json",
          },
          body: JSON.stringify(testRequestBody),
        }
      );

      if (response.ok) {
        const result = await response.json();
        setApiValidationResult(
          "✅ API call successful! Token validated by Google API Gateway"
        );
        console.log("API Response:", result);
      } else {
        const errorText = await response.text();
        setApiValidationResult(
          `❌ API call failed (${response.status}): ${errorText}`
        );
      }
    } catch (error) {
      setApiValidationResult(`❌ API call error: ${error.message}`);
    }
  };

  const logout = () => {
    setAccessToken("");
    setRefreshToken("");
    setUsername("");
    setPassword("");
    setApiValidationResult("");
    setShowVerificationModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        {!accessToken ? (
          <>
            <Header />
            <LoginForm
              username={username}
              password={password}
              useMFA={useMFA}
              onUsernameChange={(e) => setUsername(e.target.value)}
              onPasswordChange={(e) => setPassword(e.target.value)}
              onMFAChange={(e) => setUseMFA(e.target.checked)}
              onSubmit={login}
              loading={loading}
              error={error}
            />
          </>
        ) : (
          <SuccessSection
            accessToken={accessToken}
            apiValidationResult={apiValidationResult}
            useMFA={useMFA}
            onRefreshAccessToken={refreshAccessToken}
            onLogout={logout}
          />
        )}
        <Footer />
      </div>
      
      {/* Verification Modal */}
      <VerificationModal
        show={showVerificationModal}
        verificationInfo={verificationInfo}
        onOpenInNewTab={() => {
          window.open(verificationInfo.uri, '_blank');
          setShowVerificationModal(false);
        }}
        onClose={() => setShowVerificationModal(false)}
      />
    </div>
  );
}

export default App;
