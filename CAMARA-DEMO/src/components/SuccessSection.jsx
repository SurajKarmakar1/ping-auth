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
  phoneNumber,
  onPhoneNumberChange,
  identifierResult,
  typeResult,
  ppidResult,
  onRefreshAccessToken, 
  onFetchDeviceInfo,
  onLogout,
  loading,
  useMFA 
}) => {
  if (!accessToken) return null;

  const acrValue = getAcrFromToken(accessToken);

  const formatResult = (result) => {
    if (result && !result.error) {
      return (
        <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
          <pre className="text-sm text-green-800 whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
      );
    } else if (result && result.error) {
      return (
        <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
          <p className="text-sm text-red-800">Error: {result.error}</p>
        </div>
      );
    }
    return (
      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-sm text-gray-600">No result yet. Click "Fetch Device Info" to start.</p>
      </div>
    );
  };

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
          This JWT token is used for API calls to Google API Gateway
        </p>
      </div>

      {/* Device Info Section */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-medium text-gray-800 mb-4">Device Identifier APIs</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number (for device lookup)
          </label>
          <input
            type="text"
            value={phoneNumber}
            onChange={onPhoneNumberChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+1234567890"
          />
        </div>

        <button
          onClick={onFetchDeviceInfo}
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
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
              <span>Fetching...</span>
            </>
          ) : (
            <span>Fetch Device Info</span>
          )}
        </button>

        {apiValidationResult && (
          <div className={`mt-4 p-3 rounded-lg ${apiValidationResult.includes('✅') ? 'bg-green-50 border border-green-200' : apiValidationResult.includes('⚠️') ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'}`}>
            <p className="text-sm font-medium">{apiValidationResult}</p>
          </div>
        )}

        {/* Results */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <h4 className="font-medium text-gray-800 mb-2">Retrieve Identifier (IMEI/SV)</h4>
            {formatResult(identifierResult)}
          </div>
          
          <div className="md:col-span-1">
            <h4 className="font-medium text-gray-800 mb-2">Retrieve Type (Brand/Model)</h4>
            {formatResult(typeResult)}
          </div>
          
          <div className="md:col-span-1">
            <h4 className="font-medium text-gray-800 mb-2">Retrieve PPID</h4>
            {formatResult(ppidResult)}
          </div>
        </div>
      </div>

      {/* API Gateway Validation Result (fallback) */}
      {apiValidationResult && !apiValidationResult.includes('APIs') && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-800 mb-2">
            API Validation
          </h3>
          <p className="text-sm text-gray-700">{apiValidationResult}</p>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={onRefreshAccessToken}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
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
