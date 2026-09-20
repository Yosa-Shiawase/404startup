## Work section (v4)
work/ holds CUSTOM BUILD case studies (client showcase, not games).
work/index.html has a small inline JS array of cards — add one object per new
client. Each case lives in work/<client>/<client>.html, is hand-authored
(no generator), uses the client's palette, and ends with the Instagram CTA.
When adding a client: add their card to work/index.html, create the folder +
case page, add both URLs to sw.js PRECACHE, bump the cache version.

## Canvas measure() rule (v5)
Every canvas game runs a periodic measure() watchdog (setInterval ~500ms).
measure() MUST early-return when the viewport size is unchanged (track
measure.lw/lh or lastW/lastH at the top) and MUST NOT reset gameplay state
(paddle positions, target bands, sequences, cameras) on watchdog ticks.
Gameplay state may only re-center/reset on a genuine viewport size change,
or on explicit ready/restart. All library/*/ canvas games follow this rule.

## Shared nav (v6)
assets/nav.js injects burger + fullscreen menu on SECTION pages (library index,
work index, case pages, library/*/*_page.html). Include with
<script src="/assets/nav.js"></script> immediately before </body>.
Do NOT include it in index.html or dashboard.html (they manage their own nav)
and do NOT include it in library/<dir>/<dir>.html play pages or 404.html
(minimal HUD / offline fallback is intentional). nav.js is idempotent
(n4menu id guard), highlights the active page, applies the orbit theme, and
provides a window.toggleTheme fallback for footer toggles.

## Waiting rooms (v7 update)
Ambient waiting pages now: library/matrix/rain.html, library/sonar/idle.html,
library/vapor/radio.html. Each: self-contained, no score, back link to its
game dir, tap interaction only, measure() guard per rule v5, precached in sw.
Their buttons are injected into the matching *_page.html by the build_library.sh
post-pass (matrix, sonar, vapor).
