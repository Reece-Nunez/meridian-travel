import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    console.log('Adding pdf_title column to custom_quotes table...');

    const supabaseAdmin = createSupabaseAdmin();

    // Check if column already exists
    const { data: existingColumns, error: checkError } = await supabaseAdmin
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'custom_quotes')
      .eq('column_name', 'pdf_title');

    if (checkError) {
      console.log('Could not check existing columns (this is normal)');
    }

    // Try to add the column using raw SQL
    const { error: addError } = await supabaseAdmin.rpc('exec', {
      sql: 'ALTER TABLE custom_quotes ADD COLUMN IF NOT EXISTS pdf_title TEXT;'
    });

    if (addError) {
      console.error('Error adding column with rpc:', addError);

      // Try alternative approach - direct SQL execution
      const { error: directError } = await supabaseAdmin
        .from('custom_quotes')
        .select('pdf_title')
        .limit(1);

      if (directError && directError.code === '42703') {
        // Column doesn't exist, we need to add it manually
        return NextResponse.json({
          error: 'Column does not exist and could not be added automatically',
          message: 'Please add the column manually: ALTER TABLE custom_quotes ADD COLUMN pdf_title TEXT;',
          sqlCommand: 'ALTER TABLE custom_quotes ADD COLUMN pdf_title TEXT;'
        }, { status: 500 });
      }
    }

    console.log('pdf_title column added or already exists!');
    return NextResponse.json({
      success: true,
      message: 'pdf_title column is now available'
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({
      error: 'Failed to add column',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}