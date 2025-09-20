

import React, { useState } from 'react';

const LoginForm = ({ 
  useMFA,
  onMFAChange,
  onSubmit, 
  loading, 
  error 
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('LoginForm handleSubmit called');
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* MFA Toggle */}
      <div className="flex items-center space-x-3 mt-4">
        <input
          type="checkbox"
          id="mfaToggle"
          checked={useMFA}
          onChange={onMFAChange}
          className="h-5 w-5 text-zinc-600 focus:ring-2 focus:ring-zinc-500 border-zinc-300 rounded"
        />
        <label htmlFor="mfaToggle" className="text-sm font-medium text-slate-900 cursor-pointer select-none">
          Require Multi-Factor Authentication (MFA)
        </label>
      </div>

      <button
        type="submit"
        onClick={() => console.log('Button clicked')}
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
            <span>Initiating login...</span>
          </>
        ) : (
          <span>{useMFA ? "Initiate MFA Login" : "Initiate Login"}</span>
        )}
      </button>
    </form>
  );
};

export default LoginForm;
