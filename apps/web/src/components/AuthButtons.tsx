// apps/web/src/components/AuthButtons.tsx
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";

export function LoginButton() {
  return (
    <button
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
      onClick={async () => {
        await signOut(auth);
      }}
    >
      Sign out
    </button>
  );
}
