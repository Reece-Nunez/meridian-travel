import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient, createAdminClient } from '@/lib/supabase/server';

// Verify user session and check admin role
async function verifyAdmin(): Promise<{ userId: string; email: string } | null> {
  try {
    // Get the server client which reads cookies from the request
    const supabase = await createServerClient();

    // Get the user from the session (cookies are automatically handled)
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      console.log('verifyAdmin: No valid session found', error?.message);
      return null;
    }

    // Check if user is admin using admin client (bypasses RLS)
    const adminClient = createAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      console.log('verifyAdmin: User is not admin, role:', profile?.role);
      return null;
    }

    console.log('verifyAdmin: Admin verified, email:', user.email);
    return { userId: user.id, email: user.email || '' };
  } catch (error) {
    console.error('verifyAdmin: Error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  console.log(`📤 [UPLOAD API ${requestId}] Request received`);
  const startTime = Date.now();

  try {
    // Check if user has admin role via session cookies
    console.log(`📤 [UPLOAD API ${requestId}] Checking admin authorization...`);
    const adminUser = await verifyAdmin();
    console.log(`📤 [UPLOAD API ${requestId}] Admin check took ${Date.now() - startTime}ms, result: ${!!adminUser}`);

    if (!adminUser) {
      console.log(`📤 [UPLOAD API ${requestId}] Unauthorized access attempt`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`📤 [UPLOAD API ${requestId}] Parsing form data...`);
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucketName = formData.get('bucket') as string || 'package-images';
    console.log(`📤 [UPLOAD API ${requestId}] File: ${file?.name}, Size: ${file?.size}, Bucket: ${bucketName}`);

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate bucket name (only allow specific buckets)
    const allowedBuckets = ['package-images', 'itinerary-images'];
    if (!allowedBuckets.includes(bucketName)) {
      return NextResponse.json({ error: 'Invalid bucket name' }, { status: 400 });
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' }, { status: 400 });
    }

    // Check file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
    }

    console.log(`📤 [UPLOAD API ${requestId}] Creating Supabase admin client...`);
    const supabaseAdmin = createAdminClient();

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

    console.log(`📤 [UPLOAD API ${requestId}] Uploading to ${bucketName}/${fileName}...`);

    // Convert File to ArrayBuffer for upload
    console.log(`📤 [UPLOAD API ${requestId}] Converting file to ArrayBuffer...`);
    const arrayBuffer = await file.arrayBuffer();
    console.log(`📤 [UPLOAD API ${requestId}] ArrayBuffer size: ${arrayBuffer.byteLength} bytes`);

    // Try to upload
    let uploadSuccess = false;
    let publicUrl = '';

    console.log(`📤 [UPLOAD API ${requestId}] Starting Supabase storage upload...`);
    const uploadStartTime = Date.now();

    const { data, error } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    console.log(`📤 [UPLOAD API ${requestId}] Upload took ${Date.now() - uploadStartTime}ms`);

    if (error) {
      console.error(`📤 [UPLOAD API ${requestId}] Supabase upload error:`, error);

      // If bucket doesn't exist, try to create it
      if (error.message?.includes('The resource was not found') || error.message?.includes('Bucket not found')) {
        console.log(`📤 [UPLOAD API ${requestId}] Bucket ${bucketName} not found, attempting to create...`);

        // Create bucket
        const { error: bucketError } = await supabaseAdmin.storage.createBucket(bucketName, {
          public: true
        });

        if (bucketError && !bucketError.message.includes('already exists')) {
          console.error(`📤 [UPLOAD API ${requestId}] Error creating bucket:`, bucketError);
          return NextResponse.json({ error: 'Failed to create storage bucket' }, { status: 500 });
        }

        // Retry upload
        console.log(`📤 [UPLOAD API ${requestId}] Retrying upload after bucket creation...`);
        const { data: retryData, error: retryError } = await supabaseAdmin.storage
          .from(bucketName)
          .upload(fileName, arrayBuffer, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false
          });

        if (retryError) {
          console.error(`📤 [UPLOAD API ${requestId}] Retry upload error:`, retryError);
          return NextResponse.json({ error: 'Upload failed after bucket creation: ' + retryError.message }, { status: 500 });
        }

        uploadSuccess = true;
        console.log(`📤 [UPLOAD API ${requestId}] Upload successful after bucket creation`);
      } else {
        return NextResponse.json({ error: 'Upload failed: ' + error.message }, { status: 500 });
      }
    } else {
      uploadSuccess = true;
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    publicUrl = urlData.publicUrl;

    console.log(`📤 [UPLOAD API ${requestId}] Upload complete! URL: ${publicUrl}`);
    console.log(`📤 [UPLOAD API ${requestId}] Total request time: ${Date.now() - startTime}ms`);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName
    });

  } catch (error) {
    console.error('Package Image Upload API: Unexpected error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 });
  }
}
