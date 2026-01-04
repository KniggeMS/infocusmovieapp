import { Movie, MovieServiceAdapter, CustomList } from '../types/domain';

export class MockMovieService implements MovieServiceAdapter {
  private mockDb: Movie[] = [
    {
      id: '1',
      title: 'Inception',
      posterPath: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
      runtime: 148,
      releaseDate: '2010-07-15',
      overview: 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: "inception", the implantation of another person\'s idea into a target\'s subconscious.',
      voteAverage: 8.8,
    },
    {
      id: '2',
      title: 'The Matrix',
      posterPath: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
      runtime: 136,
      releaseDate: '1999-03-30',
      overview: 'Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the vast and powerful computers who now rule the earth.',
      voteAverage: 8.7,
    },
    {
      id: '3',
      title: 'Interstellar',
      posterPath: '/gEU2QniL6E8ahDaNBkRL7aT2uBD.jpg',
      runtime: 169,
      releaseDate: '2014-11-05',
      overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
      voteAverage: 8.6,
    },
    {
      id: '4',
      title: 'Dune: Part Two',
      posterPath: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
      runtime: 167,
      releaseDate: '2024-02-27',
      overview: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
      voteAverage: 8.3,
    },
    {
      id: '5',
      title: 'Spirited Away',
      posterPath: '/39wmItIWsg5sZMyRUKGudW53yY.jpg',
      runtime: 125,
      releaseDate: '2001-07-20',
      overview: 'A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free her family.',
      voteAverage: 8.5,
    },
  ];

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getTrending(): Promise<Movie[]> {
    await this.delay(800); // Simulate network latency
    return [...this.mockDb];
  }

  async search(query: string): Promise<Movie[]> {
    await this.delay(800); // Simulate network latency
    const lowerQuery = query.toLowerCase();
    return this.mockDb.filter((movie) => 
      movie.title.toLowerCase().includes(lowerQuery)
    );
  }

  async getById(id: string): Promise<Movie | null> {
    await this.delay(800); // Simulate network latency
    const movie = this.mockDb.find((m) => m.id === id);
    return movie || null;
  }

  async getMovieDetails(tmdbId: string): Promise<Movie> {
    return {
        id: tmdbId,
        title: 'Mock Movie Details',
        posterPath: null,
        runtime: 120,
        releaseDate: '2025-01-01',
        overview: 'Mock details overview.',
        voteAverage: 8.0,
        source: 'tmdb',
        director: 'Mock Director',
        cast: [{ name: 'Mock Actor', character: 'Hero', profilePath: null }]
    };
  }

  async add(movie: Omit<Movie, 'id' | 'addedAt'>): Promise<Movie> {
    return { ...movie, id: 'mock-id' };
  }

  async delete(id: string): Promise<void> {
    // Mock delete implementation
  }

  async update(id: string, updates: Partial<any>): Promise<void> {
    // Mock update implementation
  }

  async exists(title: string): Promise<boolean> {
    return this.mockDb.some(m => m.title.toLowerCase() === title.toLowerCase());
  }

  async createList(name: string, description?: string): Promise<CustomList> {
    return { id: 'mock-list', name, description, movieCount: 0, items: [] };
  }

  async deleteList(listId: string): Promise<void> { }
  async getLists(): Promise<CustomList[]> { return []; }
  async addMovieToList(listId: string, movie: Movie): Promise<void> { }
  async removeMovieFromList(listId: string, movieId: string): Promise<void> { }
}
