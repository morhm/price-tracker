'use client';

import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <main className="flex justify-center items-center h-screen">
      <button
        onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Sign in with Google
      </button>
    </main>
  );
}
