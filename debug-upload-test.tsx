// Debug Upload Test Component
// Add this to any admin page temporarily to test upload

import { supabase } from '@/lib/supabase';

export default function DebugUpload() {
  const testUpload = async () => {
    try {
      console.log('Testing Supabase connection...');
      
      // Test 1: Check if supabase client is working
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('Current user:', user);
      if (authError) console.error('Auth error:', authError);
      
      // Test 2: List storage buckets
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      console.log('Available buckets:', buckets);
      if (bucketError) console.error('Bucket error:', bucketError);
      
      // Test 3: Try to upload a small test file
      const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const filePath = `test-uploads/debug-${Date.now()}.txt`;
      
      console.log('Uploading test file to:', filePath);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, testFile);
        
      if (uploadError) {
        console.error('Upload error:', uploadError);
      } else {
        console.log('Upload success:', uploadData);
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);
        console.log('Public URL:', publicUrl);
      }
      
    } catch (error) {
      console.error('Test failed:', error);
    }
  };

  return (
    <div style={{ padding: '20px', border: '2px solid red' }}>
      <h3>Debug Upload Test</h3>
      <button onClick={testUpload} style={{ padding: '10px', background: 'blue', color: 'white' }}>
        Run Upload Test
      </button>
      <p>Check console for results</p>
    </div>
  );
}