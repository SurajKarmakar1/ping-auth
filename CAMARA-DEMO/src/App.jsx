import React, { useEffect } from "react";
import { useAuth } from './hooks/useAuth';
import { useDeviceAPI } from './hooks/useDeviceAPI';
import Header from "./components/Header";
import Footer from "./components/Footer";
import LoginForm from "./components/LoginForm";
import SuccessSection from "./components/SuccessSection";
import VerificationModal from "./components/VerificationModal";

function App() {
  const auth = useAuth();
  const device = useDeviceAPI();

  useEffect(() => {
    if (auth.accessToken) {
      device.resetResults();
    }
  }, [auth.accessToken, device.resetResults]);

  const logout = () => {
    auth.logout();
    device.resetResults();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md mx-auto bg-white border border-zinc-200 rounded-xl shadow-md p-6">
        <Header />
        {!auth.accessToken ? (
          <LoginForm
            useMFA={auth.useMFA}
            onMFAChange={auth.handleMFAChange}
            onSubmit={auth.login}
            onRegister={auth.register}
            loading={auth.loading}
            error={auth.error}
          />
        ) : (
          <SuccessSection
            accessToken={auth.accessToken}
            authMessage={auth.authMessage}
            apiValidationResult={device.apiValidationResult}
            phoneNumber={device.phoneNumber}
            onPhoneNumberChange={device.onPhoneNumberChange}
            identifierResult={device.identifierResult}
            typeResult={device.typeResult}
            ppidResult={device.ppidResult}
            loading={device.loading}
            useMFA={auth.useMFA}
            onRefreshAccessToken={auth.refreshAccessToken}
            onFetchDeviceInfo={() => device.fetchDeviceInfo(auth.accessToken)}
            onLogout={logout}
          />
        )}
        <Footer />
      </div>
      
      <VerificationModal
        show={auth.showVerificationModal}
        onClose={auth.closeVerificationModal}
        verificationInfo={auth.verificationInfo}
      />
    </div>
  );
}

export default App;
