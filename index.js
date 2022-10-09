let currentPageIndex = 0;
let isSliding = false;
let featuredInterval = null;
let startFeaturedInterval = null;
let stopFeaturedInterval = null;
let reorderBanners = null;

// elements
let menu = null;
let menuToggler = null;
let pagesWrapper = null;
let projectsWrapper = null;
let pages = null;
let pageLogo = null;
let links = null;
let socialLinks = null;
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

	pages = document.querySelectorAll('#pages .page');
	links = [...menu.getElementsByTagName('a')];
	socialLinks = footer.querySelectorAll('#social-links a');
	prevLinks = [...pages[0].getElementsByClassName('project-link')];
	projectsList = pages[2].getElementsByClassName('project-banner');
	pagesWrapper = document.getElementById('pages-wrapper');
	projectsWrapper = document.querySelector('#featured-section .projects-wrapper');
	footerToggler = document.getElementsByClassName('footer-toggler')[0];

	(() => {
		let notifier = document.getElementsByClassName('notifier')[0];
		let details = navigator.userAgent;
		let regexp = /android|iphone|kindle|ipad/i;
		let isOnMobile = regexp.test(details);
		const showNotifier = () => {
			notifier.classList.add('show');
		};
		const hideNotifier = () => {
			notifier.classList.remove('show');
		};
		const removeNotifier = () => {
			notifier.remove();
		};
		const removePageListeners = () => {
			for (const page of pages) {
				page.removeEventListener('focus', showNotifier);
				page.removeEventListener('blur', hideNotifier);
			}
		};
		for (const page of pages) {
			page.addEventListener('focus', showNotifier);
			page.addEventListener('blur', hideNotifier);
		}
		if (!isOnMobile) {
			const keydownHandler = e => {
				if (e.repeat) return;
				let keyCodes = ['ArrowLeft', 'ArrowRight'];
				let isNavigating = keyCodes.includes(e.key);
				if (!isNavigating) return;
				setTimeout(removeNotifier, 1000);
				removePageListeners();
				document.removeEventListener('keydown', keydownHandler);
			};
			document.addEventListener('keydown', keydownHandler);
		} else {
			// on mobile
			notifier.textContent = 'swipe left/right for quick navigation';
			const touchEndHandler = () => {
				let swipePath = getSwipePath();
				if (swipePath.length < 2) return;
				let swipeDirection = getSwipeDirection(swipePath);
				let keyCodes = ['left', 'right'];
				let isNavigating = keyCodes.includes(swipeDirection);
				if (!isNavigating) return;
				setTimeout(removeNotifier, 1000);
				removePageListeners();
				main.removeEventListener('touchend', touchEndHandler);
				for (const page of pages) {
					page.removeEventListener('scroll', e.target.focus());
				}
			};
			main.addEventListener('touchend', touchEndHandler);
			for (const page of pages) {
				page.addEventListener('scroll', e.target.focus());
			}
		}
	})();

	const toggleVideo = (() => {
		const video = document.getElementsByClassName('background')[0];
		const playVideo = async () => {
			try {
				await video.play();
			} catch (err) {
				alert('Playing background video failed', err);
			}
		};
		return () => {
			let orientation =
				(screen.orientation || {}).type || screen.mozOrientation || screen.msOrientation;
			if (orientation.includes('landscape') && video.paused) playVideo();
			else if (!video.paused) video.pause();
		};
	})();
	toggleVideo();
	window.addEventListener('orientationchange', toggleVideo);

	const [focusInHandler, focusOutHandler] = (() => {
		let isIn = false;
		const slider = projectsWrapper.parentElement;
		return [
			e => {
				// if first enter
				if (!isIn) {
					isIn = true;
					// cancel animations if has
					let anims = projectsWrapper.getAnimations();
					for (const anim of anims) {
						anim.cancel();
					}
					projectsWrapper.classList.remove('slide-left');
					// remove interval if has
					stopFeaturedInterval();
				}
				if (e.target.dataset.index == 0) reorderBanners(0);
				else reorderBanners();

				slider.scrollLeft = 0;
				setTimeout(() => {
					slider.scrollLeft = 0;
				}, 100);
			},
			() => {
				if (!document.activeElement.classList.contains('view-project')) {
					// set interval
					startFeaturedInterval();
					isIn = false;
				}
			},
		];
	})();

	projectsWrapper.addEventListener('focusin', focusInHandler);
	projectsWrapper.addEventListener('focusout', focusOutHandler);

	reorderBanners = (() => {
		let banners = projectsWrapper.children;
		return (orderIndex = null) => {
			let _order = orderIndex;
			let length = banners.length;
			for (const banner of banners) {
				let order = _order ?? Number(banner.style.order) - 1;
				if (order < 0) order = length - 1;
				banner.style.order = `${order}`;
				if (_order !== null) _order++;
			}
		};
	})();

	const slideNext = () => {
		projectsWrapper.addEventListener(
			'animationend',
			e => {
				reorderBanners();
				e.target.classList.remove('slide-left');
			},
			{ once: true },
		);
		// slide left
		projectsWrapper.classList.add('slide-left');
	};

	startFeaturedInterval = () => {
		if (featuredInterval === null) {
			featuredInterval = setInterval(slideNext, 5000);
		}
	};

	stopFeaturedInterval = () => {
		if (featuredInterval !== null) {
			clearInterval(featuredInterval);
			featuredInterval = null;
		}
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

	const [saveSwipePaths, getSwipePath, clearPath] = (function () {
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
				return paths;
			},
			() => {
				path = [];
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

	main.addEventListener('touchstart', () => {
		clearPath();
	});

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

	// toggle menu
	menuToggler.addEventListener('click', e => {
		menu.classList.toggle('active');
		if (menu.classList.contains('active')) {
			e.currentTarget.classList.add('open');
			killTagAnimations();
		} else {
			e.currentTarget.classList.remove('open');
			setTagAnimations();
		}
		e.stopPropagation();
	});

	// toggle footer
	const showFooter = () => {
		menu.classList.remove('active');
		menuToggler.classList.remove('open');
		updateCustomProps();
		for (const link of socialLinks) link.tabIndex = '0';
	};

	const hideFooter = () => {
		for (const link of socialLinks) link.tabIndex = '-1';
	};
	footerToggler.addEventListener('click', e => {
		document.body.classList.toggle('showFooter');
		if (document.body.classList.contains('showFooter')) {
			showFooter();
		} else hideFooter();
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
		link.addEventListener('mousedown', e => {
			// preventing focus on the link
			e.preventDefault();
		});
		link.addEventListener('click', e => {
			e.preventDefault();
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

	const closeFooter = () => {
		document.body.classList.remove('showFooter');
		hideFooter();
	};

	menu.addEventListener('focusin', closeFooter);

	///////////////////////////////////////////////////
	// GSAP ANIMATIONS
	///////////////////////////////////////////////////

	gsap.registerPlugin(ScrollTrigger);

	// illustration
	const setIllustrationAnimation = id => {
		gsap.to('.page-image', {
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
	};

	for (const page of pages) {
		setIllustrationAnimation(`#${page.id}`);
	}

	// tag animations
	// doing it manually because "splitText" plugin is not free.
	const splitText = textElem => {
		const text = textElem.textContent;
		const letters = text.split('');
		const classname = textElem.classList[0] + '-split';
		textElem.textContent = '';
		for (const letter of letters) {
			let span = document.createElement('span');
			span.classList.add(classname);
			span.textContent = letter;
			textElem.append(span);
		}
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
		for (const { timeline, destroy } of tagTimelines) {
			destroy();
			timeline.kill();
		}
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
	const setTextAnimations = (() => {
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
				anim.tween.restart();
				anim.tween.pause();
				setTrigger(parent, target, anim.tween);
				return;
			}
			let tween = gsap.from(target, {
				x: 70,
				opacity: 0,
				duration: 0.8,
				ease: 'bounce',
				paused: true,
			});
			setTrigger(parent, target, tween);
			anims.push({
				parent,
				target,
				tween,
			});
		};
	})();

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
				x: 40,
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
				liAnim,
			});
		};
	})();

	// text observer

	const setAnimations = parent => {
		const texts = document.querySelectorAll(`#${parent.id} .text-animate`);
		const lists = document.querySelectorAll(`#${parent.id} .list-animate`);
		for (const text of texts) {
			setTextAnimations(parent, text);
		}
		for (const list of lists) {
			setListAnimations(parent, list);
		}
	};

	const sectionObserver = new IntersectionObserver(entries => {
		if (entries[0].isIntersecting) {
			setAnimations(entries[0].target);
		}
	});

	for (const page of pages) {
		sectionObserver.observe(page);
	}

	setTimeout(updateCustomProps, 1000);
});
