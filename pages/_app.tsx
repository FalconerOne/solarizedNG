import "@/styles/globals.css";
import { ToastWrapper } from "@/components/ui/toast";

export default function App({ Component, pageProps }) {
  return (
    <ToastWrapper>
      <Component {...pageProps} />
    </ToastWrapper>
  );
}
