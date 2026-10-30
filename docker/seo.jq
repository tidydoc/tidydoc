# Builds, from content.json, what search engines and link previews need without running
# JavaScript: one HTML file per page (title, description, canonical, Open Graph), the 404
# fallback index.html, sitemap.xml, robots.txt and llms.txt.
# Input: content.json. Args: --rawfile template index.template.html. Env: see entrypoint.sh.
# Output: one "<path>\t<base64 content>" line per file, written by generate.sh.

def env_or($key; $fallback):
  ($ENV[$key] // "" | sub("^\\s+"; "") | sub("\\s+$"; "")) as $value
  | if $value == "" then $fallback else $value end;

# Keep in sync with routeFromPath() in app/src/content/slug.ts.
def route:
  sub("\\.md$"; ""; "i")
  | split("/") | map(select(. != "") | sub("^[0-9]+[-_]"; "") | ascii_downcase | gsub("\\s+"; "-"))
  | if last == "index" then .[:-1] else . end
  | "/" + join("/");

def humanize:
  split("/") | last | sub("\\.md$"; ""; "i") | sub("^[0-9]+[-_]"; "") | gsub("[-_]+"; " ")
  | sub("^\\s+"; "") | sub("\\s+$"; "")
  | (.[:1] | ascii_upcase) + .[1:];

# Flat `key: value` lines only: enough for title, description and hidden.
def frontmatter_fields:
  [splits("\\r?\\n") | capture("^(?<key>[A-Za-z_]+):\\s*(?<value>.*?)\\s*$")]
  | map(.value |= if test("^\".*\"$") then .[1:-1] | gsub("\\\\(?<char>[\"\\\\])"; .char)
                   elif test("^'.*'$") then .[1:-1] | gsub("''"; "'")
                   else sub("\\s+#.*$"; "") end)
  | map(select(.value != ""))
  | from_entries;

def split_frontmatter:
  (first(match("\\A---\\r?\\n([\\s\\S]*?)\\r?\\n---[ \\t]*(?:\\r?\\n|\\z)")) // null) as $match
  | if $match == null then { fields: {}, body: . }
    else { fields: ($match.captures[0].string | frontmatter_fields), body: .[$match.length:] } end;

# First `# Heading`, ignoring fenced code.
def first_h1:
  reduce (split("\n")[] | sub("\\r$"; "")) as $line ({ fence: false, h1: null };
    if .h1 != null then .
    elif ($line | test("^\\s*(```|~~~)")) then .fence |= not
    elif .fence then .
    else .h1 = ($line | first(capture("^#\\s+(?<title>.+?)\\s*#*\\s*$").title) // null)
    end)
  | .h1;

# Keep in sync with buildPage() and buildSite() in app/src/content/nav.ts.
def pages:
  .files as $files
  | [$files[] | select(.path | test("(^|/)_meta\\.json$")) | select(.path != "_meta.json")
     | select((.raw | try fromjson catch null) | type == "object" and .hidden == true)
     | .path | sub("_meta\\.json$"; "")] as $hidden_folders
  | [$files[] | select(.path | test("\\.md$"; "i"))
     | . as $file
     | (.raw | split_frontmatter) as $doc
     | {
         path,
         route: (.path | route),
         title: ($doc.fields.title // ($doc.body | first_h1) // (.path | humanize)),
         description: ($doc.fields.description // ""),
         hidden: ($doc.fields.hidden == "true" or any($hidden_folders[]; . as $folder | $file.path | startswith($folder)))
       }]
  | group_by(.route) | map(last)
  | sort_by(.route != "/", .path);

def raw_url: if . == "/" then "/index.md" else . + ".md" end;

def encode_path: split("/") | map(@uri) | join("/");

def json_ld: tojson | gsub("<"; "\\u003c");

env_or("SITE_URL"; "") as $site_url_raw
| ($site_url_raw | sub("/+$"; "")) as $site_url
| env_or("SITE_TITLE"; "Documentation") as $site_title
| env_or("SITE_DESCRIPTION"; "") as $site_description
| env_or("FAVICON_URL"; "/favicon.svg") as $favicon

| def absolute:
    if . == null then null
    elif test("^https?://") then .
    elif $site_url == "" then null
    else $site_url + (if startswith("/") then . else "/" + . end) end;

  env_or("OG_IMAGE_URL"; "") as $og_image_raw
| (if $og_image_raw == "" then null else $og_image_raw | absolute end) as $og_image
| pages as $pages
| [$pages[] | select(.hidden | not)] as $visible

# $page is null for the fallback index.html, served with a 404 status.
| def html($page):
    ($page.title // $site_title) as $og_title
    | (if $page == null or $page.route == "/" then $site_title else "\($page.title) · \($site_title)" end) as $title
    | (if ($page.description // "") != "" then $page.description else $site_description end) as $description
    | (if $page == null then null else $page.route | encode_path | absolute end) as $url
    | ([
        (if $description != "" then @html "<meta name=\"description\" content=\"\($description)\" />" else empty end),
        (if $page == null then "<meta name=\"robots\" content=\"noindex\" />" else empty end),
        (if $url then @html "<link rel=\"canonical\" href=\"\($url)\" />" else empty end),
        (if $page then @html "<link rel=\"alternate\" type=\"text/markdown\" href=\"\($page.route | raw_url | encode_path)\" />" else empty end),
        @html "<meta property=\"og:type\" content=\"\(if $page == null or $page.route == "/" then "website" else "article" end)\" />",
        @html "<meta property=\"og:site_name\" content=\"\($site_title)\" />",
        @html "<meta property=\"og:title\" content=\"\($og_title)\" />",
        (if $description != "" then @html "<meta property=\"og:description\" content=\"\($description)\" />" else empty end),
        (if $url then @html "<meta property=\"og:url\" content=\"\($url)\" />" else empty end),
        (if $og_image then @html "<meta property=\"og:image\" content=\"\($og_image)\" />" else empty end),
        "<meta name=\"twitter:card\" content=\"\(if $og_image then "summary_large_image" else "summary" end)\" />",
        (if $page.route == "/" and $site_url != "" then
          "<script type=\"application/ld+json\">\({ "@context": "https://schema.org", "@type": "WebSite", name: $site_title, url: ($site_url + "/"), description: (if $description != "" then $description else null end) } | with_entries(select(.value != null)) | json_ld)</script>"
        else empty end)
      ] | join("\n    ")) as $head
    | ([
        "<noscript>",
        (@html "<h1>\($og_title)</h1>"),
        (if $description != "" then @html "<p>\($description)</p>" else empty end),
        "<ul>",
        ($visible[] | @html "<li><a href=\"\(.route | encode_path)\">\(.title)</a></li>"),
        "</ul>",
        "</noscript>"
      ] | join("\n    ")) as $body
    | $template
    | sub("<title>[^<]*</title>"; @html "<title>\($title)</title>")
    | sub("<link rel=\"icon\" href=\"[^\"]*\""; @html "<link rel=\"icon\" href=\"\($favicon)\"")
    | split("<!--tidydoc:head-->") | join($head)
    | split("<!--tidydoc:body-->") | join($body);

  ($pages[] | [(if .route == "/" then "_pages/index.html" else "_pages\(.route).html" end), html(.)]),
  ["index.html", html(null)],
  (if $site_url != "" then
    ["sitemap.xml", ([
      "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
      "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">",
      ($visible[] | @html "  <url><loc>\(.route | encode_path | absolute)</loc></url>"),
      "</urlset>",
      ""
    ] | join("\n"))]
  else empty end),
  ["robots.txt", ([
    "User-agent: *",
    "Allow: /",
    (if $site_url != "" then "", "Sitemap: \($site_url)/sitemap.xml" else empty end),
    ""
  ] | join("\n"))],
  ["llms.txt", ([
    "# \($site_title)",
    "",
    (if $site_description != "" then "> \($site_description)", "" else empty end),
    ($visible[] | "- [\(.title)](\(.route | raw_url | encode_path | (absolute // .)))\(if .description != "" then ": \(.description)" else "" end)"),
    ""
  ] | join("\n"))]
| "\(.[0])\t\(.[1] | @base64)"
