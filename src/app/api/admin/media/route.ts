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

export interface MediaFile {
  name: string;
  url: string;
  bucket: string;
  size: number;
  createdAt: string;
  contentType: string;
}

// GET - List all images from storage buckets
export async function GET(request: NextRequest) {
  try {
    const adminUser = await verifyAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();
    const buckets = ['package-images', 'itinerary-images', 'content-images'];
    const allFiles: MediaFile[] = [];

    for (const bucketName of buckets) {
      try {
        const { data: files, error } = await supabaseAdmin.storage
          .from(bucketName)
          .list('', {
            limit: 100,
            sortBy: { column: 'created_at', order: 'desc' }
          });

        if (error) {
          // Bucket might not exist, skip it
          console.log(`Bucket ${bucketName} not accessible:`, error.message);
          continue;
        }

        if (files) {
          for (const file of files) {
            // Skip folders
            if (!file.name || file.id === null) continue;

            const { data: urlData } = supabaseAdmin.storage
              .from(bucketName)
              .getPublicUrl(file.name);

            allFiles.push({
              name: file.name,
              url: urlData.publicUrl,
              bucket: bucketName,
              size: file.metadata?.size || 0,
              createdAt: file.created_at || new Date().toISOString(),
              contentType: file.metadata?.mimetype || 'image/jpeg'
            });
          }
        }
      } catch (bucketError) {
        console.log(`Error accessing bucket ${bucketName}:`, bucketError);
      }
    }

    // Sort by creation date, newest first
    allFiles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ files: allFiles });
  } catch (error) {
    console.error('Media API GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete an image from storage
export async function DELETE(request: NextRequest) {
  try {
    const adminUser = await verifyAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bucket, fileName } = await request.json();

    if (!bucket || !fileName) {
      return NextResponse.json({ error: 'Bucket and fileName are required' }, { status: 400 });
    }

    const allowedBuckets = ['package-images', 'itinerary-images', 'content-images'];
    if (!allowedBuckets.includes(bucket)) {
      return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove([fileName]);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Media API DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
