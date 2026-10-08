// เปลี่ยนเลขเวอร์ชันทุกครั้งที่อัปโหลด index.html ใหม่ เพื่อให้มือถือโหลดเวอร์ชันล่าสุด
const CACHE = 'maint-v20';
const SHELL = ['./', './index.html', './check.html', './manifest.json', './icon-192.png', './icon-512.png'];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdnjs.cloudflare.com'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const sameOrigin = url.origin === self.location.origin;
  // ไม่ยุ่งกับการเชื่อมต่อ Google Drive / ล็อกอิน ปล่อยให้วิ่งตรงไปที่ Google เสมอ
  if (!sameOrigin && !FONT_HOSTS.includes(url.hostname)) return;
  e.respondWith(
    fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: sameOrigin }).then(r => r || (sameOrigin && e.request.mode === 'navigate' ? caches.match(url.pathname.endsWith('check.html') ? './check.html' : './index.html') : undefined)))
  );
});
