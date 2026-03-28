import "react-toastify/dist/ReactToastify.css";

import { ToastContainer } from "react-toastify";

export function Toaster() {
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={3200}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      toastClassName={() =>
        "!min-h-0 !rounded-2xl !p-0 !shadow-none !bg-transparent"
      }
      closeButton={false}
    />
  );
}
