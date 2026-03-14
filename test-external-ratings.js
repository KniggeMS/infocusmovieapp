// Test external ratings
const { getExternalRatings } = require('./lib/external-ratings.ts');

async function testExternalRatings() {
  try {
    console.log('Testing external ratings for Avatar (movie)...');
    const movieRatings = await getExternalRatings(19995, 'movie');
    console.log('Movie ratings:', movieRatings);

    console.log('\nTesting external ratings for Friends (TV show)...');
    const tvRatings = await getExternalRatings(1668, 'tv');
    console.log('TV ratings:', tvRatings);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testExternalRatings();
