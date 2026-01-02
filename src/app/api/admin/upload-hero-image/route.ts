import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient, createAdminClient } from '@/lib/supabase/server';

const BUCKET_NAME = 'hero-images';

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
    // Check if user has admin role
    const adminUser = await verifyAdmin();
    if (!adminUser) {
      console.log('Hero Image Upload API: Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const pageSlug = formData.get('pageSlug') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!pageSlug) {
      return NextResponse.json({ error: 'Page slug required' }, { status: 400 });
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' }, { status: 400 });
    }

    // Check file size (limit to 10MB for hero images)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // Generate unique filename with page slug prefix
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${pageSlug}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    console.log('Hero Image Upload API: Uploading file:', fileName);

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();

    // Try to upload to the bucket
    let uploadResult = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        cacheControl: '31536000', // 1 year cache for hero images
        upsert: true
      });

    if (uploadResult.error) {
      console.error('Hero Image Upload API: Supabase upload error:', uploadResult.error);

      // If bucket doesn't exist, try to create it
      if (uploadResult.error.message?.includes('not found') || uploadResult.error.message?.includes('does not exist')) {
        console.log('Hero Image Upload API: Bucket not found, attempting to create...');

        // Create bucket
        const { error: bucketError } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
          public: true
        });

        if (bucketError && !bucketError.message.includes('already exists')) {
          console.error('Hero Image Upload API: Error creating bucket:', bucketError);
          return NextResponse.json({ error: 'Failed to create storage bucket' }, { status: 500 });
        }

        // Retry upload
        uploadResult = await supabaseAdmin.storage
          .from(BUCKET_NAME)
          .upload(fileName, arrayBuffer, {
            contentType: file.type,
            cacheControl: '31536000',
            upsert: true
          });

        if (uploadResult.error) {
          console.error('Hero Image Upload API: Retry upload error:', uploadResult.error);
          return NextResponse.json({ error: 'Upload failed after bucket creation' }, { status: 500 });
        }

        console.log('Hero Image Upload API: Upload successful after bucket creation');
      } else {
        return NextResponse.json({ error: 'Upload failed: ' + uploadResult.error.message }, { status: 500 });
      }
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    console.log('Hero Image Upload API: Upload successful, URL:', publicUrl);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName
    });

  } catch (error) {
    console.error('Hero Image Upload API: Unexpected error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 });
  }
}
