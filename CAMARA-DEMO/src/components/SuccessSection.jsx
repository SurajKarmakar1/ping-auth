// SuccessSection.jsx
import React from "react";

const getAcrFromToken = (token) => {
  try {
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    return tokenPayload.acr || "Not specified";
  } catch (e) {
    return "Could not decode";
  }
};

const SuccessSection = ({ 
  accessToken, 
  apiValidationResult, 
  useMFA, 
  onRefreshAccessToken, 
  onLogout 
}) => {
  if (!accessToken) return null;

  const acrValue = getAcrFromToken(accessToken);

  return (
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
        {/* Display ACR value directly from token */}
        <p className="text-gray-600 text-sm mt-1">
          Authentication Level: <span className="font-semibold">{acrValue}</span>
        </p>
      </div>

      {/* JWT TOKEN DISPLAY */}
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
          onClick={onRefreshAccessToken}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
        >
          Refresh Token
        </button>
        
        <button
          onClick={onLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default SuccessSection;
