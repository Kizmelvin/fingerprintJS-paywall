import "../styles/globals.css";
// import "bootstrap/dist/css/bootstrap.min.css";
import { FpjsProvider } from "@fingerprintjs/fingerprintjs-pro-react";

function MyApp({ Component, pageProps }) {
  return (
    <FpjsProvider
      loadOptions={{
        apiKey: "Tkcvlio1jPFJLbiVFMNt",
      }}
    >
      <Component {...pageProps} />
    </FpjsProvider>
  );
}

export default MyApp;
