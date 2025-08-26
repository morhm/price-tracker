import Link from 'next/link';

export default function TrackerLayout({ children }) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="bg-gray-800 text-white p-4 relative">
        <h1 className="text-xl font-bold text-center">Tracker Details</h1>
        <Link href="/dashboard" className="text-sm text-gray-300 hover:underline absolute right-4 top-4">
          &larr; Back to Dashboard
        </Link>
      </header>
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
