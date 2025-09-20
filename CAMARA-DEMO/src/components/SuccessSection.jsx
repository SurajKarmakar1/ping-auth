import React from "react";
import { getAcrFromToken } from '../utils/authUtils';

const SuccessSection = ({ 
  accessToken, 
  authMessage,
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
        <div className="border border-emerald-200 bg-emerald-50 p-4 rounded-xl">
          <pre className="text-sm text-emerald-800 font-mono whitespace-pre-wrap break-words">{JSON.stringify(result, null, 2)}</pre>
        </div>
      );
    } else if (result && result.error) {
      return (
        <div className="border border-rose-200 bg-rose-50 p-4 rounded-xl">
          <p className="text-sm text-rose-800 font-medium">Error: {result.error}</p>
        </div>
      );
    }
    return (
      <div className="border border-zinc-200 bg-zinc-50 p-4 rounded-xl">
        <p className="text-sm text-slate-600 italic">No result yet. Click "Fetch Device Info" to start.</p>
      </div>
    );
  };

  return (
    <div className="space-y-10">
      <div className="text-center pb-8 border-b border-zinc-200">
        <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Welcome!</h2>
        <p className="text-slate-600 mt-2 text-base">
          Login successful{useMFA && " with MFA"}
        </p>
        <p className="text-slate-500 text-sm mt-1">
          Authentication Level: <span className="font-semibold text-slate-900">{acrValue}</span>
        </p>
      </div>

      {/* JWT TOKEN DISPLAY */}
      <div className="border border-zinc-200 rounded-xl bg-zinc-50 p-6">
        <h3 className="font-semibold text-slate-900 mb-4 text-lg">
          JWT Access Token
        </h3>
        <pre className="text-sm bg-zinc-100 p-4 rounded-lg border border-zinc-200 overflow-x-auto font-mono text-slate-800 break-words">
          {accessToken}
        </pre>
        <p className="text-sm text-slate-500 mt-3">
          This JWT token is used for API calls to Google API Gateway
        </p>
      </div>

      {/* Auth Message */}
      {authMessage && (
        <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-4">
          <p className="text-sm text-emerald-800 font-medium">{authMessage}</p>
        </div>
      )}

      {/* Device Info Section */}
      <div className="border border-zinc-200 rounded-xl p-8">
        <h3 className="text-xl font-semibold text-slate-900 mb-8 tracking-tight">Device Identifier APIs</h3>
        
        <div className="mb-8">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Phone Number (for device lookup)
          </label>
          <input
            type="text"
            value={phoneNumber}
            onChange={onPhoneNumberChange}
            className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
            placeholder="+1234567890"
          />
        </div>

        <button
          onClick={onFetchDeviceInfo}
          disabled={loading}
          className="w-full bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-sm"
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
          <div className={`mt-8 p-4 rounded-xl border ${apiValidationResult.includes('✅') ? 'border-emerald-200 bg-emerald-50' : apiValidationResult.includes('⚠️') ? 'border-amber-200 bg-amber-50' : 'border-rose-200 bg-rose-50'}`}>
            <p className="text-sm font-medium text-slate-900">{apiValidationResult}</p>
          </div>
        )}

        {/* Results */}
        <div className="mt-10 space-y-8">
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">Retrieve Identifier (IMEI/SV)</h4>
            {formatResult(identifierResult)}
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">Retrieve Type (Brand/Model)</h4>
            {formatResult(typeResult)}
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">Retrieve PPID</h4>
            {formatResult(ppidResult)}
          </div>
        </div>
      </div>

      {/* API Gateway Validation Result (fallback) */}
      {apiValidationResult && !apiValidationResult.includes('APIs') && (
        <div className="border border-sky-200 bg-sky-50 rounded-xl p-4 mt-8">
          <h3 className="font-semibold text-slate-900 mb-2">
            API Validation
          </h3>
          <p className="text-sm text-slate-700">{apiValidationResult}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-zinc-200">
        <button
          onClick={onRefreshAccessToken}
          disabled={loading}
          className="flex-1 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-sm"
        >
          Refresh Token
        </button>
        
        <button
          onClick={onLogout}
          className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default SuccessSection;
