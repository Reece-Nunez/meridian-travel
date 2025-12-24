import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient, createAdminClient } from '@/lib/supabase/server';

// Verify user session and check admin role
async function verifyAdmin(): Promise<{ userId: string; email: string } | null> {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
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
      return null;
    }

    return { userId: user.id, email: user.email || '' };
  } catch (error) {
    console.error('verifyAdmin error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminUser = await verifyAdmin();

    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucketName = formData.get('bucket') as string || 'package-images';

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
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();

    const { data, error } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      // If bucket doesn't exist, try to create it
      if (error.message?.includes('The resource was not found') || error.message?.includes('Bucket not found')) {
        const { error: bucketError } = await supabaseAdmin.storage.createBucket(bucketName, {
          public: true
        });

        if (bucketError && !bucketError.message.includes('already exists')) {
          return NextResponse.json({ error: 'Failed to create storage bucket' }, { status: 500 });
        }

        // Retry upload
        const { error: retryError } = await supabaseAdmin.storage
          .from(bucketName)
          .upload(fileName, arrayBuffer, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false
          });

        if (retryError) {
          return NextResponse.json({ error: 'Upload failed: ' + retryError.message }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: 'Upload failed: ' + error.message }, { status: 500 });
      }
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      fileName: fileName
    });

  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 });
  }
}
