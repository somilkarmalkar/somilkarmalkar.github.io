# Validation — redesign, 17 November 2026

The layout was rebuilt to follow aqeelzowmi.com at the user's explicit request. It uses Somil's own content and collection assets.

- Six routes: home, favourites, games, watchlist, music, and résumé.
- Build and content validation passed: three projects, 24 games, 14 anime entries, seven TV shows.
- 36 Chromium route/viewport checks at 1440, 1024, 820, 768, 390, and 320px. No horizontal overflow, broken collection images, extra main h1 headings, or actual title/music-control collisions.
- Desktop column measurements match the reference: main width 740px and left edge 254.39px at 1440px, with Newsreader body and JetBrains Mono metadata.
- 35 interaction checks passed: three project dialogs; dark/dim/light themes and persistence; pixel and motion toggles; keyboard crystal rotation; artists panel; copy-email feedback; reduced-motion response; favourites coverflow and category switching; media dialogs; game search/filter/empty state/random selection; watch tabs/filter/search/keyboard; mobile navigation/settings; and one-page A4 printing. Async clipboard and media-query events were awaited before asserting their results.
- 12 additional WebKit route/viewport checks covered all six pages in iPhone-sized (390×844) and iPad-sized (820×1180) touch contexts. Carousel, mobile navigation, and watch tabs also passed in both. These are browser-engine emulations, not physical-device tests.
- No JavaScript page errors were recorded.
- The portable preview was checked separately for navigation, working collections, embedded assets, and no external asset requests.

## Limits

Production has not been deployed. No GitHub Pages or Name.com settings were changed during this redesign. The existing deployment setup and account-access blocker remain documented in SETUP.md.

Development design instructions and Playwright MCP configuration remain included. MCP has not been enabled in a separate client. Tests used Playwright directly.


## Motion update — 17 November 2026

- 16 motion-specific checks passed: cursor response, click ripple, paused canvas equality, paused CSS, Pixel Off, reduced-motion equality, animated carousel, immediate content updates, instant keyboard control, repeated input, detail dialogs, hover sheen, artist popover, page navigation, and watchlist content.
- In a fixed sampled background region, idle frames changed 0 pixels above the test threshold, cursor movement changed 15,356, and the initial click test changed 4,980. This verifies a response to input rather than ambient animation alone.
- 24 page/viewport checks across all six routes at 1440, 820, 390, and 320px found no horizontal overflow.
- Native Chromium touch input scrolled the game page 444px while effects were enabled. The pointer listeners did not block panning.
- WebKit touch contexts at iPhone and iPad sizes passed animated carousel selection, mobile navigation, overflow, and reduced-motion checks. No physical-device testing was performed.
- A local 75-frame cursor-sweep sample had median and 95th-percentile requestAnimationFrame intervals of approximately 16.7ms. This is an observed local sample, not a universal device-performance claim.
- No JavaScript page errors were observed.
- Native cross-document transitions are progressive enhancement; other browsers keep normal navigation and the lightweight intro animation. Reference: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@view-transition
# 17 November 2026: shared pixel scene and linked marks

- Built the six pages and passed the existing content checks. Compared content/site.json with the previous production commit: only the contribution/activity data was removed; project facts, watch progress, games, and artist ordering are unchanged.
- Checked all six routes at 320, 390, 768, 820, 1024, 1440, and 2560px widths (42 route/viewport checks): no horizontal overflow, broken loaded images, contribution graph, or turntable dock.
- Visually reviewed the blue shared-canvas field, enlarged atom/controller at 2560×1440, and the game shelf at 390px. Game/anime images report natural dimensions 32×48 with pixelated rendering, including newly inserted search results, favourites tabs, and game details. TV artwork remains unchanged.
- Exercised game search and rotation filters, details dialogs, favourites anime/TV tabs, watchlist anime/TV search, mobile navigation, theme cycling, pixel off/on, keyboard rotation, and home project/experience object switching. Pause produced identical scene-region screenshots across observations. Browser-back navigation retained functioning canvas controls.
- The new renderer respects reduced-motion, hidden-page, and touch-pan preferences in code. System reduced-motion emulation and physical-device testing were not available in this browser session; no such checks are claimed for this revision.
- No runtime errors were recorded in the preview. The mechanical design scan reported no findings, with stylesheet-resolution limits for the unbuilt HTML template; actual built pages were checked in the browser.
