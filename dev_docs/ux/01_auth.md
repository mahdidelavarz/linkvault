# Authentication

## Purpose

Authentication is the entry gate to the entire application. Every piece of data in the vault belongs to exactly one account. The user must be authenticated to access any content. Sessions persist silently — the user should not be interrupted by re-authentication unless their session has fully expired.

---

## The User

A developer who has created an account and returns to the app regularly. They expect to authenticate once and stay logged in for extended periods. They may access the app from multiple devices.

---

## Information & Data

### Account fields
- **Username** — required, unique across the system, 1–50 characters
- **Email** — optional, unique across the system if provided; used only for password recovery
- **Password** — required at creation; stored as a hash (never as plaintext); minimum constraints apply

### Session data (not user-visible)
- Access token — short-lived; sent with every request
- Refresh token — long-lived; used to silently obtain new access tokens
- Tokens rotate: each refresh issues a new pair and invalidates the old refresh token

---

## Flows

### Register
1. User provides: username, password, and optionally email
2. System validates uniqueness of username (and email if provided)
3. Account is created; user is immediately authenticated (no email verification step)
4. User lands on the dashboard

### Login
1. User provides: username and password
2. System validates credentials
3. On success: access + refresh tokens are issued; user lands on the dashboard
4. On failure: user is informed that credentials are incorrect (no distinction between wrong username vs. wrong password for security)

### Forgot Password
1. User provides their registered email address
2. System sends a reset link to that email (link expires in 1 hour; single-use)
3. User clicks the link in their email

### Reset Password
1. User is on the reset page (arrived via the emailed link)
2. User provides: new password + confirmation
3. On success: password is updated; user may now log in with the new password
4. The reset token is invalidated after use

### Silent Session Refresh
- Happens automatically in the background when the access token nears expiry
- The user is not shown any prompt
- If the refresh token has also expired, the user is redirected to login

### Logout
- User explicitly logs out
- Both tokens are invalidated immediately
- User is returned to the login screen

---

## States

| State | Description |
|-------|-------------|
| Unauthenticated | User is not logged in; can only access login, register, and password reset pages |
| Authenticated | User has a valid session; full app access |
| Session expired | Tokens have expired; user is redirected to login with a message indicating their session ended |
| Password reset in progress | User arrived via a reset link; the link may be valid, expired, or already used |

---

## Rules & Constraints

- Username: unique system-wide, max 50 characters
- Email: optional; if provided, must be unique system-wide; required to use password reset
- Rate limiting: 10 login/register attempts per 15 minutes per IP; 5 password reset requests per hour per IP
- Reset links expire after 1 hour and are single-use
- If a user registered without an email, they cannot use the "forgot password" flow — there is no recovery path in that case
- There is currently no email verification step (no "confirm your email" flow)

---

## Edge Cases

- **Register with no email**: Valid. The account works normally. Password reset by email is not available.
- **Forgot password with unregistered email**: System should not confirm or deny whether the email exists (prevents email enumeration); same response either way.
- **Expired reset link**: User is informed the link has expired and is prompted to request a new one.
- **Already-used reset link**: Same treatment as expired.
- **User on a second device**: Session from the second device continues independently; logging out on one device does not log out the other (refresh tokens are per-device).
