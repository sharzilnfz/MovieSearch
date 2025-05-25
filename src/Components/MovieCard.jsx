import React from 'react';

const MovieCard = ({ movie }) => {
  const {
    title,
    name, // Add 'name' to destructure for TV series
    vote_average,
    poster_path,
    release_date,
    first_air_date, // Add 'first_air_date' for TV series
    original_language,
  } = movie;

  const movieTitle = title || name; // Use 'name' if 'title' is not available
  const movieYear = release_date
    ? release_date.split('-')[0]
    : first_air_date
    ? first_air_date.split('-')[0]
    : 'N/A';

  return (
    <div className="movie-card">
      <img
        src={
          poster_path
            ? `https://image.tmdb.org/t/p/w500/${poster_path}`
            : '/no-movie.png'
        }
        alt={movieTitle} // Use the combined title
      />

      <div className="mt-4">
        <h3>{movieTitle}</h3> {/* Use the combined title */}
        <div className="content">
          <div className="rating">
            <img src="star.svg" alt="Star Icon" />
            <p>{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
          </div>
          <span>•</span>
          <p className="lang">{original_language}</p>
          <span>•</span>
          <p className="year">{movieYear}</p> {/* Use the combined year */}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
