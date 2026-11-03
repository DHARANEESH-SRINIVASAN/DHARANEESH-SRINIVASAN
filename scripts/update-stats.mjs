import { mkdir, readFile, writeFile } from "node:fs/promises";

const PACKAGES = (process.env.STATS_PACKAGES ?? "columnwire,leapwire").split(",").map((name) => name.trim()).filter(Boolean);
const LEGACY = { columnwire: "data/npm-downloads.json" };
const README = "README.md";
const CLOSE = "</div>";
const opening = (name) => `<div data-stats="${name}" align="center">`;
const historyFile = (name) => `data/npm-${name}.json`;
const DAY = 86_400_000;

const iso = (date) => date.toISOString().slice(0, 10);
const pretty = (day) =>
  new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const number = (n) => n.toLocaleString("en-US");

async function getJson(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(url, { headers: { "User-Agent": "dharaneesh-profile-stats" } });
    if (response.status === 404) return null;
    if (response.ok) return response.json();
    await new Promise((r) => setTimeout(r, 5000 * (attempt + 1)));
  }
  throw new Error(`GET ${url} kept failing`);
}

async function loadHistory(name) {
  for (const file of [historyFile(name), LEGACY[name]].filter(Boolean)) {
    try {
      return JSON.parse(await readFile(file, "utf8"));
    } catch {
    }
  }
  return { package: name, published: null, downloads: {} };
}

async function fetchDownloads(name, history) {
  const meta = await getJson(`https://registry.npmjs.org/${name}`);
  if (!meta) return null;
  history.published = meta.time?.created?.slice(0, 10) ?? history.published;
  const end = new Date(Date.now() - DAY);
  let start = new Date(`${history.published}T00:00:00Z`);
  const known = Object.keys(history.downloads).sort();
  if (known.length) start = new Date(Math.max(start.getTime(), new Date(`${known.at(-1)}T00:00:00Z`).getTime() - 7 * DAY));
  while (start <= end) {
    const chunkEnd = new Date(Math.min(end.getTime(), start.getTime() + 500 * DAY));
    const range = await getJson(`https://api.npmjs.org/downloads/range/${iso(start)}:${iso(chunkEnd)}/${name}`);
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

function block(name, stats, published) {
  const OPEN = opening(name);
  const badge = (label, value, color) =>
    `<img src="https://img.shields.io/badge/${encodeURIComponent(label)}-${encodeURIComponent(value)}-${color}?style=for-the-badge" alt="${label}: ${value}"/>`;
  if (!stats) {
    const note = published
      ? `<sub><code>${name}</code> was published on npm on ${pretty(published)}. npm reports downloads a day late, so the first counts appear here tomorrow.</sub>`
      : "<sub>The npm package is not published yet. Download counts appear here the day after the first release.</sub>";
    return [OPEN, "", note, "", CLOSE].join("\n");
  }
  return [
    OPEN,
    "",
    `<a href="https://npm-stat.com/charts.html?package=${name}">${badge("npm downloads", number(stats.total), "2f9e44")}</a>`,
    `${badge("last 30 days", number(stats.month), "3b5bdb")} ${badge("last 7 days", number(stats.week), "7048e8")}`,
    "",
    `<sub>Downloads of <code>${name}</code> from npm since ${pretty(stats.published)}, data through ${pretty(stats.last)}. npm counts every tarball fetch, so CI runs, mirrors and repeat installs are included. Maven Central publishes no public download counts.</sub>`,
    "",
    CLOSE,
  ].join("\n");
}

let readme = await readFile(README, "utf8");
for (const name of PACKAGES) {
  const history = await loadHistory(name);
  let updated = null;
  try {
    updated = await fetchDownloads(name, history);
  } catch (error) {
    console.warn(`npm unavailable for ${name}, keeping stored history: ${error.message}`);
    updated = Object.keys(history.downloads).length ? history : null;
  }
  if (updated && (Object.keys(updated.downloads).length || updated.published)) {
    updated.downloads = Object.fromEntries(Object.entries(updated.downloads).sort(([a], [b]) => a.localeCompare(b)));
    await mkdir("data", { recursive: true });
    await writeFile(historyFile(name), `${JSON.stringify(updated, null, 2)}\n`);
  }
  const from = readme.indexOf(opening(name));
  if (from < 0) {
    console.warn(`README has no ${opening(name)} block, skipping ${name}`);
    continue;
  }
  const to = readme.indexOf(CLOSE, from);
  const stats = updated && Object.keys(updated.downloads).length ? summarize(updated) : null;
  readme = readme.slice(0, from) + block(name, stats, updated?.published ?? history.published) + readme.slice(to + CLOSE.length);
  console.log(name, stats ? `total ${stats.total}, 30d ${stats.month}, 7d ${stats.week}` : "no download data yet");
}
await writeFile(README, readme);
