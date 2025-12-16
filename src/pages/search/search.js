import { searchMovies } from "../../shared/omdb.js";
import { createMovieCard, debounce, setBusy, setStatus } from "../../shared/dom.js";

const input = document.querySelector("#q");
const typeSelect = document.querySelector("#type");
const yearInput = document.querySelector("#year");

const grid = document.querySelector("#grid");
const statusEl = document.querySelector("#status");
const loadMoreBtn = document.querySelector("#loadMore");

let currentQuery = "";
let page = 1;
let total = 0;
let items = [];

function render() {
  grid.innerHTML = "";
  for (const m of items) grid.appendChild(createMovieCard(m));
}

function syncUrl({ q, type, year }) {
  const url = new URL(window.location.href);
  if (q) url.searchParams.set("q", q); else url.searchParams.delete("q");
  if (type) url.searchParams.set("type", type); else url.searchParams.delete("type");
  if (year) url.searchParams.set("year", year); else url.searchParams.delete("year");
  history.replaceState(null, "", url);
}

function readUrl() {
  const url = new URL(window.location.href);
  return {
    q: url.searchParams.get("q") || "",
    type: url.searchParams.get("type") || "movie",
    year: url.searchParams.get("year") || ""
  };
}

async function runSearch({ reset = false } = {}) {
  const q = input.value.trim();
  const type = typeSelect.value;
  const year = yearInput.value.trim();

  syncUrl({ q, type, year });

  if (!q) {
    currentQuery = "";
    page = 1;
    total = 0;
    items = [];
    render();
    setStatus(statusEl, "Tape un titre pour lancer la recherche.");
    loadMoreBtn.disabled = true;
    return;
  }

  if (reset || q !== currentQuery) {
    currentQuery = q;
    page = 1;
    total = 0;
    items = [];
    render();
  }

  setBusy(grid, true);
  setStatus(statusEl, "Recherche…");
  loadMoreBtn.disabled = true;

  try {
    const res = await searchMovies({ query: currentQuery, page, type, year });
    total = res.total;

    if (page === 1 && res.items.length === 0) {
      setStatus(statusEl, res.error ? `Aucun résultat (${res.error}).` : "Aucun résultat.");
      return;
    }

    items = [...items, ...res.items];
    render();

    const shown = items.length;
    setStatus(statusEl, `${shown} / ${total || shown} résultat(s).`);

    const canLoadMore = total > 0 && shown < total;
    loadMoreBtn.disabled = !canLoadMore;
    if (canLoadMore) page += 1;
  } catch (e) {
    if (e.name === "AbortError") return;
    setStatus(statusEl, `Erreur : ${e.message}`);
  } finally {
    setBusy(grid, false);
  }
}

const debouncedInput = debounce(() => runSearch({ reset: true }), 350);
const debouncedYear = debounce(() => runSearch({ reset: true }), 400);

input.addEventListener("input", debouncedInput);
typeSelect.addEventListener("change", () => runSearch({ reset: true }));
yearInput.addEventListener("input", debouncedYear);

loadMoreBtn.addEventListener("click", () => runSearch({ reset: false }));

// Init depuis l'URL 
const init = readUrl();
input.value = init.q;
typeSelect.value = init.type;
yearInput.value = init.year;

if (init.q) {
  runSearch({ reset: true });
} else {
  setStatus(statusEl, "Tape un titre pour lancer la recherche.");
}
