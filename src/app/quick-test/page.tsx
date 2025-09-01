'use client';

import { useEffect, useState } from 'react';
import { supabaseTest } from '@/lib/supabase-test';

export default function QuickTest() {
  const [result, setResult] = useState<string>('Testing...');

  useEffect(() => {
    async function testConnection() {
      try {
        const { data, error } = await supabaseTest
          .from('trip_packages')
          .select('count')
          .limit(1);
        
        if (error) {
          setResult(`❌ Error: ${error.message}`);
        } else {
          setResult('✅ Connection successful! Database is working.');
        }
      } catch (err: any) {
        setResult(`❌ Connection failed: ${err.message}`);
      }
    }
    
    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-[#8B4513] mb-4">Quick Connection Test</h1>
        <p className="text-gray-600 mb-4">Testing hardcoded Supabase connection:</p>
        <div className="bg-gray-100 p-4 rounded">
          <pre className="text-sm">{result}</pre>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          This uses hardcoded credentials to bypass environment variable issues.
        </p>
      </div>
    </div>
  );
}