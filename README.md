# agenticparty.org

Hugo source for `agenticparty.org`, currently using the `vintage-web-hugo-theme`.

## Structure

- `hugo.toml`: site configuration
- `content/`: homepage, pages, and manifesto posts
- `themes/vintage-web-hugo-theme/`: installed Hugo theme
- `public/`: generated static output served by nginx
- `deploy/nginx/agenticparty.org.conf`: nginx server block

## Build

Generate the static site with:

```bash
hugo --minify
```

The published site is served from `/var/www/agenticparty.org`.
