const template = `{
	"name": "Gradebook",
	"short_name": "Gradebook",
	"theme_color": "__THEME_COLOR__",
	"background_color": "__THEME_COLOR__",
	"display": "standalone",
	"orientation": "portrait",
	"start_url": "/my/dashboard",
	"icons": [
		{
			"src": "pwa-icon.svg",
			"sizes": "192x192",
			"type": "image/svg+xml",
			"purpose": "any"
		},
		{
			"src": "pwa-icon-maskable.svg",
			"sizes": "192x192",
			"type": "image/svg+xml",
			"purpose": "maskable"
		},
		{
			"src": "my/assets/android-chrome-192.webp",
			"sizes": "192x192",
			"type": "image/webp"
		},
		{
			"src": "my/assets/android-chrome-256.webp",
			"sizes": "256x256",
			"type": "image/webp"
		},
		{
			"src": "my/assets/android-chrome-384.webp",
			"sizes": "384x384",
			"type": "image/webp"
		},
		{
			"src": "my/assets/android-chrome-512.webp",
			"sizes": "512x512",
			"type": "image/webp"
		},
		{
			"src": "my/assets/android-chrome-1024.webp",
			"sizes": "1024x1024",
			"type": "image/webp"
		},
		{
			"src": "my/assets/android-chrome-192.png",
			"sizes": "192x192",
			"type": "image/png"
		},
		{
			"src": "my/assets/android-chrome-512.png",
			"sizes": "512x512",
			"type": "image/png"
		}
	]
}`;

module.exports = function renderManifest(color) {
	return template.replace(/__THEME_COLOR__/g, color);
};
