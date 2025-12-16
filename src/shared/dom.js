export function setBusy(el, isBusy) {
  el?.setAttribute("aria-busy", isBusy ? "true" : "false");
}

export function setStatus(statusEl, msg) {
  if (statusEl) statusEl.textContent = msg || "";
}

export function posterUrl(poster) {
  return poster && poster !== "N/A" ? poster : "";
}

function posterFallbackSvg() {
  return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23222636'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23a7acbd' font-size='18'%3EPas d'image%3C/text%3E%3C/svg%3E";
}

export function createMovieCard({ imdbID, Title, Year, Poster }, { showPlot = false, plot = "" } = {}) {
  const card = document.createElement("article");
  card.className = "card";

  const img = document.createElement("img");
  img.className = "thumb";

  const p = posterUrl(Poster);
  img.src = p || posterFallbackSvg();
  img.alt = p ? `Affiche : ${Title}` : `Affiche indisponible : ${Title}`;
  img.loading = "lazy";

  img.onerror = () => {
    img.onerror = null;
    img.src = posterFallbackSvg();
    img.alt = `Affiche indisponible : ${Title}`;
  };

  const right = document.createElement("div");

  const h = document.createElement("h4");
  h.textContent = Title;

  const meta = document.createElement("p");
  meta.className = "muted";
  meta.textContent = Year ? `Année : ${Year}` : "";

  right.append(h, meta);

  if (showPlot && plot) {
    const summary = document.createElement("p");
    summary.className = "clamp-4";
    summary.textContent = plot;
    right.appendChild(summary);
  }

  const actions = document.createElement("div");
  actions.className = "card-actions";

  const link = document.createElement("a");
  link.className = "btn";
  link.href = `/movie.html?id=${encodeURIComponent(imdbID)}`;
  link.textContent = "En savoir plus";
  link.setAttribute("aria-label", `Voir les détails de ${Title}`);

  actions.appendChild(link);
  right.appendChild(actions);

  card.append(img, right);
  return card;
}

export function debounce(fn, delay = 350) {
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

export function formatDateFR(dateStr) {
  if (!dateStr || dateStr === "N/A") return "N/A";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "N/A";
  return new Intl.DateTimeFormat("fr-FR").format(d);
}
