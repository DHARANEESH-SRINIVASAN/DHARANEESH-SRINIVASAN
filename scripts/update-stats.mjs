import { readFile, writeFile } from "node:fs/promises";

const PACKAGE = process.env.STATS_PACKAGE ?? "columnwire";
const HISTORY = "data/npm-downloads.json";
const README = "README.md";
const OPEN = '<div data-stats="columnwire" align="center">';
const CLOSE = "</div>";
const DAY = 86_400_000;

const iso = (date) => date.toISOString().slice(0, 10);
const pretty = (day) =>
  new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const number = (n) => n.toLocaleString("en-US");

async function getJson(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(url, { headers: { "User-Agent": "columnwire-profile-stats" } });
    if (response.status === 404) return null;
    if (response.ok) return response.json();
    await new Promise((r) => setTimeout(r, 5000 * (attempt + 1)));
  }
  throw new Error(`GET ${url} kept failing`);
}

async function loadHistory() {
  try {
    return JSON.parse(await readFile(HISTORY, "utf8"));
  } catch {
    return { package: PACKAGE, published: null, downloads: {} };
  }
}

async function fetchDownloads(history) {
  const meta = await getJson(`https://registry.npmjs.org/${PACKAGE}`);
  if (!meta) return null;
  history.published = meta.time?.created?.slice(0, 10) ?? history.published;
  const end = new Date(Date.now() - DAY);
  let start = new Date(`${history.published}T00:00:00Z`);
  const known = Object.keys(history.downloads).sort();
  if (known.length) start = new Date(Math.max(start.getTime(), new Date(`${known.at(-1)}T00:00:00Z`).getTime() - 7 * DAY));
  while (start <= end) {
    const chunkEnd = new Date(Math.min(end.getTime(), start.getTime() + 500 * DAY));
    const range = await getJson(`https://api.npmjs.org/downloads/range/${iso(start)}:${iso(chunkEnd)}/${PACKAGE}`);
    for (const { day, downloads } of range?.downloads ?? []) history.downloads[day] = downloads;
    start = new Date(chunkEnd.getTime() + DAY);
  }
  return history;
}

function summarize(history) {
  const days = Object.keys(history.downloads).sort();
  const last = days.at(-1);
  const total = days.reduce((sum, d) => sum + history.downloads[d], 0);
  const windowSum = (n) => {
    const from = iso(new Date(new Date(`${last}T00:00:00Z`).getTime() - (n - 1) * DAY));
    return days.filter((d) => d >= from).reduce((sum, d) => sum + history.downloads[d], 0);
  };
  return { total, week: windowSum(7), month: windowSum(30), last, published: history.published };
}

function block(stats) {
  const badge = (label, value, color) =>
    `<img src="https://img.shields.io/badge/${encodeURIComponent(label)}-${encodeURIComponent(value)}-${color}?style=for-the-badge" alt="${label}: ${value}"/>`;
  if (!stats) {
    return [
      OPEN,
      "",
      "<sub>The npm package is not published yet. Download counts appear here the day after the first release.</sub>",
      "",
      CLOSE,
    ].join("\n");
  }
  return [
    OPEN,
    "",
    `<a href="https://npm-stat.com/charts.html?package=${PACKAGE}">${badge("npm downloads", number(stats.total), "2f9e44")}</a>`,
    `${badge("last 30 days", number(stats.month), "3b5bdb")} ${badge("last 7 days", number(stats.week), "7048e8")}`,
    "",
    `<sub>Downloads of <code>${PACKAGE}</code> from npm since ${pretty(stats.published)}, data through ${pretty(stats.last)}. npm counts every tarball fetch, so CI runs, mirrors and repeat installs are included. Maven Central publishes no public download counts.</sub>`,
    "",
    CLOSE,
  ].join("\n");
}

const history = await loadHistory();
let updated = null;
try {
  updated = await fetchDownloads(history);
} catch (error) {
  console.warn(`npm unavailable, keeping stored history: ${error.message}`);
  updated = Object.keys(history.downloads).length ? history : null;
}
if (updated) {
  updated.downloads = Object.fromEntries(Object.entries(updated.downloads).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(HISTORY, `${JSON.stringify(updated, null, 2)}\n`);
}
const readme = await readFile(README, "utf8");
const from = readme.indexOf(OPEN);
const to = readme.indexOf(CLOSE, from);
if (from < 0 || to < 0) throw new Error(`README is missing the ${OPEN} block`);
const stats = updated && Object.keys(updated.downloads).length ? summarize(updated) : null;
await writeFile(README, readme.slice(0, from) + block(stats) + readme.slice(to + CLOSE.length));
console.log(stats ? `total ${stats.total}, 30d ${stats.month}, 7d ${stats.week}` : "not published yet");
