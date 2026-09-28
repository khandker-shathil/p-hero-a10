> Backend code and MongoDB tests have moved to `../p-hero-a10-server`.
> Next.js forwards `/api/*` through `API_SERVER_URL`; credentials live only in the server.

# Public lesson browsing

Open `/public-lessons`. Anyone can browse; authentication is optional.

## Request flow

1. The page reads and normalizes URL parameters: `q`, `category`, `tone`, `sort`,
   and `page`. Applying a search resets the page to 1.
2. `LessonBrowser` requests `/api/lessons` with those same parameters. Aborted
   requests cannot overwrite newer results. Filters survive refresh and browser
   back/forward navigation.
3. The API verifies the optional Better Auth session and queries MongoDB.
4. MongoDB filters public lessons, counts results, sorts them, and returns nine
   cards per page. Most-saved sorting counts distinct savers from `favorites`.
5. Shared `LessonCard` components render the results using the homepage design.

Example:

`/public-lessons?q=growth&category=Career&tone=Gratitude&sort=most-saved&page=2`

Unknown filters use safe defaults. Search is a case-insensitive literal substring,
not executable regular-expression syntax. Keywords match title, category, tone,
and descriptions that the current viewer is allowed to read.

Private lessons never enter the results or counts. Premium descriptions are
excluded from both previews and keyword matches unless the server-verified user
is premium or owns the lesson. The API returns only whitelisted card fields;
full stories and private account fields are not returned. Personalized responses
use `Cache-Control: private, no-store`.

The `/lessons/[id]` page now calls the protected Express detail endpoint.
The `/pricing` payment flow remains future work.

## Verification

Run these commands from `../p-hero-a10-server`.

`node --test tests/public-lessons.test.mjs`

For read-only MongoDB aggregation tests using isolated `$documents` fixtures:

`RUN_MONGO_TESTS=1 node --env-file=.env --test tests/public-lessons.test.mjs`

The MongoDB tests do not insert, update, or delete records. They check private
lesson exclusion, premium preview/search permissions, combined filters, literal
search, sorting, duplicate-save counting, and page boundaries.
