import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const content = JSON.parse(readFileSync(new URL("../src/content.json", import.meta.url), "utf8"));
const requiredLocalizedFields = ["subtitle", "overview", "challenge", "solution", "impact", "status"];

test("six featured case studies are complete and uniquely identified", () => {
  assert.equal(content.featured.length, 6);
  const ids = content.featured.map((project) => project.id);
  assert.equal(new Set(ids).size, ids.length);

  for (const project of content.featured) {
    assert.match(project.id, /^[a-z0-9-]+$/);
    assert.ok(["public", "private", "fork"].includes(project.visibility));
    assert.ok(project.tech.length >= 4);
    for (const field of requiredLocalizedFields) {
      assert.ok(project[field].fr.trim(), `${project.id}.${field}.fr is required`);
      assert.ok(project[field].en.trim(), `${project.id}.${field}.en is required`);
    }
    if (project.visibility === "private") assert.equal(project.url, undefined);
    if (project.url) assert.match(project.url, /^https:\/\/github\.com\/kaa-serpent\//);
  }
});

test("laboratory projects have bilingual summaries and valid categories", () => {
  const validCategories = new Set(["ai", "data", "automation", "maker"]);
  assert.ok(content.laboratory.length >= 7);
  for (const project of content.laboratory) {
    assert.ok(project.overview.fr.trim());
    assert.ok(project.overview.en.trim());
    assert.ok(project.categories.every((category) => validCategories.has(category)));
  }
});

test("every experience and capability is bilingual", () => {
  for (const experience of content.experiences) {
    assert.ok(experience.role.fr && experience.role.en);
    assert.ok(experience.summary.fr && experience.summary.en);
    assert.ok(experience.highlights.every((item) => item.fr && item.en));
  }
  for (const group of content.skillGroups) {
    assert.ok(group.title.fr && group.title.en);
    assert.ok(group.intro.fr && group.intro.en);
    assert.ok(group.items.length >= 6);
  }
});

test("required public assets exist", () => {
  const root = new URL("..", import.meta.url);
  for (const path of [
    "public/favicon.svg",
    "public/og.png",
    "public/projects/rotarycam.jpg",
    "public/projects/ollama-mcp.jpg",
    "public/Guillaume_de_Cadoudal_CV_AI_Python_Engineer.pdf",
  ]) assert.ok(existsSync(new URL(path, root)), `${path} is missing`);

  for (const project of [...content.featured, ...content.laboratory]) {
    assert.ok(project.media, `${project.id}.media is required`);
    assert.ok(existsSync(new URL(`public/${project.media}`, root)), `${project.media} is missing`);
  }
});

test("the portfolio uses the full name instead of initials", () => {
  const app = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(app, /G[·.]C/);
  assert.match(app, /Guillaume de Cadoudal/);
});

test("parallax layers respect reduced-motion preferences", () => {
  const app = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
  const styles = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
  assert.match(app, /data-parallax/);
  assert.match(app, /prefers-reduced-motion: reduce/);
  assert.match(app, /pointer: coarse/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
});

test("public source does not expose the phone number", () => {
  const files = ["src/content.json", "src/App.tsx", "index.html", "scripts/generate_cv.py"];
  const root = new URL("..", import.meta.url);
  const source = files.map((path) => readFileSync(new URL(path, root), "utf8")).join("\n");
  assert.doesNotMatch(source, /(?:\+33\s*6|06[ .-]?18[ .-]?66)/);
});

test("GitHub Pages metadata uses the portfolio base path", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /https:\/\/kaa-serpent\.github\.io\/portfolio\//);
  assert.match(html, /\/portfolio\/favicon\.svg/);
  assert.match(html, /\/portfolio\/og\.png/);
});
