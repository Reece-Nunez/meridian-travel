import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role for admin operations to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, hero_image_url, original_image_url, focal_point_x, focal_point_y, hero_height_mobile, hero_height_desktop, overlay_opacity } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing setting ID' }, { status: 400 });
    }

    console.log('[API] Updating hero settings for ID:', id);

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };

    // Only include fields that are provided
    if (hero_image_url !== undefined) updateData.hero_image_url = hero_image_url;
    if (original_image_url !== undefined) updateData.original_image_url = original_image_url;
    if (focal_point_x !== undefined) updateData.focal_point_x = focal_point_x;
    if (focal_point_y !== undefined) updateData.focal_point_y = focal_point_y;
    if (hero_height_mobile !== undefined) updateData.hero_height_mobile = hero_height_mobile;
    if (hero_height_desktop !== undefined) updateData.hero_height_desktop = hero_height_desktop;
    if (overlay_opacity !== undefined) updateData.overlay_opacity = overlay_opacity;

    const { data, error } = await supabaseAdmin
      .from('page_hero_settings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[API] Error updating hero settings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[API] Hero settings updated successfully');
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
