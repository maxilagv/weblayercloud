#!/usr/bin/env node

const baseUrl = process.env.SEO_AUDIT_URL ?? "http://localhost:3000";

const routes = [
  "/",
  "/servicios",
  "/servicios/web",
  "/servicios/crm",
  "/servicios/campus",
  "/servicios/ia",
  "/contacto",
];

function attr(html, selector) {
  const patterns = {
    description: /<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i,
    canonical: /<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i,
  };
  return html.match(patterns[selector])?.[1] ?? "";
}

function title(html) {
  return html.match(/<title>(.*?)<\/title>/i)?.[1]?.trim() ?? "";
}

function jsonLdBlocks(html) {
  return [...html.matchAll(/<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(
    (match) => match[1].trim(),
  );
}

function canonicalFor(route) {
  return new URL(route, "https://weblayer.cloud").toString().replace(/\/$/, "");
}

let failures = 0;

for (const route of routes) {
  const url = new URL(route, baseUrl).toString();
  const res = await fetch(url);
  const html = await res.text();
  const pageTitle = title(html);
  const description = attr(html, "description");
  const canonical = attr(html, "canonical");
  const jsonLd = jsonLdBlocks(html);
  const expectedCanonical = canonicalFor(route);

  const checks = [
    [res.status < 400, `status ${res.status}`],
    [pageTitle.length >= 10, "title present"],
    [description.length >= 60, "description present"],
    [canonical === expectedCanonical, `canonical ${canonical || "missing"}`],
    [jsonLd.length >= 1, "json-ld present"],
  ];

  for (const block of jsonLd) {
    try {
      JSON.parse(block);
    } catch {
      checks.push([false, "json-ld parseable"]);
    }
  }

  const bad = checks.filter(([ok]) => !ok);
  if (bad.length) {
    failures += bad.length;
    console.error(`FAIL ${route}`);
    for (const [, label] of bad) console.error(`  - ${label}`);
  } else {
    console.log(`OK   ${route}`);
  }
}

if (failures) {
  console.error(`\nSEO audit failed with ${failures} issue(s).`);
  process.exit(1);
}

console.log("\nSEO audit passed.");
