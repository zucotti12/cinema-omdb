export function uniqueByImdbId(items) {
  const seen = new Set();
  return items.filter((x) => {
    if (!x?.imdbID || seen.has(x.imdbID)) return false;
    seen.add(x.imdbID);
    return true;
  });
}
