import React from 'react';
import { useEffect, useState } from 'react';
import Search from './Components/Search.jsx';
import MovieCard from './Components/MovieCard.jsx';
import { useDebounce } from 'react-use';
import Spinner from './Components/Spinner.jsx';
import { getTrendingMovies, updateSearchCount } from './appwrite.js';

const API_BASE_URL = 'https://api.themoviedb.org/3';

// Helper to fetch both movies and series

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setdebouncedSearchTerm] = useState('');
  const [trendingMovies, setTrendingMovies] = useState([]);

  useDebounce(
    () => {
      setdebouncedSearchTerm(searchTerm);
    },
    800,
    [searchTerm]
  );
  const fetchMoviesAndSeries = async (query) => {
    setIsLoading(true);
    setErrorMessage(''); // Clear the error message at the beginning
    try {
      let movieEndpoint = `${API_BASE_URL}/movie/now_playing`;
      let seriesEndpoint = `${API_BASE_URL}/tv/on_the_air`;

      if (query) {
        movieEndpoint = `${API_BASE_URL}/search/movie?query=${encodeURIComponent(
          query
        )}`;
        seriesEndpoint = `${API_BASE_URL}/search/tv?query=${encodeURIComponent(
          query
        )}`;
      }

      const [movieRes, seriesRes] = await Promise.all([
        fetch(movieEndpoint, API_OPTIONS),
        fetch(seriesEndpoint, API_OPTIONS),
      ]);

      const [movieData, seriesData] = await Promise.all([
        movieRes.json(),
        seriesRes.json(),
      ]);

      if (!movieRes.ok && !seriesRes.ok) {
        setErrorMessage('Failed to fetch movies and series');
        return;
      }

      const movies = movieData.results || [];
      const series = seriesData.results || [];

      if (movies.length === 0 && series.length === 0) {
        setErrorMessage('No movies or series found!');
        setMovieList([]);
        return;
      }

      // Add a type property to distinguish
      const combined = [
        ...movies.map((item) => ({ ...item, media_type: 'movie' })),
        ...series.map((item) => ({ ...item, media_type: 'tv' })),
      ];

      if (combined.length > 0 && query) {
        await updateSearchCount(query, combined[0]);
      }

      setMovieList(combined);
    } catch (error) {
      console.error('Error fetching movies and series:', error);
      setErrorMessage(
        'Error fetching movies and series. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  };

  useEffect(() => {
    fetchMoviesAndSeries(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">
        <header>
          <img src="/hero.png" alt="Hero Banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Without the Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2 className="mt-[40px] mb-[40px] justify-center text-center">
            New Movies
          </h2>
          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <>
              <ul>
                {movieList
                  .filter(
                    (item) => item.media_type === 'movie' && item.poster_path
                  ) // Filter out movies without poster_path
                  .map((movie) => (
                    <li key={`movie-${movie.id}`}>
                      <a
                        href={`https://www.themoviedb.org/movie/${movie.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MovieCard movie={movie} />
                      </a>
                    </li>
                  ))}
              </ul>
              <h2 className="mt-[40px] justify-center text-center">
                New TV Shows
              </h2>

              <ul>
                {movieList
                  .filter(
                    (item) => item.media_type === 'tv' && item.poster_path
                  ) // Filter out TV shows without poster_path
                  .map((tv) => (
                    <li key={`tv-${tv.id}`}>
                      <a
                        href={`https://www.themoviedb.org/tv/${tv.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MovieCard movie={tv} />
                      </a>
                    </li>
                  ))}
              </ul>
            </>
          )}
        </section>
        {errorMessage && <p className="error">{errorMessage}</p>}
      </div>
    </main>
  );
};

export default App;
