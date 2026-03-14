// Test script für Supabase Verbindung
const { createBrowserClient } = require('@supabase/ssr');

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  const supabase = createBrowserClient(
    'https://ekbpexbhuochrplzorce.supabase.co',
    'sb_publishable__UII_iKx3pgvLQvc1xrN1w_qnwP6JOv'
  );

  try {
    // Teste Verbindung mit einer einfachen Abfrage
    const { data, error } = await supabase
      .from('diary_entries')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }

    console.log('Supabase connection successful!');
    console.log('Data:', data);
    return true;
  } catch (err) {
    console.error('Unexpected error:', err);
    return false;
  }
}

testSupabaseConnection();
