'use client';

export default function DebugEnv() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h1 className="text-2xl font-bold text-[#8B4513] mb-6">Environment Variables Debug</h1>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Supabase URL:</h3>
              <pre className="text-sm text-gray-600">
                {process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ NOT FOUND'}
              </pre>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Supabase Anon Key (first 20 chars):</h3>
              <pre className="text-sm text-gray-600">
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) || '❌ NOT FOUND'}...
              </pre>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Node Environment:</h3>
              <pre className="text-sm text-gray-600">
                {process.env.NODE_ENV}
              </pre>
            </div>

            {process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <p className="text-green-800">✅ Environment variables are loaded correctly!</p>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="text-red-800">❌ Environment variables are missing.</p>
                <p className="text-red-700 text-sm mt-2">
                  Make sure your .env.local file is in the project root and restart the dev server.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}