var currentPageIndex = 0;
var isSliding = false;

// elements
var menu = null;
var menuToggler = null;
var arrows = null;
var pagesWrapper = null;
var pages = null;
var links = null;
var footerHeader = null;
var footerToggler = null;
var footer = null;

// ACTIONS
// click keyboard
document.addEventListener('keydown', e => {
	if (e.repeat) return;
	if (isSliding) return;

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
// change hash
window.addEventListener('hashchange', e => {
	e.preventDefault();
	e.stopPropagation();
	let nextIndex = links.findIndex(link => {
		return link.hash == location.hash;
	});
	setTimeout(() => {
		if (nextIndex == -1) throw new Error('nextIndex is not found');
		if (nextIndex == currentPageIndex) return;
		activateLink(nextIndex);
		renderPage(nextIndex);
	}, 0.3);
});

// HANDLERS
// render page
const renderPage = index => {
	let currentPage = pages[currentPageIndex];
	let nextPage = pages[index];
	let { name: animationName, axis, order } = getAnimationSettings();

	pagesWrapper.setAnimationAxis(axis);
	currentPage.style.order = order.activePage;
	nextPage.style.order = order.nextPage;
	nextPage.classList.add('active');

	pagesWrapper.addEventListener(
		'animationend',
		function () {
			currentPage.classList.remove('active');
			this.setAttribute('class', '');
			currentPage.style.order = '';
			nextPage.style.order = '';
			nextPage.focus();
			isSliding = false;
			currentPageIndex = index;
		},
		{ once: true },
	);

	// run animation
	isSliding = true;
	pagesWrapper.classList.add(animationName);
};
// replace history
const replaceHistory = index => {
	let hash = links[index].hash;
	history.replaceState(
		{
			pageIndex: currentPageIndex,
		},
		null,
		`index.html${hash}`,
	);
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

const getAnimationSettings = () => {
	let settings = [
		{
			name: 'push-left',
			axis: 'horizontal',
			order: {
				activetPage: '0',
				nextPage: '1',
			},
		},
		{
			name: 'push-right',
			axis: 'horizontal',
			order: {
				activePage: '1',
				nextPage: '0',
			},
		},
		{
			name: 'push-up',
			axis: 'vertical',
			order: {
				activePage: '0',
				nextPage: '1',
			},
		},
		{
			name: 'push-down',
			axis: 'vertical',
			order: {
				activePage: '1',
				nextPage: '0',
			},
		},
	];
	let index = Math.round(Math.random() * (settings.length - 1));
	return settings[index];
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
	pagesWrapper = document.getElementById('pages-wrapper');
	footerToggler = document.getElementById('footer-toggler');
	arrows = [...document.querySelectorAll('#arrow-nav button')];

	pagesWrapper.setAnimationAxis = function (axis) {
		if (this.classList.contains(axis)) return;
		if (axis == 'horizontal') {
			this.classList.remove('vertical');
		} else if (axis == 'vertical') {
			this.classList.remove('horizontal');
		}
		this.classList.add(axis);
	};

	// initial hash
	let hash = location.hash;
	if (!hash) {
		history.replaceState(
			{
				pageIndex: currentPageIndex,
			},
			null,
			'index.html#aboutme',
		);
	} else {
		let nextIndex = links.findIndex(link => {
			return link.hash === hash;
		});
		setTimeout((index = nextIndex) => {
			if (index == -1) throw new Error('nextIndex not found');
			if (hash == '#aboutme') return;
			history.replaceState(
				{
					pageIndex: currentPageIndex,
				},
				null,
				`index.html${hash}`,
			);
			activateLink(index);

			// render page;
			let currentPage = pages[currentPageIndex];
			let nextPage = pages[index];
			currentPage.classList.remove('active');
			nextPage.classList.add('active');
			currentPageIndex = index;
		}, 0.3);
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
			if (isSliding) return;
			if (nextIndex == currentPageIndex) return;
			activateLink(nextIndex);
			replaceHistory(nextIndex);
			renderPage(nextIndex);
		});
	});

	// click arrow buttons
	arrows.forEach(arrow => {
		arrow.addEventListener('click', () => {
			if (isSliding) return;
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
