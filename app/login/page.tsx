'use client';

import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <main className="flex flex-col justify-center items-center h-screen bg-gray-50">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Price Tracker</h1>
        <p className="text-gray-600">by Mark Orozco</p>
      </div>
      <button
        onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
      >
        Sign in with Google
      </button>
    </main>
  );
}
