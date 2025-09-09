// src/App.js - CUSTOM LOGIN VERSION WITH GOOGLE API GATEWAY INTEGRATION
import React, { useState } from "react";

// 🔐 REPLACE THESE VALUES
const CLIENT_ID = "your-client-id-here";
const CLIENT_SECRET = "your-client-secret-here"; // ← ONLY FOR DEMO
const ENVIRONMENT_ID = "your-env-id-here";
const TOKEN_URL = `https://auth.pingone.com/${ENVIRONMENT_ID}/as/token.oauth2`;

// 🌐 GOOGLE API GATEWAY CONFIGURATION
const GOOGLE_API_GATEWAY_URL = "https://camara-gateway-35st6xqt.uc.gateway.dev";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiValidationResult, setApiValidationResult] = useState("");

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setApiValidationResult("");

    try {
      // Encode credentials
      const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);

      // Prepare form data
      const body = new URLSearchParams({
        grant_type: "password",
        username: username,
        password: password,
        scope: "openid profile email device.read session.read",
      });

      // Call Ping Identity token endpoint
      const response = await fetch(TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${credentials}`,
        },
        body: body,
      });

      if (!response.ok) {
        throw new Error(
          `Login failed: ${response.status} ${await response.text()}`
        );
      }

      const tokens = await response.json();
      const accessToken = tokens.access_token;

      setAccessToken(accessToken);

      // NEW: Test Google API Gateway endpoints with the token
      await testApiEndpoints(accessToken);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // NEW FUNCTION: Test actual API endpoints with the token
  const testApiEndpoints = async (token) => {
    const testRequestBody = {
      device: {
        phoneNumber: "+1234567890", // Example phone number
      },
    };

    try {
      // Test the retrieve-identifier endpoint
      const response = await fetch(
        `${GOOGLE_API_GATEWAY_URL}/device-identifier/retrieve-identifier`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
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
                <span>Login</span>
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
              <p className="text-gray-600 text-sm">Login successful</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-2">
                JWT Access Token
              </h3>
              <pre className="text-xs bg-white p-3 rounded border overflow-x-auto text-gray-700 whitespace-pre-wrap break-words">
                {accessToken}
              </pre>
            </div>

            {/* NEW: API Gateway Validation Result */}
            {apiValidationResult && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-2">
                  Google API Gateway Validation
                </h3>
                <p className="text-sm text-gray-700">{apiValidationResult}</p>
              </div>
            )}

            <button
              onClick={logout}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
            >
              Logout
            </button>
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
