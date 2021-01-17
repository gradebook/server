const template = `<svg width="192" height="192" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
	<style>
		rect { fill: __THEME_COLOR__; }
		path { fill: #FFF; }
		polyline { stroke: #FFF; stroke-width: 4; stroke-linecap: round; }
	</style>
	<rect width="192" height="192" />
	<g transform="scale(0.6) translate(64, 64)" fill="none" fill-rule="evenodd">
		<!-- cover -->
		<path d="M97 16 L167 44 L96 83 L23 53 z" />
		<polyline points="25 54 25 81 96 111 167 71" />
		<polyline points="25 93 25 113 96 143 167 103" />
		<polyline points="25 125 25 145 96 175 167 135" />
	</g>
</svg>`;

module.exports = function renderMaskableIcon(color) {
	return template.replace(/__THEME_COLOR__/g, color);
};
