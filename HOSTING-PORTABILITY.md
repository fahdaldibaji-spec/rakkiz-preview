# Rakkiz Hosting Portability

This prototype is intentionally provider-neutral.

## Runtime modes
- `local`: current GitHub Pages prototype. Persistent demo preferences stay in the browser.
- `rest`: production server mode. The UI calls same-origin `/api` endpoints and authenticates with secure cookies.

Changing hosting providers must not require changing UI screens. Only the server implementation behind the API changes.

## Required production properties
- HTTPS only.
- Same-origin API when possible.
- HttpOnly + Secure + SameSite session cookies.
- Server-side authorization on every student/class/report/file operation.
- No passwords, OTPs, Nafath secrets, Noor credentials, database secrets, or storage keys in browser JavaScript.
- Private file storage. Downloads must be permission-checked or short-lived signed URLs.
- Rate limiting and audit logging for authentication, exports, grade changes, student identity changes, and file access.
- Database backups with tested restore procedure.
- Separate development/test/production environments.

## Portable API surface (v1)
- `GET /api/health`
- `GET /api/auth/session`
- `POST /api/auth/logout`
- `GET /api/bootstrap`
- `GET /api/settings?key=...`
- `PUT /api/settings/:key`
- `DELETE /api/settings/:key`
- `POST /api/files`
- Resource APIs are exposed below `/api/<resource>` and implemented server-side.

## Hosting target
The final provider may be any Saudi-hosted platform that can provide:
1. HTTPS and a real backend runtime (Node/PHP/etc.).
2. A supported relational database (MySQL/PostgreSQL preferred).
3. Private file/object storage or a protected filesystem.
4. Scheduled jobs/queues or an equivalent worker mechanism.
5. Backups, logs, and SSH/SFTP or a controlled deployment mechanism.

The frontend must never depend on Cloudflare-specific APIs. Cloudflare can still be used during prototyping or as an edge/CDN layer without becoming a hard dependency.
