// Browser Test - füge das in die Browser Console ein auf http://localhost:3001
async function testBrowserLogging() {
  console.log('Testing browser logging...');
  
  const supabase = createBrowserClient(
    'https://ekbpexbhuochrplzorce.supabase.co',
    'sb_publishable__UII_iKx3pgvLQvc1xrN1w_qnwP6JOv'
  );

  // Teste aktuellen User
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  console.log('Current user:', user?.id, userError);

  if (!user) {
    console.log('No user found!');
    return;
  }

  // Teste Insert
  console.log('Testing insert...');
  const { data, error } = await supabase
    .from("diary_entries")
    .insert({
      user_id: user.id,
      tmdb_movie_id: 123,
      movie_title: "Browser Test Film",
      movie_poster_path: "/test.jpg",
      rating: 4.5,
      review: "Browser test review",
      watched_on: new Date().toISOString().slice(0, 10)
    })
    .select();

  console.log('Insert result:', data, error);

  // Teste Select
  const { data: entries, error: selectError } = await supabase
    .from("diary_entries")
    .select("*")
    .eq("user_id", user.id);

  console.log('Entries after insert:', entries, selectError);
}

// Führe den Test aus
testBrowserLogging();
