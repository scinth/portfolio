var currentPageIndex = 0;

// elements
var menu = null;
var menuToggler = null;
var footer = null;
var footerHeader = null;
var arrows = null;
var footerToggler = null;
var pages = null;
var links = null;

// ACTIONS
// click keyboard
document.addEventListener('keydown', e => {
	let nextIndex = null;
	switch (e.key) {
		case 'ArrowRight':
			nextIndex = getNextIndex('increment');
			activateLink(nextIndex);
			replaceHistory(nextIndex);
			renderPage(nextIndex);
			break;
		case 'ArrowLeft':
			nextIndex = getNextIndex('decrement');
			activateLink(nextIndex);
			replaceHistory(nextIndex);
			renderPage(nextIndex);
	}
});
// click history | change hash
window.addEventListener('popstate', () => {
	let nextIndex = links.findIndex(link => {
		return link.hash === location.hash;
	});
	if (nextIndex < 0) throw new Error('nextIndex is not found');
	activateLink(nextIndex);
	renderPage(nextIndex);
});

// HANDLERS
// render page
const renderPage = index => {
	let currentPage = pages[currentPageIndex];
	let nextPage = pages[index];
	currentPage.classList.remove('active');
	nextPage.classList.add('active');
	currentPageIndex = index;
	pages[index].focus();
};
// replace history
const replaceHistory = index => {
	let hash = links[index].hash;
	history.replaceState(null, null, `index.html${hash}`);
};
// activate link
const activateLink = index => {
	let currentLink = links[currentPageIndex];
	let nextLink = links[index];
	currentLink.classList.remove('active');
	nextLink.classList.add('active');
};

///////////////////////////////////

const updateCustomProps = function () {
	let style = document.documentElement.style;
	style.setProperty('--total-menu-height', `-${menu.clientHeight + menuToggler.clientHeight}px`);
	style.setProperty('--footer-height', `${footer.clientHeight}px`);
	style.setProperty('--footer-header-height', `${footerHeader.clientHeight}px`);
};

const getNextIndex = function (type = 'increment') {
	if (!(type == 'increment' || type == 'decrement')) return;
	let nextIndex = type == 'decrement' ? currentPageIndex - 1 : currentPageIndex + 1;
	if (nextIndex >= pages.length) nextIndex = 0;
	else if (nextIndex < 0) nextIndex = pages.length - 1;
	return nextIndex;
};

window.addEventListener('resize', updateCustomProps);
document.addEventListener('DOMContentLoaded', function () {
	menu = document.getElementById('menu');
	menuToggler = document.getElementById('menu-toggler');
	footer = document.getElementById('info');
	footerHeader = footer.firstElementChild;
	updateCustomProps();

	pages = [...document.querySelectorAll('#pages section')];
	links = [...document.querySelectorAll('#menu a')];
	footerToggler = document.getElementById('footer-toggler');
	arrows = [...document.querySelectorAll('#arrow-nav button')];

	// initial hash
	let hash = location.hash;
	if (!hash) {
		history.replaceState(null, null, 'index.html#aboutme');
	} else {
		let nextIndex = links.findIndex(link => {
			return link.hash === hash;
		});
		if (nextIndex < 0) throw new Error('nextIndex not found');
		history.replaceState(null, null, `index.html${hash}`);
		activateLink(nextIndex);
		renderPage(nextIndex);
	}

	// ACTIONS

	// toggle menu
	menuToggler.addEventListener('click', e => {
		menu.classList.toggle('active');
		e.stopPropagation();
	});

	// toggle footer
	footerToggler.addEventListener('click', () => {
		document.body.classList.toggle('showFooter');
	});

	// click link
	links.forEach((link, nextIndex) => {
		link.addEventListener('click', e => {
			e.preventDefault();
			activateLink(nextIndex);
			replaceHistory(nextIndex);
			renderPage(nextIndex);
		});
	});

	// click arrow buttons
	arrows.forEach(arrow => {
		arrow.addEventListener('click', () => {
			let nextIndex = null;
			if (arrow.id == 'next') nextIndex = getNextIndex('increment');
			else if (arrow.id == 'prev') nextIndex = getNextIndex('decrement');
			activateLink(nextIndex);
			replaceHistory(nextIndex);
			renderPage(nextIndex);
		});
	});
});

// remove menu on document click
document.addEventListener('click', () => {
	menu.classList.remove('active');
});
