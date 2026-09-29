# A-1 Lion Locksmith — code preview

Static preview of es-locksmith.com. It keeps all 35 current page and post paths and uses a separate project name. The production domain must remain on WordPress until the contact form is configured and tested end to end, page copy and design have been reviewed, and a live preview passes mobile QA. This is not a production-ready replacement yet.

Run `python3 src/build.py` to generate `public/` from the checked-in public content snapshot. Serve locally with `python3 -m http.server 8000 -d public`. To refresh the snapshot, first download the two live Yoast sitemaps to `/tmp/a1-pages.xml` and `/tmp/a1-posts.xml`, then run `python3 src/build.py --refresh`.

The contact form uses the Vercel `/api/contact` endpoint. Its destination is `A1lionlocksmith@gmail.com`, as specified by the owner. It needs `RESEND_API_KEY` and `CONTACT_FROM` environment variables; the sender domain must be verified with the mail provider. Do not launch on the production domain until a real submission arrives at the destination inbox. The existing WordPress form's submissions and integrations are not migrated by this prototype.

The old `/elementor-2347/` route redirects permanently to the current emergency article. Legacy Yoast sitemap URLs redirect to the new sitemap. Other paths preserve their present slugs. The source text is a snapshot from the public site and must be edited and reviewed for accuracy, uniqueness, and claims before launch. The design currently has no custom logo or most of the original photography.

## Launch gates

1. Create a new GitHub repository for A-1 Lion Locksmith; do not use the garage repository.
2. Deploy a separate Vercel preview using `public` as the output directory and the root `api` function.
3. Configure the three email environment variables, send a controlled test, and verify inbox delivery and error handling.
4. Review the 35 pages, navigation, legal copy, mobile layout, calls, and redirects on the preview.
5. Compare analytics, Search Console, and conversion tracking with the live site; retain a rollback path.
6. Only after approval and passing the checks, plan the domain cutover and sitemap submission.
