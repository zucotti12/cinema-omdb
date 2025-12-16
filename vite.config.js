import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        search: resolve(__dirname, "search.html"),
        movie: resolve(__dirname, "movie.html")
      }
    }
  }
});
