import React from 'react';

const VerificationModal = ({ show, onClose, verificationInfo }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
        <div className="p-8">
          <h3 className="text-2xl font-semibold text-slate-900 mb-2 tracking-tight">Complete Authentication</h3>
          <p className="text-slate-600 mb-8 text-base">Please verify your identity to continue</p>
          
          {/* Verification Link */}
          <div className="border border-zinc-200 rounded-xl p-6 mb-6 bg-zinc-50">
            <p className="text-sm font-medium text-slate-700 mb-3">Visit this link:</p>
            <div className="flex gap-3 mb-3">
              <a 
                href={verificationInfo.uri} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-900 underline break-all text-sm hover:text-slate-700"
              >
                {verificationInfo.uri}
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(verificationInfo.uri);
                }}
                className="text-sm text-slate-500 hover:text-slate-700 underline"
              >
                Copy Link
              </button>
            </div>
          </div>
          
          {/* User Code */}
          <div className="border border-zinc-200 rounded-xl p-6 mb-8 bg-zinc-50">
            <p className="text-sm font-medium text-slate-700 mb-4">Enter this code:</p>
            <div className="flex items-center justify-center gap-4">
              <span className="font-mono text-2xl font-semibold bg-white border border-zinc-300 px-6 py-3 rounded-lg">
                {verificationInfo.code}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(verificationInfo.code);
                }}
                className="text-sm text-slate-900 hover:text-slate-700 underline font-medium"
              >
                Copy Code
              </button>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                window.open(verificationInfo.uri, '_blank');
                onClose();
              }}
              className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200"
            >
              Open in New Tab
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-slate-900 font-medium py-4 px-6 rounded-lg transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
