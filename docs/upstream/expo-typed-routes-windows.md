# Draft issue for expo/expo (not filed yet)

**Title:** [router] Typed routes watcher registers files outside the app root as routes on Windows

## Summary

On Windows, while `expo start` is running with `experiments.typedRoutes`, adding any file outside the
app directory (e.g. `src/lib/auth.ts` when routes live in `src/app`) adds it to `.expo/types/router.d.ts`
as a route like `/../lib/auth`. New nested route files also come out wrong (`/subscriptions/index`
instead of `/subscriptions`). `tsc` then rejects valid hrefs like `"/subscriptions"` and
`{ pathname: '/subscriptions/[id]', params }`.

A full regeneration (restarting `expo start`, or `expo export`) produces correct types, so the
problem only shows up for files added during a dev session.

## Environment

- Windows 11, Node 22
- expo 58.0.19, expo-router 58.0.26, @expo/router-server 58.0.17 (nested under `@expo/cli`)
- `app.json`: `"experiments": { "typedRoutes": true }`, routes in `src/app`

## Repro

1. Create an Expo Router app with typed routes and routes in `src/app`, on Windows.
2. Run `npx expo start`.
3. While it runs, add `src/lib/foo.ts` (any content).
4. Open `.expo/types/router.d.ts`: it now lists `/../lib/foo` in `hrefInputParams`.
5. Add `src/app/things/index.tsx`: it is listed as `/things/index`, so `href="/things"` fails `tsc`.

**Expected:** files outside the app root are ignored, and `things/index.tsx` is typed as `/things`.

## Cause

`packages/@expo/router-server/src/typed-routes/index.ts`, `getWatchHandler`:

```js
let relativePath = path.relative(process.env.EXPO_ROUTER_APP_ROOT, filePath);
const isInsideAppRoot = !relativePath.startsWith('../');
```

On Windows `path.relative` returns backslash paths (`..\lib\foo.ts`), so `startsWith('../')` is never
true. Every added file passes the check and is registered with `ctx.__add('./..\lib\foo.ts')`. The same
backslashes in keys like `./things\index.tsx` stop the index route from being normalised.

## Fix (one line)

Normalise separators before the check:

```js
let relativePath = path.relative(process.env.EXPO_ROUTER_APP_ROOT, filePath).split(path.sep).join('/');
```

We are carrying this as a `patch-package` patch in our app and it fixes both symptoms.
