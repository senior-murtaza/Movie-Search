import { useEffect, useState } from "react";

const KEY = "f84fc31d";
export default function App() {
  const [query, setQuery] = useState("Ali");
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const search = query.trim();

    if (search.length < 3) {
      setMovies([]);
      setError("");
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    async function fetchMovies() {
      setIsLoading(true);
      setError("");
      setMovies([]);

      try {
        const response = await fetch(
          `https://www.omdbapi.com/?apikey=${KEY}&s=${encodeURIComponent(search)}`,
          { signal: controller.signal }
        );

        const data = await response.json();

        if (data.Response === "False") {
          if (data.Error === "Movie not found!") {
            setError("Movie not found");
          } else {
            setError(data.Error || "Something went wrong");
          }
          return;
        }

        setMovies(data.Search || []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Failed to load movies. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchMovies();

    return () => controller.abort();
  }, [query]);

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
      </NavBar>

      <Main>
        <Box>
          {isLoading && <p>Loading movies...</p>}

          {!isLoading && error && <p>{error}</p>}

          {!isLoading && !error && movies.length > 0 && (
            <MovieList movies={movies} />
          )}
        </Box>
      </Main>
    </>
  );
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img" aria-label="popcorn">
        🍿
      </span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? "−" : "+"}
      </button>

      {isOpen && children}
    </div>
  );
}

function MovieList({ movies }) {
  return (
    <ul className="list">
      {movies.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}

function Movie({ movie }) {
  return (
    <li>
      <img
        src={movie.Poster}
        alt={`${movie.Title} poster`}
      />

      <h3>{movie.Title}</h3>

      <p>
        <span>🗓 </span>
        <span>{movie.Year}</span>
      </p>
    </li>
  );
}
