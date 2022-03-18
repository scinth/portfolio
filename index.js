var header = null;
var menu = null;
var menuToggler = null;

const updateCustomProps = function () {
	document.documentElement.style.setProperty('--footer-header-height', `${header.clientHeight}px`);
	document.documentElement.style.setProperty(
		'--total-menu-height',
		`-${menu.clientHeight + menuToggler.clientHeight}px`,
	);
};

window.addEventListener('resize', updateCustomProps);
document.addEventListener('DOMContentLoaded', function () {
	header = document.querySelector('#info header');
	menu = document.getElementById('menu');
	menuToggler = document.getElementById('menu-toggler');
	updateCustomProps();
});
