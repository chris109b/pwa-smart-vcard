self.addEventListener('install', e => {
    e.waitUntil(
        caches.open('static').then(cache => {
            return cache.addAll([
                "./",
                "./favicon.ico",
                "./index.html",
                "./css/index.css",
                "./css/OpenSans-Bold.ttf",
                "./css/OpenSans-Regular.ttf",
                "./img/app-icon-192.png",
                "./img/app-icon-48.png",
                "./img/app-icon-512.png",
                "./img/app-icon.svg",
                "./img/chat.svg",
                "./img/edit.svg",
                "./img/home.svg",
                "./img/mail.svg",
                "./img/mobile.svg",
                "./img/office.svg",
                "./img/phone.svg",
                "./img/share.svg",
                "./img/web.svg",
				"./img/xmpp-chat.svg",
                "./js/index.js",
                "./js/qrcode.min.js"
			]);
        })
    );
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(response => {
            return response || fetch(e.request);
        })
    );
});
