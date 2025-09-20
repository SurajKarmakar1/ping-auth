// VerificationModal.jsx
import React from "react";

const VerificationModal = ({ 
  show, 
  verificationInfo: { uri, code }, 
  onOpenInNewTab, 
  onClose 
}) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Authentication</h3>
          <p className="text-gray-600 mb-4">Please verify your identity to continue</p>
          
          {/* Verification Link */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-700 mb-2">Visit this link:</p>
            <a 
              href={uri} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline break-all text-sm"
            >
              {uri}
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(uri);
              }}
              className="ml-2 text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Copy Link
            </button>
          </div>
          
          {/* User Code */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 mb-2">Enter this code:</p>
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-lg font-bold bg-gray-200 px-3 py-2 rounded">
                {code}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(code);
                }}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Copy Code
              </button>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onOpenInNewTab}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              Open in New Tab
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition"
            >
              Go back to login page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
