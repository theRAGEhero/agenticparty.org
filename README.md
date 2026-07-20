# agenticparty.org

Website for the **Agentic Party** initiative — participatory infrastructure for political
parties, presented through a retro late-90s / Y2K web aesthetic.

Built with [Hugo](https://gohugo.io/) on a vendored, heavily-customised
`vintage-web-hugo-theme`, output as a static site and served by nginx.

## Pages

| URL | Layout | What it is |
|-----|--------|-----------|
| `/` | `layouts/index.html` | Homepage: the political manifesto (fake Win95 windows) |
| `/participate/` | `_default/participate.html` | "Participation Router" — Citizen / Party / Researcher pathways |
| `/how-it-works/` | `_default/how-it-works.html` | 11 green-phosphor **CRT explainer animations** (canvas) |
| `/platform/` | `_default/platform.html` | Escher-style morphing-platform hero + module list |
| `/privacy/` | `_default/single.html` | Privacy policy (`content/privacy.md`) |

Most visible copy is **hardcoded in the layouts** (e.g. the manifesto lives in
`index.html`, not `content/_index.md`). The `content/*.md` files mainly set front-matter
(title/description/layout/url).

## Interactive pieces (all in `assets/js/main.js`)

- **Fake window controls** — minimize / maximize / close on every `.window`.
- **CRT explainer animations** — `initCrtCards()` drives every `<canvas data-crt="…">`.
  Each animation is a small module in the `CRT_ANIMS` registry (`topology`, `reach`,
  `synthesize`, `converge`, `deliberate`, `delegate`, `trace`, `ledger`, `roles`,
  `collective`, `celebrate`, plus the Platform `escher`). They share DPR-aware sizing,
  on-screen (IntersectionObserver) gating, `prefers-reduced-motion` handling and a CRT
  overlay. The single/shared/federated topology has its own `initPartyTopology()`.
- **Hidden easter-egg game** — `democracy-capacity.exe`, a civic maze/arcade game that
  launches **only when all homepage windows are closed** (`checkAllWindowsClosed`).
  Collect citizen signals → route them through Listen → Synthesize → Decide → Explain →
  Account, dodge the "failure mode" chasers, keep Trust above zero. Difficulty ramps by
  wave, WebAudio chiptune, and a `?` help popup.

### Adding a CRT animation
1. Add a module `{ setup, update, draw, view? }` to `CRT_ANIMS` in `main.js`.
2. Add a card with `<canvas class="topo-canvas" data-crt="yourname">` to the relevant layout.
3. Style lives in the `.crt-*` / `.topo-*` rules inside `hugo.toml`'s `custom_css`.

## Structure

- `hugo.toml` — site config **and** a large inline `custom_css` block (pathway + CRT-card styles)
- `content/` — page front-matter + `privacy.md`
- `themes/vintage-web-hugo-theme/`
  - `assets/js/main.js` — all interactivity (windows, animations, game)
  - `assets/css/main.css` — theme + game CSS
  - `layouts/` — custom page layouts and partials (nav, footer)
- `public/` — generated static output (committed; served by nginx)
- `deploy/nginx/agenticparty.org.conf` — reference nginx server block

## Build & deploy

```bash
hugo --minify                      # regenerate public/
rsync -a --delete public/ /var/www/agenticparty.org/
```

The live site is served from `/var/www/agenticparty.org` over HTTPS (Let's Encrypt via
certbot, behind a 443 stream demux → `127.0.0.1:8443`). nginx adds gzip, long-lived
`immutable` caching for the fingerprinted CSS/JS, and HSTS.

## SEO

`baseof.html` emits per-page `<title>`/description, canonical, Open Graph + Twitter cards,
and JSON-LD (`Organization` + `WebSite`). Hugo generates `sitemap.xml`; `robots.txt` allows
all and points to it.
