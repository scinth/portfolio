var links = null;
var cardPagesWrapper = null;
var pages = null;
var currentPageIndex = 0;
var isSliding = false;
const getPageIndexFromHash = hash => {
	let index = links.findIndex(link => {
		return link.getAttribute('href') === hash;
	});
	return index;
};
const updateContent = () => {
	let index = getPageIndexFromHash(location.hash);
	if (index === currentPageIndex) return;
	let isPrev = index < currentPageIndex ? true : false;
	renderPage(index, isPrev);
};
window.addEventListener('hashchange', updateContent);
document.addEventListener('DOMContentLoaded', function () {
	links = [...document.querySelectorAll('.card-menu-list li a')];

	cardPagesWrapper = document.getElementsByClassName('card-pages-wrapper')[0];
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

	// keyboard listeners
	document.addEventListener('keydown', e => {
		if (isSliding) return;
		let index = null;
		if (e.key == 'ArrowRight') {
			index = currentPageIndex + 1;
			if (index == pages.length) index = 0;
		} else if (e.key == 'ArrowLeft') {
			index = currentPageIndex - 1;
			if (index == -1) index = pages.length - 1;
		} else return;
		let hash = links[index].getAttribute('href');
		history.pushState(null, null, `index.html${hash}`);
		updateContent();
	});

	// init
	let hash = location.hash;
	if (hash) {
		if (hash !== '#aboutme') updateContent();
	} else history.replaceState(null, null, 'index.html#aboutme');
});

const getAnimationSettings = function () {
	let settings = [
		{
			name: 'push-left',
			axis: 'horizontal',
			order: {
				currentPage: '0',
				nextPage: '1',
			},
		},
		{
			name: 'push-right',
			axis: 'horizontal',
			order: {
				currentPage: '1',
				nextPage: '0',
			},
		},
		{
			name: 'push-up',
			axis: 'vertical',
			order: {
				currentPage: '0',
				nextPage: '1',
			},
		},
		{
			name: 'push-down',
			axis: 'vertical',
			order: {
				currentPage: '1',
				nextPage: '0',
			},
		},
	];
	let index = Math.round(Math.random() * (settings.length - 1));
	return settings[index];
};

const renderPage = (nextPageIndex = undefined, isPrev = false) => {
	if (nextPageIndex === currentPageIndex) return;
	let currentPage = pages[currentPageIndex];
	let currentLink = links[currentPageIndex];
	// show next page
	if (nextPageIndex === undefined) {
		if (isPrev) currentPageIndex--;
		else currentPageIndex++;
		if (currentPageIndex === pages.length) currentPageIndex = 0;
		else if (currentPageIndex === -1) currentPageIndex = pages.length - 1;
		nextPageIndex = currentPageIndex;
	}
	currentPageIndex = nextPageIndex;
	let nextPage = pages[nextPageIndex];
	let nextLink = links[nextPageIndex];

	// activate link
	currentLink.classList.remove('active');
	nextLink.classList.add('active');

	let { name: animationName, axis, order } = getAnimationSettings();

	cardPagesWrapper.setAnimationAxis(axis);
	currentPage.style.order = order.currentPage;
	nextPage.style.order = order.nextPage;
	nextPage.classList.add('active');

	cardPagesWrapper.addEventListener(
		'animationend',
		function () {
			// remove current page
			currentPage.classList.remove('active');
			// reset wrapper
			this.classList.remove(animationName);
			// reset page ordering
			currentPage.style.order = '';
			nextPage.style.order = '';
			nextPage.focus();
			isSliding = false;
		},
		{ once: true },
	);

	// run animation
	isSliding = true;
	cardPagesWrapper.classList.add(animationName);
};
