# Design system

The user explicitly requested that the entire layout match aqeelzowmi.com on 17 November 2026. This supersedes the earlier paper-and-green editorial design and the earlier instruction to avoid closely matching the reference. The content remains Somil's.

## Layout and typography

Dark default background #08090b, foreground #ece9e2, secondary text #b6b5b1 and #9298a2, fine rules #32363e. Newsreader variable serif for body and display; JetBrains Mono for metadata. Fonts are self-hosted with OFL licences. Desktop body is 18px/1.55; page headings 54.4px/1; section headings 27.2px/1.15.

Desktop shell: 6vw side padding, a 120px sticky left navigation rail, a 48px column gap, and a 740px content column. Content starts at 88px. At 900px and below, navigation becomes a full-screen mobile menu; content starts at 84px with 16px side margins. Phone page headings are 41.6px; the full personal name scales down enough to fit beside the corner music control.

Home: lowercase name and social links, four dash-led introduction lines, linked gold program tag with the official Waterloo shield, grey bracketed co-op date, plain project descriptions and monospace metadata, compact experience timeline, tools/skills, and email contact. The contribution graph is removed at Somil's request. No large project preview cards or oversized editorial hero.

Personal pages: favourites coverflow with category tabs, side covers, previous/next controls, counter and caption; four-column media shelves with thin wooden ledges on desktop and two columns on phones; separate games, watchlist, and music routes. Titles and watch statuses are the user's, not the reference person's.

Four fixed circular display/contact controls sit at the top right. The empty turntable control is removed; artist links remain on the music page. No audio autoplays and no fake playback is shown. A shared blue dithered canvas renders both the background and section-specific 3D objects, using the same pixel grid and palette so object edges dissolve into the field. Objects scale with the open space beside the content and grow substantially on 2560×1440 displays. Motion and pixels can be paused independently, reduced-motion preferences are respected, and the theme cycles through dark, dim, and light.

Waterloo, DECA, and Air Cadet League marks link to their official sites. Model UN uses a generic linked globe, avoiding an invented chapter affiliation or UN endorsement. Logo sources and credits are in ASSETS-logos.json. Game and anime artwork is rendered in a 32×48 limited-palette pixel-painting style, with nearest-neighbour scaling across shelves, favourites, thumbnails, and detail dialogs. Original local artwork remains the fallback; television artwork retains its existing treatment.

## Content and behavior

Professional and personal pages remain separate. Preserve game/anime/show progress, project contributions, private-source restrictions, and upstream attribution. No comments or activity/message board, even though the reference has one. Project and media details use labelled native dialogs. Search, filters, carousel arrows/swipes/keyboard, mobile navigation, copy email, artist links, and a printable resume must continue to work.

Only dist/ is deployed. Development documentation and skills do not ship. The editable facts remain in content/site.json. Do not restore the old Bricolage/Manrope, paper background, rust accents, chip hero, or large project cards during a routine update.


## Cursor interaction and motion

Added at the user's request on 17 November 2026. The pixel field follows the pointer with a damped spring, bends nearby pixels, leaves a short fading wake, and emits a restrained expanding ripple on clicks or touches. Keep the system cursor and normal scrolling. Pointer positions are transient in-memory visual state, never sent anywhere. The grid is cached on resize; the renderer avoids layout reads per frame, sleeps when hidden, and uses faster updates only while responding to input.

Pause clears and freezes the pointer effects and stops decorative CSS/WAAPI motion. Reduced motion does the same automatically. Pixel Off clears the field. Touch input is passive and must not block native panning. Keep the blue interaction dimmer behind readable text.

The favourites carousel uses a 280ms FLIP-style transition with the existing strong ease-out token, preserving the displayed item immediately and handling repeated input without drift. Keyboard carousel actions are instant. Covers and records have a subtle pointer-following sheen; controls retain short press feedback. Intro entries and same-origin page transitions are gentle and progressive; native navigation remains the fallback. The portable preview has an equivalent short frame crossfade and forwards pause/reduced-motion changes. No animation library or backend dependency is required.
