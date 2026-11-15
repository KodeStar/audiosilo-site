---
title: "Sign in to AudioSilo with Authentik, Authelia, Keycloak or Pocket ID"
description: "In AudioSilo 2.7, people can sign in to the admin console and the web player with your identity provider, through OpenID Connect single sign-on."
kind: feature
published: 2026-11-15
verified: 2026-11-15
appliesTo: Server 2.7.0 with its bundled web player (not released yet)
tags: [single-sign-on, oidc, admin, self-hosting, security, player]
covers:
  - server:sso
  - server:security
  - server:admin
  - server:notifications
  - server:web
  - app:web-player
  - app:connect
  - docs:/users/admin/single-sign-on
  - docs:/users/admin/sso/authentik
  - docs:/users/admin/sso/authelia
  - docs:/users/admin/sso/keycloak
  - docs:/users/admin/sso/pocket-id
  - docs:/users/admin/notifications
  - docs:/users/admin/users-and-invites
  - docs:/developers/server/configuration
related:
  - nas-and-sign-in-proxy
  - admin-console-tour
  - listen-away-from-home
draft: true
---

AudioSilo 2.7 adds single sign-on with OpenID Connect. People sign in to the admin console and the web player with the account they already have at your identity provider, such as Authentik, Authelia, Keycloak or Pocket ID. You decide who gets an account and who is an admin.

The iOS and Android apps don't offer it. They keep signing in by QR code, invite or password.

## What you need

- A public address in **Server > Settings > General**, such as `https://books.example.com`. Your provider sends people back to it.
- An identity provider that speaks OpenID Connect.
- A way to change the server's `config.yaml` or its environment variables. The provider can't be set from the console.

## Turn it on

To turn on single sign-on, register AudioSilo at your provider, then give the server the provider's details.

1. At your provider, create an OpenID Connect client for AudioSilo. Give it this redirect URI, with your public address at the front: `https://books.example.com/api/v1/auth/oidc/callback`
2. Note the provider's issuer address, the client ID and the client secret.
3. Add them to the server's environment, as below, or to `config.yaml`.
4. Restart the server.

With Docker Compose, the variables go under the server's `environment:`:

```yaml
    environment:
      AUDIOSILO_OIDC_ENABLED: "true"
      AUDIOSILO_OIDC_NAME: "Authentik"
      AUDIOSILO_OIDC_ISSUER: "https://auth.example.com/application/o/audiosilo/"
      AUDIOSILO_OIDC_CLIENT_ID: "audiosilo"
      AUDIOSILO_OIDC_CLIENT_SECRET: "the client secret"
```

The name is what the button says, here "Sign in with Authentik". The issuer must be exactly what your provider states, a trailing `/` included. To keep the secret out of the file, put it in a file such as a Docker secret and set `AUDIOSILO_OIDC_CLIENT_SECRET_FILE` to its path.

Now open **Server > Settings > Sign-in** in the console. **Status** reads **Connected to the provider**, and the console's sign-in page shows **Sign in with Authentik**. If a setting is wrong, **Status** gives the reason. The server keeps running, and password sign-in still works.

## A guide for each provider

The docs have a page for each of four providers, with the steps at the provider and the settings for AudioSilo:

| Provider | Its issuer looks like | Good to know |
|---|---|---|
| [Sign in with Authentik](https://docs.audiosilo.app/users/admin/sso/authentik) | `https://auth.example.com/application/o/audiosilo/` | Its application wizard makes the provider and the application together. |
| [Sign in with Authelia](https://docs.audiosilo.app/users/admin/sso/authelia) | `https://auth.example.com` | The client goes in Authelia's configuration file, with a hash of the secret. |
| [Sign in with Keycloak](https://docs.audiosilo.app/users/admin/sso/keycloak) | `https://auth.example.com/realms/home` | Add a `groups` client scope first. Keycloak refuses a sign-in that asks for a scope it doesn't know. |
| [Sign in with Pocket ID](https://docs.audiosilo.app/users/admin/sso/pocket-id) | `https://id.example.com` | People sign in with a passkey. A public client needs no secret. |

## Who gets in

The first time someone signs in, the server looks for their account:

| When | What happens |
|---|---|
| The provider says their email is verified, and it matches the email of exactly one ordinary account | The server links them to that account. |
| The matching account is an admin | The sign-in waits for an admin. Nobody becomes an admin by changing an email at the provider. |
| Anything else | The sign-in waits for an admin, under **Waiting sign-ins**. |

Once linked, they sign in to the same account every time. Usernames are never used to match. To give an account an email, open the person's page and fill in **Sign-in > Email**.

Household members and demo accounts can't sign in with single sign-on.

### Deal with a waiting sign-in

When someone waits, the **People** page shows a **Waiting sign-ins** card, and you get the **Someone is waiting to sign in** notification. Each row shows their name, their email, whether the provider verified it, and their groups. For each row, choose one:

- **Link** gives them an existing account.
- **Create account** makes a new ordinary account for them.
- **Dismiss** removes the row. It comes back if they try again.

After a Link or Create account, they sign in again and get straight in.

### Make accounts for new people

To skip the wait, turn on **Make accounts for new people** under **Server > Settings > Sign-in > Who may sign in**. The server then makes an ordinary account for someone it doesn't know. **Only for this group** limits that to members of one group at your provider. Everyone else still waits for you.

## Make admins from a group

To manage admins at your provider, set **Admin group** under **Who may sign in** to a group name, such as `audiosilo-admins`. At each single sign-on, a member of that group becomes an admin, and anyone else becomes an ordinary user. Group names must match exactly, capital letters included.

The last admin is never made an ordinary user. Leave **Admin group** empty to set roles on the **People** page yourself.

The **Who may sign in** settings apply at the next sign-in, with no restart.

## Sign in to the web player

Open the web player from your server, at the server's own address followed by `/web`. Its sign-in screen shows the same **Sign in with** button. Select it, sign in at your provider, and you come back signed in to the player.

## Good to know

- **Keep a password.** If the provider is down, single sign-on can't work. An admin with a password can still sign in, and `reset-admin` still works. An admin with no password can't be unlinked, so set a password for them first.
- **Signing out is separate.** Signing out of AudioSilo doesn't sign you out of the provider. Turning someone off at the provider doesn't sign them out of AudioSilo either. To stop someone at once, disable their account or use **Sign out everywhere** on their page.
- **Unlink** on a person's **Sign-in** tab removes their single sign-on. Their devices stay signed in.
- **Give AudioSilo its own host name**, like `books.example.com`. The sign-in passes through short-lived cookies, and other apps on the same host name could receive them.
- **Changing the provider** (issuer, client ID, secret or scopes) needs a restart.
- **Kids mode:** the web player doesn't offer the button while a grown-up signs in from kids mode.

## More

- [Sign in with single sign-on](https://docs.audiosilo.app/users/admin/single-sign-on) in the User Guide
- [Single sign-on settings](https://docs.audiosilo.app/developers/server/configuration#single-sign-on-authoidc) in the configuration reference
