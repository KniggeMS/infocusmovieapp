// Test script für das Logging
const { createBrowserClient } = require('@supabase/ssr');

async function testMovieLogging() {
  console.log('Testing movie logging...');
  
  const supabase = createBrowserClient(
    'https://ekbpexbhuochrplzorce.supabase.co',
    'sb_publishable__UII_iKx3pgvLQvc1xrN1w_qnwP6JOv'
  );

  // Teste aktuellen User
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  console.log('Current user:', user?.id, userError);

  if (!user) {
    console.log('No user found, trying to get session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Session:', session?.user?.id, sessionError);
    return;
  }

  // Teste Insert mit den korrekten Feldnamen
  console.log('Testing insert with correct field names...');
  const { data, error } = await supabase
    .from("diary_entries")
    .insert({
      user_id: user.id,
      tmdb_movie_id: 123,
      movie_title: "Test Film",
      movie_poster_path: "/test.jpg",
      rating: 4.5,
      review: "Test review",
      watched_on: new Date().toISOString().slice(0, 10)
    })
    .select();

  console.log('Insert result:', data, error);

  // Teste Select
  const { data: entries, error: selectError } = await supabase
    .from("diary_entries")
    .select("*")
    .eq("user_id", user.id);

  console.log('Select result:', entries, selectError);
}

testMovieLogging();
