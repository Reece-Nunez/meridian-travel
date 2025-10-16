import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check if user has admin role
    const adminProfile = await requireAdmin();
    if (!adminProfile) {
      console.log('Image Upload API: Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const quoteId = formData.get('quoteId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!quoteId) {
      return NextResponse.json({ error: 'Quote ID required' }, { status: 400 });
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

    const supabaseAdmin = createSupabaseAdmin();
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${quoteId}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    
    console.log('Image Upload API: Uploading file:', fileName);

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    
    const { data, error } = await supabaseAdmin.storage
      .from('itinerary-images')
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Image Upload API: Supabase upload error:', error);
      
      // If bucket doesn't exist, try to create it
      if (error.message?.includes('The resource was not found')) {
        console.log('Image Upload API: Bucket not found, attempting to create...');
        
        // Create bucket
        const { error: bucketError } = await supabaseAdmin.storage.createBucket('itinerary-images', {
          public: true
        });
        
        if (bucketError && !bucketError.message.includes('already exists')) {
          console.error('Image Upload API: Error creating bucket:', bucketError);
          return NextResponse.json({ error: 'Failed to create storage bucket' }, { status: 500 });
        }
        
        // Retry upload
        const { data: retryData, error: retryError } = await supabaseAdmin.storage
          .from('itinerary-images')
          .upload(fileName, arrayBuffer, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false
          });
          
        if (retryError) {
          console.error('Image Upload API: Retry upload error:', retryError);
          return NextResponse.json({ error: 'Upload failed after bucket creation' }, { status: 500 });
        }
        
        console.log('Image Upload API: Upload successful after bucket creation');
      } else {
        return NextResponse.json({ error: 'Upload failed: ' + error.message }, { status: 500 });
      }
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('itinerary-images')
      .getPublicUrl(fileName);

    console.log('Image Upload API: Upload successful, URL:', publicUrl);

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      fileName: fileName
    });

  } catch (error) {
    console.error('Image Upload API: Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}