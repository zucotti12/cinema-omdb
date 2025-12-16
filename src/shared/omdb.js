const API_BASE = "https://www.omdbapi.com/";

function getKey() {
  const k = import.meta.env.VITE_OMDB_KEY;
  if (!k) throw new Error("Clé OMDb manquante. Ajoute VITE_OMDB_KEY dans .env");
  return k;
}

function buildUrl(params) {
  const url = new URL(API_BASE);
  url.searchParams.set("apikey", getKey());
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  }
  return url.toString();
}

let lastSearchController = null;

export async function searchMovies({ query, page = 1, type = "movie", year } = {}) {
  if (!query) return { items: [], total: 0, error: "Empty query" };

  if (lastSearchController) lastSearchController.abort();
  lastSearchController = new AbortController();

  const url = buildUrl({ s: query, page, type, y: year });
  const res = await fetch(url, { signal: lastSearchController.signal });
  if (!res.ok) throw new Error("Erreur réseau (search)");
  const data = await res.json();
  if (data.Response === "False") return { items: [], total: 0, error: data.Error };
  return { items: data.Search ?? [], total: Number(data.totalResults ?? 0), error: null };
}

export async function getMovieById({ imdbID, plot = "full" }) {
  const url = buildUrl({ i: imdbID, plot });
  const res = await fetch(url);
  if (!res.ok) throw new Error("Erreur réseau (movie)");
  const data = await res.json();
  if (data.Response === "False") throw new Error(data.Error || "Film introuvable");
  return data;
}
