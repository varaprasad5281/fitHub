const https = require("https");

// ── ExerciseDB via RapidAPI ────────────────────────────────────────────────────
// Free plan  : returns exercise data but NO gifUrl
// Basic plan ($10/mo): returns gifUrl (animated GIF demo)
// Sign up / upgrade: https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb
const RAPID_KEY = process.env.EXERCISEDB_API_KEY;
const RAPID_HOST = "exercisedb.p.rapidapi.com";

// ── Free static-image fallback (873 exercises, no key needed) ─────────────────
const FREE_BASE =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";
let freeDbPromise = null;

// ── In-memory cache ───────────────────────────────────────────────────────────
const cache = new Map();

// ── Helpers ───────────────────────────────────────────────────────────────────

function get(hostname, path, headers = {}) {
  return new Promise((resolve) => {
    const req = https.request(
      { hostname, path, method: "GET", headers },
      (res) => {
        let data = "";
        res.on("data", (c) => {
          data += c;
        });
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve(null);
          }
        });
      },
    );
    req.on("error", () => resolve(null));
    req.end();
  });
}

function words(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

// ── ExerciseDB (RapidAPI) ─────────────────────────────────────────────────────

async function searchRapidAPI(query) {
  const encoded = encodeURIComponent(query.toLowerCase().trim());
  const result = await get(
    RAPID_HOST,
    `/exercises/name/${encoded}?limit=3&offset=0`,
    { "X-RapidAPI-Key": RAPID_KEY, "X-RapidAPI-Host": RAPID_HOST },
  );
  return Array.isArray(result) && result.length > 0 ? result[0] : null;
}

async function fromRapidAPI(exerciseName) {
  if (!RAPID_KEY) return null;

  // Try full name first, then fall back to first two words for better matching
  let exercise = await searchRapidAPI(exerciseName);
  if (!exercise) {
    const short = words(exerciseName).slice(0, 2).join(" ");
    if (short !== exerciseName.toLowerCase().trim()) {
      exercise = await searchRapidAPI(short);
    }
  }

  if (!exercise) return null;

  // gifUrl is only available on the paid Basic plan
  return exercise.gifUrl || null;
}

// ── Free static-image DB ──────────────────────────────────────────────────────

function loadFreeDb() {
  if (freeDbPromise) return freeDbPromise;
  freeDbPromise = get(
    "raw.githubusercontent.com",
    "/yuhonas/free-exercise-db/main/dist/exercises.json",
  )
    .then((d) => (Array.isArray(d) ? d : []))
    .catch(() => []);
  return freeDbPromise;
}

async function fromFreeDb(exerciseName) {
  const db = await loadFreeDb();
  if (!db.length) return null;

  const qWords = words(exerciseName);
  let best = null,
    bestScore = 0;
  for (const ex of db) {
    const cWords = words(ex.name);
    const hits = qWords.filter((w) => cWords.includes(w)).length;
    const score = hits / Math.max(qWords.length, cWords.length);
    if (score > bestScore) {
      bestScore = score;
      best = ex;
    }
  }

  return best && bestScore >= 0.3 && best.images?.length
    ? FREE_BASE + best.images[0]
    : null;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns an image URL (animated GIF on paid plan, static JPG on free plan).
 * Results cached in memory for the server lifetime.
 */
async function getExerciseImage(exerciseName) {
  const key = exerciseName.toLowerCase().trim();
  if (cache.has(key)) return cache.get(key);

  // Try RapidAPI first (animated GIF if on Basic plan, null if free plan)
  let url = await fromRapidAPI(exerciseName);

  // Fall back to free static images
  if (!url) url = await fromFreeDb(exerciseName);

  cache.set(key, url || null);
  return url;
}

module.exports = { getExerciseImage };
