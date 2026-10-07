# Tejas Reminder

Mobile-first GitHub Pages reminder dashboard.

## Current version
- Password gate
- 24-hour circular countdown
- First running time
- Adjustable offset in minutes (default 40)
- Adjustable cycle length in hours (default 24)
- Local persistence with localStorage
- Browser notification permission button

## Important
The included demo password is `tejas`. Change it before publishing.

For real security, do not rely on a password embedded in client-side JavaScript. GitHub Pages is static. The next version should use Google OAuth / a backend or another authentication provider.

## Google Calendar + email
A GitHub Pages frontend should not contain Google API secrets. The recommended next step is a small Google Apps Script web app that:
1. Receives the calculated reminder time.
2. Creates/updates a Google Calendar recurring event.
3. Sends reminder emails.
4. Keeps credentials server-side.
