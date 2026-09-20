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
