// apps/web/src/components/AuthButtons.tsx
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";

export function LoginButton() {
  return (
    <button
      className="nc-btn-primary w-full sm:w-auto"
      onClick={async () => {
        await signInWithPopup(auth, googleProvider);
      }}
    >
      Sign in with Google
    </button>
  );
}

export function LogoutButton() {
  return (
    <button
      className="nc-btn-ghost w-full sm:w-auto mr-auto w-[50%] md:w-auto"
      onClick={async () => {
        await signOut(auth);
      }}
    >
      Sign out
    </button>
  );
}
