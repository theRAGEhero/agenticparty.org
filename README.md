# Agentic Party

**Participatory infrastructure for political parties** — renewing political organizations
around trust, listening and democratic capacity.

Website: **[agenticparty.org](https://agenticparty.org)** · Contact: **hello@agenticparty.org**

---

## What this is

The **Agentic Party** initiative exists for people who want a state that can actually act,
a democracy that can actually listen, and public institutions that can actually deliver.

People trust institutions when they can see how decisions are made, when they have real
channels to contribute, and when a political organization can show that **listening has
consequences**. Yet most parties use technology only for campaigning — social media, ads,
newsletters, targeting. That never answers the deeper question:

> How can a party become better at listening, deciding, explaining, and remaining accountable?

That is where the Agentic Party initiative begins.

An **agentic party is not a party governed by AI.** It is not a machine replacing political
judgement, and not a shortcut around leadership, ideology, conflict or responsibility. An
agentic party uses technology to **increase the political agency of humans** — citizens,
members, representatives, local groups and elected officials. The purpose is not to automate
politics; it is to make democratic organization more capable.

### Agency, not just a vote

To be *agentic* is to treat every citizen as more than an elector. The same person can raise
a concern, contribute an idea, join a working group, hold leadership to account and help
shape a decision — often at the same time. Technology should **widen that agency**, never
replace it, and keep a visible trace from contribution to outcome.

## What the platform does

The platform is not a fixed product; it's a set of modules that recombine to fit a party's
size, culture and constraints:

- **Listening** — structured channels that gather contributions, not just broadcast messages.
- **Synthesis** — clustering many contributions into clear themes *without flattening*
  minority and dissenting voices.
- **Decisions** — transparent, accountable decision pathways from "what people said" to
  "what the party chose".
- **Working groups** — turning shared positions into real teams.
- **Delegation** — flexible, revocable representation, delegated topic by topic and reclaimed
  at any time.
- **Public ledger** — signed, timestamped, tamper-evident records of votes, funds and
  decisions, open to inspection.

Together these turn scattered participation into legible collective intelligence: the
platform sits **between the people and the party**, synthesising contributions upward and
carrying direction back down.

### Deployment models

The same software adapts to the political reality:

- **Single** — one party on its own dedicated platform.
- **Shared** — many parties hosted together on shared, multi-tenant infrastructure.
- **Federated** — each party runs its own platform, interlinked with the others.

There is no single template. A national party, a local civic list and a new movement each
need a different architecture — becoming agentic is a practical and political *transition*,
not a product install.

## Get involved

- **Weekly open call** — Thursdays 18:00 CET/CEST.
- **Telegram** — [t.me/agenticparty](https://t.me/agenticparty).
- **Email** — hello@agenticparty.org, for parties, researchers and citizens who want to
  explore this transition.

Related initiative: [AgenticState.org](https://agenticstate.org/) — a more responsive,
capable state. If the state changes, political parties cannot remain the same.

---

## About this repository

This repo is the **website** for the initiative — a static site built with
[Hugo](https://gohugo.io/) and a customised retro (`vintage-web-hugo-theme`) look, served by
nginx. It's mostly informational, with interactive canvas animations and a hidden
civic arcade game (`democracy-capacity.exe`, launched by closing all the homepage windows).

### Build & deploy

```bash
hugo --minify                                   # generate public/
rsync -a --delete public/ /var/www/agenticparty.org/
```

The live site is served from `/var/www/agenticparty.org` over HTTPS (Let's Encrypt).

### Layout

- `hugo.toml` — site config + a large inline `custom_css` block.
- `content/` — page front-matter and the privacy policy.
- `themes/vintage-web-hugo-theme/` — layouts, plus `assets/js/main.js`
  (window controls, the CRT explainer animations, and the game) and `assets/css/main.css`.
- `public/` — generated static output (committed; served by nginx).

Most on-page copy is authored directly in the layouts (e.g. the manifesto lives in
`layouts/index.html`).
