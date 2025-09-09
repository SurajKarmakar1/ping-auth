// src/App.js - CUSTOM LOGIN VERSION WITH GOOGLE API GATEWAY INTEGRATION
import React, { useState } from "react";

// 🔐 YOUR ACTUAL VALUES
const CLIENT_ID = "758d1935-49b8-4964-acd2-f1fb2e556631";
const CLIENT_SECRET ="8MqdGkGZW8UvQbQcMotcf.mPUTo0bZF0.kO.CVwxUht4ybCXZLvOkECzjlpXMY12";
const ENVIRONMENT_ID = "627d28bb-357b-4a7b-a885-5eb6ae915663";

// 🛡️ AUTHENTICATION POLICIES
const POLICIES = {
  SINGLE_FACTOR: "f5189cff-a390-491a-948f-f7819204a2f4",
  MULTI_FACTOR: "7cfb5786-1376-4b53-b088-7952eace895b"
};

// ✅ FIXED: Removed extra spaces
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

  // Step 1: Request Device Authorization with CORRECT authentication method
  const requestDeviceAuthorization = async () => {
    try {
      const bodyParams = new URLSearchParams({
        scope: "openid profile email device.read session.read",
        client_id: CLIENT_ID,        // ✅ Send in body for Client Secret Post
        client_secret: CLIENT_SECRET, // ✅ Send in body for Client Secret Post
      });

      // Add MFA policy if requested
      if (useMFA) {
        bodyParams.append("acr_values", "Multi_Factor");
      }

      const response = await fetch(
        `https://auth.pingone.sg/${ENVIRONMENT_ID}/as/device_authorization`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: bodyParams, // ✅ Credentials in body, not header
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
      pollForToken(deviceAuth.device_code);

      // Show user instructions with MFA info
      const mfaInfo = useMFA ? " (MFA Required)" : "";
      alert(`Please go to ${deviceAuth.verification_uri} and enter code: ${deviceAuth.user_code}${mfaInfo}`);
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
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-ping rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            CAMARA 5G Platform
          </h1>
          <p className="text-gray-600 mt-2">Secure login with Ping Identity</p>
        </div>

        {!accessToken ? (
          <form onSubmit={login} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* MFA Toggle */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="mfaToggle"
                checked={useMFA}
                onChange={(e) => setUseMFA(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="mfaToggle" className="ml-2 block text-sm text-gray-700">
                Require Multi-Factor Authentication (MFA)
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ping"
                placeholder="demo@camara.test"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ping"
                placeholder="CamaraDemo123!"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-pingDark text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Logging in...</span>
                </>
              ) : (
                <span>{useMFA ? "Login with MFA" : "Login"}</span>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Welcome!</h2>
              <p className="text-gray-600 text-sm">
                Login successful {useMFA && "🔐 (MFA Enabled)"}
              </p>
            </div>

            {/* ✅ JWT TOKEN DISPLAY - This is what you want! */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-2">
                JWT Access Token
              </h3>
              <pre className="text-xs bg-white p-3 rounded border overflow-x-auto text-gray-700 whitespace-pre-wrap break-words">
                {accessToken}
              </pre>
              <p className="text-xs text-gray-500 mt-2">
                This JWT token is automatically sent to Google API Gateway below
              </p>
            </div>

            {/* API Gateway Validation Result */}
            {apiValidationResult && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-2">
                  Google API Gateway Validation
                </h3>
                <p className="text-sm text-gray-700">{apiValidationResult}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={refreshAccessToken}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                Refresh Token
              </button>
              
              <button
                onClick={logout}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Built by Suraj Karmakar — Ping Identity Team</p>
          <p className="mt-1">Custom Login Demo (Not for Production)</p>
        </div>
      </div>
    </div>
  );
}

export default App;