import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import { MovieConductor } from './core/conductor/MovieConductor';
import { MovieServiceAdapter, WatchlistState, Movie, Achievement, MovieStatistics } from './types/domain';

// Mock ResizeObserver for Recharts
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock Adapter
const mockAdapter: MovieServiceAdapter = {
  getTrending: vi.fn().mockResolvedValue([]),
  search: vi.fn().mockResolvedValue([]),
  getById: vi.fn().mockResolvedValue(null),
  getMovieDetails: vi.fn().mockResolvedValue({} as Movie),
  add: vi.fn(),
  delete: vi.fn(),
  update: vi.fn(),
  exists: vi.fn().mockResolvedValue(false),
  createList: vi.fn(),
  deleteList: vi.fn(),
  getLists: vi.fn().mockResolvedValue([]),
  getListMovies: vi.fn().mockResolvedValue([]),
  addMovieToList: vi.fn(),
  removeMovieFromList: vi.fn(),
};

// Custom Initial State for Testing
const mockStats: MovieStatistics = {
  totalMovies: 10,
  watchedCount: 5,
  totalRuntimeMinutes: 1200, // 20 hours
  favoriteCount: 2,
  byGenre: [
    { name: 'Action', value: 6 },
    { name: 'Sci-Fi', value: 4 }
  ],
  byDecade: [
    { decade: '1990s', count: 5 },
    { decade: '2020s', count: 5 }
  ]
};

describe('Statistics Dashboard UI', () => {
  let conductor: MovieConductor;

  beforeEach(() => {
    vi.clearAllMocks();
    conductor = new MovieConductor(mockAdapter);
    
    // Inject mock statistics directly into state for testing UI
    // We mock the internal state since we want to test the VIEW, not the calculation (tested elsewhere)
    // Using a dirty cast because 'state' is private, but necessary for setting up complex view state quickly
    (conductor as any).state = {
      ...(conductor as any).state,
      statistics: mockStats,
      filter: 'all' // Start at home
    };
  });

  it('should display statistics dashboard when navigating to statistics tab', async () => {
    render(<App conductor={conductor} />);

    // 1. Find and Click Statistics Navigation Button
    // We use the aria-label added in App.tsx
    const statsButton = screen.getByLabelText('Statistics');
    fireEvent.click(statsButton);

    // 2. Wait for state update (Filter change)
    await waitFor(() => {
        expect(screen.getByText('Total')).toBeInTheDocument();
    });

    // 3. Assert KPI Values
    expect(screen.getByText('10')).toBeInTheDocument(); // Total Movies
    expect(screen.getByText('5')).toBeInTheDocument();  // Watched Count (Matches mocked 5)
    expect(screen.getByText('20.0')).toBeInTheDocument(); // Hours (1200 / 60)

    // 4. Assert Section Headers
    expect(screen.getByText('Favorite Genres')).toBeInTheDocument();
    expect(screen.getByText('Timeline')).toBeInTheDocument();

    // 5. Verify Charts presence
    // Recharts rendering in JSDOM can be tricky (SVG text nodes).
    // We verified the data arrived via the Legend text ("Action", "Sci-Fi") which is HTML.
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Sci-Fi')).toBeInTheDocument();
    
    // For the Bar Chart (Timeline), verifying the container/header is sufficient integration test
    // as we already verified the state contains the data via KPIs.
    expect(screen.getByText('Timeline')).toBeInTheDocument();
  });
});
