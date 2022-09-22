let currentPageIndex = 0;
let isSliding = false;
let featuredInterval = null;
let startFeaturedInterval = null;
let stopFeaturedInterval = null;

// elements
let menu = null;
let menuToggler = null;
let pagesWrapper = null;
let projectsWrapper = null;
let pages = null;
let pageLogo = null;
let links = null;
let prevLinks = null;
let projectsList = null;
let pageNavigation = null;
let footerToggler = null;
let footer = null;

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
			renderPage(nextIndex, getAnimationSettings());
			break;
		case 'ArrowLeft':
			nextIndex = getNextIndex('decrement');
			activateLink(nextIndex);
			replaceHistory(nextIndex);
			renderPage(nextIndex, getAnimationSettings());
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
		renderPage(nextIndex, getAnimationSettings());
	}, 0.3);
});

// HANDLERS
// render page
const renderPage = (index, animationSettings, scrollIndex = null) => {
	let currentPage = pages[currentPageIndex];
	let nextPage = pages[index];
	let { name: animationName, axis, order } = animationSettings;
	let pageNames = ['homepage', 'aboutme', 'projects'];
	pageNames.forEach((name, nameIndex) => {
		if (nameIndex == index) document.body.classList.add(name);
		else document.body.classList.remove(name);
	});

	pagesWrapper.setAnimationAxis(axis);
	currentPage.style.order = order.activePage;
	nextPage.style.order = order.nextPage;
	nextPage.classList.add('active');

	pagesWrapper.addEventListener(
		'animationend',
		function () {
			// featured
			if (index == 0) startFeaturedInterval();
			else stopFeaturedInterval();

			currentPage.scrollTo(0, 0);
			currentPage.classList.remove('active');
			this.setAttribute('class', '');
			currentPage.style.order = '';
			nextPage.style.order = '';
			nextPage.focus();
			isSliding = false;
			currentPageIndex = index;
			if (scrollIndex !== null)
				setTimeout(() => {
					let banner = projectsList[scrollIndex];
					nextPage.scrollTo({
						top: banner.offsetTop,
						behavior: 'smooth',
					});
				}, 200);
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
	let pageLogoHeight = pageLogo.clientHeight;
	let pageNavHeight = pageNavigation.clientHeight;
	let footerHeight = footer.clientHeight;
	style.setProperty('--client-height', `${window.innerHeight}px`);
	style.setProperty('--footer-height', `${footerHeight}px`);
	style.setProperty('--page-logo-height', `${pageLogoHeight}px`);
	style.setProperty('--page-navigation-height', `${pageNavHeight}px`);
	style.setProperty('--pagenav-slide-height', `-${pageLogoHeight + footerHeight}px`);
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
				activePage: '0',
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
	let main = document.getElementById('pages');
	menu = document.getElementById('link-navigation');
	menuToggler = document.getElementsByClassName('menu-toggler')[0];
	pageNavigation = document.getElementById('page-navigation');
	pageLogo = document.getElementById('page-logo');
	footer = document.getElementById('info');
	setTimeout(updateCustomProps, 100);

	pages = [...document.querySelectorAll('#pages .page')];
	links = [...document.querySelectorAll('#link-navigation a')];
	prevLinks = [...pages[0].getElementsByClassName('project-banner')];
	projectsList = [...pages[2].getElementsByClassName('project-banner')];
	pagesWrapper = document.getElementById('pages-wrapper');
	projectsWrapper = document.querySelector('#featured-section .projects-wrapper');
	footerToggler = document.getElementsByClassName('footer-toggler')[0];

	(() => {
		let notifier = document.getElementsByClassName('notifier')[0];
		let details = navigator.userAgent;
		let regexp = /android|iphone|kindle|ipad/i;
		let isOnMobile = regexp.test(details);
		if (!isOnMobile) {
			console.log("You're on a desktop computer");
			const showNotifier = () => {
				notifier.classList.add('show');
			};
			const hideNotifier = () => {
				notifier.classList.remove('show');
			};
			pages.forEach(page => {
				page.addEventListener('focus', showNotifier);
				page.addEventListener('focusout', hideNotifier);
			});
			const removeNotifier = e => {
				if (e.repeat) return;
				console.log('You clicked', e.key);
				let keyCodes = ['ArrowLeft', 'ArrowRight'];
				let isNavigator = keyCodes.includes(e.key);
				if (!isNavigator) return;
				setTimeout(() => {
					notifier.remove();
					console.log('notifier removed');
				}, 1000);
				document.removeEventListener('keydown', removeNotifier);
				pages.forEach(page => {
					page.removeEventListener('focus', showNotifier);
					page.removeEventListener('focusout', hideNotifier);
				});
			};
			document.addEventListener('keydown', removeNotifier);
		} else console.log("You're on a mobile device");
	})();

	const toggleVideo = (() => {
		const video = document.getElementsByClassName('background')[0];
		const playVideo = async () => {
			try {
				await video.play();
			} catch (err) {
				console.log('Playing video failed', err);
			}
		};
		return () => {
			let orientation =
				(screen.orientation || {}).type || screen.mozOrientation || screen.msOrientation;
			if (orientation.includes('landscape') && video.paused) playVideo();
			else if (!video.paused) video.pause();
			console.log('Video is', video.paused ? 'paused' : 'played');
		};
	})();
	toggleVideo();
	window.addEventListener('orientationchange', toggleVideo);

	const reorderElements = elems => {
		let length = elems.length;
		elems.forEach(elem => {
			let order = Number(elem.style.order) - 1;
			if (order < 0) order = length - 1;
			elem.style.order = `${order}`;
		});
	};

	let slideNext = (function () {
		let banners = [...projectsWrapper.children];
		return function () {
			projectsWrapper.addEventListener(
				'animationend',
				e => {
					reorderElements(banners);
					e.target.classList.remove('slide-left');
				},
				{ once: true },
			);
			// slide left
			projectsWrapper.classList.add('slide-left');
		};
	})();

	startFeaturedInterval = () => {
		featuredInterval = setInterval(slideNext, 5000);
	};

	stopFeaturedInterval = () => {
		clearInterval(featuredInterval);
	};

	startFeaturedInterval();

	pagesWrapper.setAnimationAxis = function (axis) {
		if (this.classList.contains(axis)) return;
		if (axis == 'horizontal') {
			this.classList.remove('vertical');
		} else if (axis == 'vertical') {
			this.classList.remove('horizontal');
		}
		this.classList.add(axis);
	};

	const [saveSwipePaths, getSwipePath] = (function () {
		let path = [];
		return [
			coord => {
				// save paths
				path.push(coord);
			},
			() => {
				// return first & last path
				if (!(path[0] && path[path.length - 1])) return [];
				let paths = [path[0], path[path.length - 1]];
				path = [];
				return paths;
			},
		];
	})();

	const getSwipeDirection = path => {
		let [touchStart, touchEnd] = path;
		let verticalSwipeLength = Math.abs(touchStart[1] - touchEnd[1]);
		if (verticalSwipeLength > 40) return 'invalid';
		let horizontalSwipeLength = Math.abs(touchStart[0] - touchEnd[0]);
		if (horizontalSwipeLength < 80) return 'invalid';
		if (touchStart[0] < touchEnd[0]) return 'right';
		if (touchStart[0] > touchEnd[0]) return 'left';
		return 'invalid';
	};

	main.addEventListener('touchmove', e => {
		let coord = [];
		coord.push(e.changedTouches[0].clientX);
		coord.push(e.changedTouches[0].clientY);
		if (coord[0] && coord[1]) saveSwipePaths(coord);
	});

	main.addEventListener('touchend', () => {
		let swipePath = getSwipePath();
		if (swipePath.length < 2) return;
		let swipeDirection = getSwipeDirection(swipePath);
		let nextIndex = null;
		switch (swipeDirection) {
			case 'left':
				nextIndex = getNextIndex('increment');
				activateLink(nextIndex);
				replaceHistory(nextIndex);
				renderPage(nextIndex, {
					name: 'push-left',
					axis: 'horizontal',
					order: {
						activePage: '0',
						nextPage: '1',
					},
				});
				break;
			case 'right':
				nextIndex = getNextIndex('decrement');
				activateLink(nextIndex);
				replaceHistory(nextIndex);
				renderPage(nextIndex, {
					name: 'push-right',
					axis: 'horizontal',
					order: {
						activePage: '1',
						nextPage: '0',
					},
				});
		}
	});

	// initial hash
	let hash = location.hash;
	if (!hash) {
		history.replaceState(
			{
				pageIndex: currentPageIndex,
			},
			null,
			'index.html#homepage',
		);
	} else {
		let _hash = hash.split('');
		_hash.shift();
		document.body.classList.add(_hash.join(''));
		let nextIndex = links.findIndex(link => {
			return link.hash === hash;
		});
		setTimeout((index = nextIndex) => {
			if (index == -1) throw new Error('nextIndex not found');
			if (hash == '#homepage') return;
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
	// const illustrationTransforms = {
	// 	transforms: [],
	// 	add(id, callback) {
	// 		this.transforms.push({ id, callback });
	// 	},
	// 	get(id) {
	// 		let item = this.transforms.find(item => {
	// 			return item.id === id;
	// 		});
	// 		return item?.callback;
	// 	},
	// };

	// toggle menu
	menuToggler.addEventListener('click', e => {
		menu.classList.toggle('active');
		if (menu.classList.contains('active')) {
			e.currentTarget.classList.add('open');
			// let removeTransforms = illustrationTransforms.get(location.hash);
			// removeTransforms();
			killTagAnimations();
		} else {
			e.currentTarget.classList.remove('open');
			setTagAnimations();
		}
		e.stopPropagation();
	});

	// toggle footer
	footerToggler.addEventListener('click', e => {
		document.body.classList.toggle('showFooter');
		if (document.body.classList.contains('showFooter')) {
			menu.classList.remove('active');
			menuToggler.classList.remove('open');
		}
		e.stopPropagation();
	});

	// click link
	links.forEach((link, nextIndex) => {
		link.addEventListener('click', e => {
			e.preventDefault();
			if (isSliding) return;
			if (nextIndex == currentPageIndex) return;
			activateLink(nextIndex);
			replaceHistory(nextIndex);
			renderPage(nextIndex, getAnimationSettings());
		});
	});

	// click preview links
	prevLinks.forEach((link, index) => {
		link.addEventListener('click', e => {
			e.preventDefault();
			if (isSliding) return;
			if (currentPageIndex == 2) return;
			activateLink(2);
			replaceHistory(2);
			renderPage(2, getAnimationSettings(), index);
		});
	});

	// remove drawers on menu click
	menu.addEventListener('click', () => {
		document.body.classList.remove('showFooter');
		menu.classList.remove('active');
		menuToggler.classList.remove('open');
		if (location.hash === '#homepage') setTagAnimations();
	});

	///////////////////////////////////////////////////
	// GSAP ANIMATIONS
	///////////////////////////////////////////////////

	gsap.registerPlugin(ScrollTrigger);

	// illustration
	const setIllustrationAnimation = function (id) {
		const illustration = document.querySelector(`${id} .page-image`);
		gsap.to(illustration, {
			scrollTrigger: {
				scroller: id,
				trigger: '.page-image',
				start: 'top top',
				end: 'bottom top',
				scrub: true,
			},
			opacity: 0,
			scale: 1.6,
			duration: 0.3,
		});
		// const removeTransforms = () => {
		// 	illustration.style.transform = 'none';
		// };
		// illustrationTransforms.add(id, removeTransforms);
	};

	setIllustrationAnimation('#homepage');
	setIllustrationAnimation('#aboutme');
	setIllustrationAnimation('#projects');

	// tag animations
	// doing it manually because "splitText" plugin is not free.
	const splitText = textElem => {
		const text = textElem.textContent;
		const letters = text.split('');
		const classname = textElem.classList[0] + '-split';
		textElem.textContent = '';
		letters.forEach(letter => {
			let span = document.createElement('span');
			span.classList.add(classname);
			span.textContent = letter;
			textElem.append(span);
		});
		const resetText = () => {
			textElem.textContent = text;
		};
		return {
			classname,
			resetText,
		};
	};

	const tagTimelines = [];

	const animateText = (selector, animate) => {
		const text = document.querySelector(selector);
		const { classname, resetText } = splitText(text);
		const tl = animate(`.${classname}`);
		tagTimelines.push({
			timeline: tl,
			destroy: resetText,
			get elems() {
				return [...text.children];
			},
		});
	};

	const rotate = selector => {
		const tl = gsap.timeline({
			defaults: {
				duration: 0.5,
				stagger: 0.1,
			},
			repeat: -1,
			repeatDelay: 0.3,
		});
		tl.to(selector, {
			rotateZ: 360,
			ease: 'bounce',
		});
		return tl;
	};
	const hide = selector => {
		const tl = gsap.timeline({
			repeat: -1,
			repeatDelay: 1,
		});
		tl.to(selector, { y: 25, ease: 'circ', duration: 0.28, stagger: 0.025 }).to(selector, {
			y: 0,
			ease: 'bounce',
			duration: 0.13,
			stagger: 0.08,
		});
		return tl;
	};
	const spin = selector => {
		const tl = gsap.timeline({
			defaults: {
				duration: 0.5,
				ease: 'bounce',
			},
			repeat: -1,
			repeatDelay: 1,
		});
		tl.to(selector, {
			rotateY: 520,
		}).to(selector, {
			rotateY: 0,
		});
		return tl;
	};

	// attach animation
	function setTagAnimations() {
		if (location.hash !== '#homepage') return;
		animateText('.innovative', rotate);
		animateText('.accessible', hide);
		animateText('.performant', spin);
	}

	// remove animations
	function killTagAnimations() {
		tagTimelines.forEach(({ timeline, destroy }) => {
			destroy();
			timeline.kill();
		});
	}

	const tagObserver = new IntersectionObserver(entries => {
		if (entries[0].isIntersecting) {
			setTagAnimations();
		} else {
			killTagAnimations();
		}
	});

	const tagline = document.querySelector('.tag-line');
	tagObserver.observe(tagline);

	// text animations
	const setTextAnimation = function (parent, target) {
		gsap.from(target, {
			scrollTrigger: {
				scroller: parent,
				trigger: target,
				start: 'top 60%',
			},
			x: 20,
			opacity: 0,
			duration: 1,
			ease: 'expo.out',
			// onComplete: () => {
			// 	target.style.transform = 'none';
			// },
		});
	};

	// list animations
	const setListAnimations = (() => {
		const anims = [];
		const setTrigger = (parent, target, anim) => {
			gsap.set(target, {
				scrollTrigger: {
					scroller: parent,
					trigger: target,
					start: 'top 60%',
					once: true,
					onEnter: () => {
						anim.play();
					},
				},
			});
		};
		return function (parent, target) {
			if (!target) return;
			let anim = anims.find(anim => {
				return parent === anim.parent && target === anim.target;
			});
			if (anim) {
				anim.liAnim.restart();
				anim.liAnim.pause();
				setTrigger(parent, target, anim.liAnim);
				return;
			}
			let liAnim = gsap.from(`.${target.classList[0]} li`, {
				x: 20,
				opacity: 0,
				duration: 1,
				ease: 'expo.out',
				stagger: 0.1,
				paused: true,
			});
			setTrigger(parent, target, liAnim);
			anims.push({
				parent,
				target,
				// olAnim,
				liAnim,
			});
		};
	})();

	// observer
	const textObserver = new IntersectionObserver(entries => {
		if (entries[0].isIntersecting) {
			let page = entries[0].target;
			let textAnimate = [...page.getElementsByClassName('text-animate')];
			let listAnimate = page.getElementsByClassName('list-animate')[0];
			let id = `#${page.id}`;
			textAnimate.forEach(text => {
				setTextAnimation(id, text);
			});
			setListAnimations(id, listAnimate);
		}
	});

	let aboutme = pages[1];
	let projects = pages[2];

	textObserver.observe(aboutme);
	textObserver.observe(projects);
});
