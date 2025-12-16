import { getMovieById } from "../../shared/omdb.js";
import { formatDateFR, posterUrl, setBusy, setStatus } from "../../shared/dom.js";

const titleEl = document.querySelector("#title");
const statusEl = document.querySelector("#status");
const movieEl = document.querySelector("#movie");

const posterEl = document.querySelector("#poster");
const metaEl = document.querySelector("#meta");
const plotEl = document.querySelector("#plot");
const genreEl = document.querySelector("#genre");
const actorsEl = document.querySelector("#actors");
const ratingsEl = document.querySelector("#ratings");
const dvdEl = document.querySelector("#dvd");

function getId() {
  const url = new URL(window.location.href);
  return url.searchParams.get("id");
}

function formatRatings(ratings) {
  if (!Array.isArray(ratings) || ratings.length === 0) return "N/A";
  return ratings
    .map((r) => `${r.Source} : ${r.Value}`)
    .join(" • ");
}

async function main() {
  const id = getId();
  if (!id) {
    titleEl.textContent = "Film introuvable";
    setStatus(statusEl, "Paramètre manquant : ?id=...");
    return;
  }

  setBusy(movieEl, true);
  setStatus(statusEl, "Chargement…");

  try {
    const m = await getMovieById({ imdbID: id, plot: "full" });

    document.title = `${m.Title} – Détails`;
    titleEl.textContent = m.Title;

    const p = posterUrl(m.Poster);
    posterEl.src =
      p ||
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='900'%3E%3Crect width='100%25' height='100%25' fill='%23222636'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23a7acbd' font-size='24'%3EPas d'image%3C/text%3E%3C/svg%3E";
    posterEl.alt = p ? `Affiche : ${m.Title}` : `Affiche indisponible : ${m.Title}`;

    metaEl.textContent = [m.Year, m.Runtime, m.Rated].filter((x) => x && x !== "N/A").join(" • ");

    plotEl.textContent = m.Plot && m.Plot !== "N/A" ? m.Plot : "Résumé indisponible.";
    genreEl.textContent = m.Genre && m.Genre !== "N/A" ? m.Genre : "N/A";
    actorsEl.textContent = m.Actors && m.Actors !== "N/A" ? m.Actors : "N/A";

    ratingsEl.textContent = formatRatings(m.Ratings);
    dvdEl.textContent = m.DVD && m.DVD !== "N/A" ? formatDateFR(m.DVD) : "N/A";

    setStatus(statusEl, "");
  } catch (e) {
    titleEl.textContent = "Erreur de chargement";
    setStatus(statusEl, e.message);
  } finally {
    setBusy(movieEl, false);
  }
}

main();
