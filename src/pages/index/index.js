import { searchMovies, getMovieById } from "../../shared/omdb.js";
import { createMovieCard, setBusy, setStatus } from "../../shared/dom.js";
import { uniqueByImdbId } from "../../shared/state.js";

const grid = document.querySelector("#grid");
const statusEl = document.querySelector("#status");
const loadMoreBtn = document.querySelector("#loadMore");

const trendingQueries = [
  "Avengers",
  "Spider-Man",
  "Batman",
  "Star Wars",
  "Harry Potter",
  "Fast and Furious"
];

let queryIndex = 0;
let page = 1;
let allItems = [];

async function loadTrendingBatch() {
  setStatus(statusEl, "Chargement…");
  setBusy(grid, true);
  loadMoreBtn.disabled = true;

  try {
    const q = trendingQueries[queryIndex];
    const { items } = await searchMovies({ query: q, page });

    // résumé
    const enriched = [];
    for (const m of items.slice(0, 3)) {
      try {
        const full = await getMovieById({ imdbID: m.imdbID, plot: "short" });
        enriched.push({ ...m, _plot: full.Plot && full.Plot !== "N/A" ? full.Plot : "" });
      } catch {
        enriched.push({ ...m, _plot: "" });
      }
    }
    const rest = items.slice(3).map((m) => ({ ...m, _plot: "" }));
    const merged = [...enriched, ...rest];

    allItems = uniqueByImdbId([...allItems, ...merged]);
    render();

    // Pagination
    if (!items.length) {
      queryIndex = (queryIndex + 1) % trendingQueries.length;
      page = 1;
    } else {
      page += 1;
      if (page > 2) {
        queryIndex = (queryIndex + 1) % trendingQueries.length;
        page = 1;
      }
    }

    setStatus(statusEl, `${allItems.length} film(s) affiché(s).`);
  } catch (e) {
    setStatus(statusEl, `Erreur : ${e.message}`);
  } finally {
    setBusy(grid, false);
    loadMoreBtn.disabled = false;
  }
}

function render() {
  grid.innerHTML = "";
  for (const m of allItems) {
    const card = createMovieCard(m, { showPlot: Boolean(m._plot), plot: m._plot });
    grid.appendChild(card);
  }
}

loadMoreBtn.addEventListener("click", loadTrendingBatch);

// Chargement initial
loadTrendingBatch();
