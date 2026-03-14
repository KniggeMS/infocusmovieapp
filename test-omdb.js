// Test external ratings directly
async function testExternalRatings() {
  console.log('Testing OMDB API...');
  
  const omdbApiKey = '5425f45e';
  console.log('Using OMDB API Key:', omdbApiKey);
  
  try {
    // Test with Avatar (19995) -> tt0499549
    console.log('Testing Avatar IMDB rating...');
    const response = await fetch(
      `https://www.omdbapi.com/?i=tt0499549&apikey=${omdbApiKey}`
    );
    
    if (!response.ok) {
      console.log('❌ OMDB API request failed:', response.status);
      return;
    }
    
    const data = await response.json();
    
    if (data.Error) {
      console.log('❌ OMDB API error:', data.Error);
      return;
    }
    
    console.log('✅ OMDB API success!');
    console.log('Title:', data.Title);
    console.log('IMDB Rating:', data.imdbRating);
    console.log('IMDB Votes:', data.imdbVotes);
    console.log('Year:', data.Year);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testExternalRatings();
