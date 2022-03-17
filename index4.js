var cardPagesWrapper = null;
var links = null;
var pages = null;
var pageNavigator = null;
var scrollObserver = null;
var isSliding = false;

////////////////////////////////////////
// page navigator class

class pageNavigationObserver {
	constructor(activeIndex) {
		this.currentActiveIndex = activeIndex || 0;
	}
	renderPage(nextIndex) {
		if (screen.orientation.type.includes('landscape')) {
			pushPage(nextIndex);
		} else {
			scrollToPage(nextIndex);
		}
	}
	navigate(type = null, nextIndex = null) {
		switch (type) {
			case 'link':
				activateLink(nextIndex);
				pushHistory(nextIndex);
				this.renderPage(nextIndex);
				break;
			case 'arrowkeys':
				activateLink(nextIndex);
				pushHistory(nextIndex);
				this.renderPage(nextIndex);
				break;
			case 'scroll':
				activateLink(nextIndex);
				pushHistory(nextIndex);
				let activePage = pages[(this, this.currentActiveIndex)];
				let nextPage = pages[nextIndex];
				this.currentActiveIndex = nextIndex;
				activePage.classList.remove('active');
				nextPage.classList.add('active');
				break;
			default:
				throw new Error('An argument is undefined or missing');
		}
		updateTitle(location.hash);
	}
}

//////////////////////////////////////
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

const updateTitle = hash => {
	document.title = `Rodniel Briones Portfolio | ${hash.slice(2)}`;
};

////////////////////////////////////////
// HANDLERS

// push history
const pushHistory = nextIndex => {
	let hash = links[nextIndex].hash;
	history.replaceState(null, null, `index.html${hash}`);
};

// activate link
const activateLink = nextIndex => {
	let activeLink = links[pageNavigator.currentActiveIndex];
	let nextLink = links[nextIndex];
	activeLink.classList.remove('active');
	nextLink.classList.add('active');
};

// push page (landscsape)
const pushPage = nextIndex => {
	let activePage = pages[pageNavigator.currentActiveIndex];
	let nextPage = pages[nextIndex];
	let { name: animationName, axis, order } = getAnimationSettings();
	cardPagesWrapper.setAnimationAxis(axis);
	activePage.style.order = order.activePage;
	nextPage.style.order = order.nextPage;
	nextPage.classList.add('active');

	cardPagesWrapper.addEventListener(
		'animationend',
		function () {
			// remove current page
			activePage.classList.remove('active');
			// reset wrapper
			this.classList.remove(animationName);
			// reset page ordering
			activePage.style.order = '';
			nextPage.style.order = '';
			nextPage.focus();
			isSliding = false;
			pageNavigator.currentActiveIndex = nextIndex;
		},
		{ once: true },
	);

	// run animation
	isSliding = true;
	cardPagesWrapper.classList.add(animationName);
};

// scroll page (portrait)
const scrollToPage = nextIndex => {
	let activePage = pages[pageNavigator.currentActiveIndex];
	let nextPage = pages[nextIndex];

	// isSliding = true;
	cardPagesWrapper.parentElement.scrollTo({
		top: nextPage.offsetTop,
		behavior: 'smooth',
	});

	activePage.classList.remove('active');
	nextPage.classList.add('active');

	// CAUTION: potential error
	pageNavigator.currentActiveIndex = nextIndex;
};

//////////////////////////////////
// ACTIONS

// arrow keys
document.addEventListener('keydown', e => {
	if (e.repeat || isSliding) return;
	let nextIndex = null;
	switch (e.key) {
		case 'ArrowRight':
			nextIndex = pageNavigator.currentActiveIndex + 1;
			if (nextIndex >= pages.length) nextIndex = 0;
			pageNavigator.navigate('arrowkeys', nextIndex);
			break;
		case 'ArrowLeft':
			nextIndex = pageNavigator.currentActiveIndex - 1;
			if (nextIndex < 0) nextIndex = pages.length - 1;
			pageNavigator.navigate('arrowkeys', nextIndex);
	}
});

// history navigation
window.addEventListener('popstate', e => {
	e.preventDefault();
	console.log('popstate', e);
});

// hash change
window.addEventListener('hashchange', e => {
	e.preventDefault();
	console.log('hashchange', e);
});

// orientation change
window.addEventListener('orientationchange', () => {
	if (screen.orientation.type.includes('landscape')) {
		// isSliding = true;
		pages.forEach(page => {
			scrollObserver.unobserve(page);
		});
		cardPagesWrapper.parentElement.scrollTo(0, 0);
	} else {
		// isSliding = true;
		// let page = pages[pageNavigator.currentActiveIndex];
		console.log(pageNavigator.currentActiveIndex);
		cardPagesWrapper.parentElement.scrollTo(0, page.offsetTop);
		pages.forEach(page => {
			scrollObserver.observe(page);
		});
	}
});

//////////////////////////////////
// DOM load

document.addEventListener('DOMContentLoaded', () => {
	cardPagesWrapper = document.querySelector('.card-pages-wrapper');
	links = [...document.querySelectorAll('.card-menu-list li a')];
	pages = [...cardPagesWrapper.children];
	cardPagesWrapper.setAnimationAxis = function (axis) {
		if (this.classList.contains(axis)) return;
		if (axis == 'horizontal') {
			this.classList.remove('vertical');
		} else if (axis == 'vertical') {
			this.classList.remove('horizontal');
		}
		this.classList.add(axis);
	};

	// init
	let hash = location.hash;
	if (hash) {
		if (hash !== '#!aboutme') {
			let activeIndex = links.findIndex(link => link.hash == hash);
			pageNavigator = new pageNavigationObserver(activeIndex);
			pages[0].classList.remove('active');
			history.replaceState(null, null, `index.html${hash}`);
		}
	} else {
		pageNavigator = new pageNavigationObserver();
		history.replaceState(null, null, 'index.html#!aboutme');
	}

	////////////////////////////////////
	// ACTIONS

	// click link
	links.forEach((link, nextIndex) => {
		link.addEventListener('click', e => {
			e.preventDefault();
			pageNavigator.navigate('link', nextIndex);
		});
	});

	// portrait scroll
	scrollObserver = new IntersectionObserver(
		entries => {
			if (isSliding) return;
			if (screen.orientation.type.includes('landscape') || isSliding) return;
			let activeEntry = entries.find(entry => entry.isIntersecting);
			if (!activeEntry) return;
			let nextIndex = pages.findIndex(page => page === activeEntry.target);
			pageNavigator.navigate('scroll', nextIndex);
		},
		{ rootMargin: '-50%' },
	);

	if (screen.orientation.type.includes('portrait')) {
		pages.forEach(page => {
			scrollObserver.observe(page);
		});
	}
});
