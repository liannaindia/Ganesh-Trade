self.addEventListener("install", (event) => {
  console.log("✅ Service Worker installed");
});

self.addEventListener("activate", (event) => {
  console.log("✅ Service Worker activated");
});

self.addEventListener("fetch", (event) => {
  // 可选：拦截请求用于离线缓存
});
