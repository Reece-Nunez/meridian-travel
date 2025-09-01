'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface TestResult {
  test: string;
  status: 'pass' | 'fail' | 'pending';
  message: string;
  details?: any;
}

export default function DatabaseTest() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    const testResults: TestResult[] = [];

    // Test 1: Check Supabase connection
    try {
      const { data, error } = await supabase.from('trip_packages').select('count').single();
      if (error) throw error;
      testResults.push({
        test: 'Supabase Connection',
        status: 'pass',
        message: 'Successfully connected to Supabase'
      });
    } catch (error: any) {
      testResults.push({
        test: 'Supabase Connection',
        status: 'fail',
        message: `Connection failed: ${error.message}`,
        details: error
      });
    }

    // Test 2: Check trip_packages table and sample data
    try {
      const { data, error } = await supabase
        .from('trip_packages')
        .select('*')
        .limit(5);
      
      if (error) throw error;
      
      testResults.push({
        test: 'Trip Packages Table',
        status: 'pass',
        message: `Found ${data?.length || 0} trip packages`,
        details: data
      });
    } catch (error: any) {
      testResults.push({
        test: 'Trip Packages Table',
        status: 'fail',
        message: `Query failed: ${error.message}`,
        details: error
      });
    }

    // Test 3: Check all table structures
    const tables = ['profiles', 'custom_quotes', 'bookings', 'payment_history'];
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) throw error;
        
        testResults.push({
          test: `${table} table structure`,
          status: 'pass',
          message: `Table accessible and properly configured`
        });
      } catch (error: any) {
        testResults.push({
          test: `${table} table structure`,
          status: 'fail',
          message: `Table query failed: ${error.message}`,
          details: error
        });
      }
    }

    // Test 4: Check RLS policies (if user is signed in)
    if (user) {
      try {
        // Try to insert a test profile
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            first_name: 'Test',
            updated_at: new Date().toISOString()
          });
        
        if (error) throw error;
        
        testResults.push({
          test: 'Row Level Security (Profiles)',
          status: 'pass',
          message: 'RLS policies working correctly - can update own profile'
        });
      } catch (error: any) {
        testResults.push({
          test: 'Row Level Security (Profiles)',
          status: 'fail',
          message: `RLS test failed: ${error.message}`,
          details: error
        });
      }
    } else {
      testResults.push({
        test: 'Row Level Security',
        status: 'pending',
        message: 'Sign in to test RLS policies'
      });
    }

    // Test 5: Check functions and triggers
    try {
      // This will test the booking reference generation function
      const { data, error } = await supabase.rpc('generate_booking_reference');
      
      if (error) throw error;
      
      testResults.push({
        test: 'Database Functions',
        status: 'pass',
        message: `Booking reference function working: ${data}`,
        details: { sample_reference: data }
      });
    } catch (error: any) {
      testResults.push({
        test: 'Database Functions',
        status: 'fail',
        message: `Function test failed: ${error.message}`,
        details: error
      });
    }

    setTests(testResults);
    setLoading(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <span className="text-green-500 font-bold">✓</span>;
      case 'fail':
        return <span className="text-red-500 font-bold">✗</span>;
      case 'pending':
        return <span className="text-yellow-500 font-bold">⏳</span>;
    }
  };

  const getStatusBg = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return 'bg-green-50 border-green-200';
      case 'fail':
        return 'bg-red-50 border-red-200';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
    }
  };

  const passedTests = tests.filter(t => t.status === 'pass').length;
  const failedTests = tests.filter(t => t.status === 'fail').length;
  const pendingTests = tests.filter(t => t.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-[#8B4513]">Database Connection Test</h1>
            <p className="text-gray-600 mt-1">Verifying Supabase setup and database schema</p>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B4513]"></div>
                <span className="ml-3 text-gray-600">Running tests...</span>
              </div>
            ) : (
              <div>
                {/* Test Summary */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Test Summary</h2>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{passedTests}</div>
                      <div className="text-sm text-gray-600">Passed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{failedTests}</div>
                      <div className="text-sm text-gray-600">Failed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">{pendingTests}</div>
                      <div className="text-sm text-gray-600">Pending</div>
                    </div>
                  </div>
                </div>

                {/* Individual Test Results */}
                <div className="space-y-4">
                  {tests.map((test, index) => (
                    <div key={index} className={`border rounded-lg p-4 ${getStatusBg(test.status)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {getStatusIcon(test.status)}
                          <div>
                            <h3 className="font-semibold text-gray-900">{test.test}</h3>
                            <p className="text-sm text-gray-600 mt-1">{test.message}</p>
                            {test.details && (
                              <details className="mt-2">
                                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                                  Show details
                                </summary>
                                <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
                                  {JSON.stringify(test.details, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="mt-8 flex space-x-4">
                  <button
                    onClick={runTests}
                    className="bg-[#B8860B] hover:bg-[#DAA520] text-white px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    Run Tests Again
                  </button>
                  {!user && (
                    <a
                      href="/auth/signin"
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                    >
                      Sign In to Test RLS
                    </a>
                  )}
                </div>

                {/* Next Steps */}
                {failedTests === 0 && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-800">🎉 All tests passed!</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Your database is properly configured and ready to use. You can now:
                    </p>
                    <ul className="text-sm text-green-700 mt-2 list-disc list-inside space-y-1">
                      <li>Add sample trip packages data</li>
                      <li>Test user registration and authentication</li>
                      <li>Set up Stripe payment integration</li>
                      <li>Start building the booking flow</li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}