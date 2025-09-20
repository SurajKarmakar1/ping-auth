import React from "react";

const LoginForm = ({ 
  username, 
  onUsernameChange, 
  useMFA,
  onMFAChange,
  onSubmit, 
  loading, 
  error 
}) => {
  return (
    <div className="space-y-6">
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
          onChange={onMFAChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="mfaToggle" className="ml-2 block text-sm text-gray-700">
          Require Multi-Factor Authentication (MFA)
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Username (email)
        </label>
        <input
          type="email"
          value={username}
          onChange={onUsernameChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ping"
          placeholder="demo@camara.test"
          required
          autoComplete="username"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        onClick={onSubmit}
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
    </div>
  );
};

export default LoginForm;
