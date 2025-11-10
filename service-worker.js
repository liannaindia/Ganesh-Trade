self.addEventListener("install", (e) => {
  console.log("Service Worker installed.");
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  console.log("Service Worker activated.");
});

self.addEventListener("fetch", (event) => {
  // 可添加缓存逻辑，这里保持空实现
});
