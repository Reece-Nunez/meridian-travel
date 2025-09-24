const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function addPdfTitleColumn() {
  try {
    console.log('Adding pdf_title column to custom_quotes table...');

    // Check if column already exists first
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'custom_quotes')
      .eq('column_name', 'pdf_title');

    if (columnsError) {
      console.error('Error checking for existing column:', columnsError);
      return;
    }

    if (columns && columns.length > 0) {
      console.log('pdf_title column already exists!');
      return;
    }

    // Use raw SQL to add the column
    const { error } = await supabase.rpc('exec_sql', {
      query: 'ALTER TABLE custom_quotes ADD COLUMN pdf_title TEXT;'
    });

    if (error) {
      console.error('Error adding pdf_title column:', error);
    } else {
      console.log('Successfully added pdf_title column!');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

addPdfTitleColumn();