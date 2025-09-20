// Header.jsx
import React from "react";

const Header = () => {
  return (
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
  );
};

export default Header;
