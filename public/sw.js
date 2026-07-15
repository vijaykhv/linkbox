// No offline caching — this exists solely so Chrome treats Linkbox as an
// installable PWA, which is required for the Web Share Target (share_target
// in manifest.webmanifest) to appear in Android's native Share sheet.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
