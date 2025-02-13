document.addEventListener("DOMContentLoaded", function () {
    const contentDiv = document.getElementById("content");
    const links = document.querySelectorAll(".nav-links a");
    const navLinks = document.querySelector(".nav-links");
    const indicator = document.createElement("div");
    indicator.classList.add("nav-indicator");
    navLinks.appendChild(indicator);
    let swiperInstance = null;

    // Improved GitHub Pages detection
    const basePath = window.location.hostname.includes("github.io") ? "/portfolio" : "";

    function loadPage(page) {
        // Add trailing slash for GitHub Pages compatibility
        fetch(`${basePath}/views/${page}.html`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
                return response.text();
            })
            .then(data => {
                // Process the loaded HTML to fix asset paths
                const processedData = data.replace(
                    /(src|href)="\.\.\/assets\//g,
                    `$1="${basePath}/assets/`
                );
                contentDiv.innerHTML = processedData;
                updateActiveLink(page);

                if (page === "realisation") {
                    loadRealisationCSS();
                    // Wait for CSS to load before initializing Swiper
                    setTimeout(initializeSwiper, 100);
                } else {
                    removeRealisationCSS();
                    destroySwiper();
                }
            })
            .catch(error => {
                console.error("Loading error:", error);
                contentDiv.innerHTML = `
                    <div class="error-message">
                        <h2>Une erreur est survenue</h2>
                        <p>Impossible de charger la page ${page}.</p>
                    </div>
                `;
            });
    }

    function updateActiveLink(page) {
        links.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${page}`) {
                link.classList.add("active");
            }
        });

        const activeLink = document.querySelector(".nav-links a.active");
        if (activeLink) {
            const linkRect = activeLink.getBoundingClientRect();
            const navRect = navLinks.getBoundingClientRect();
            const width = linkRect.width + 30;
            const leftPosition = activeLink.offsetLeft - 15;
            indicator.style.width = `${width}px`;
            indicator.style.transform = `translateX(${leftPosition}px)`;
            const height = 40;
            const topPosition = (linkRect.height - height) / 2;
            indicator.style.top = `${topPosition}px`;
        }
    }

    function loadRealisationCSS() {
        let link = document.querySelector("link[data-dynamic='realisation']");
        if (!link) {
            link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = `${basePath}/views/realisation.css`;
            link.setAttribute("data-dynamic", "realisation");
            document.head.appendChild(link);
        }
    }

    function removeRealisationCSS() {
        const link = document.querySelector("link[data-dynamic='realisation']");
        if (link) {
            link.remove();
        }
    }

    function destroySwiper() {
        if (swiperInstance) {
            swiperInstance.destroy(true, true);
            swiperInstance = null;
        }
    }

    function initializeSwiper() {
        if (document.querySelector('.card-wrapper')) {
            destroySwiper(); // Ensure any existing instance is destroyed

            swiperInstance = new Swiper('.card-wrapper', {
                loop: true,
                spaceBetween: 30,
                grabCursor: true,
                centeredSlides: true,
                
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                    dynamicBullets: true
                },

                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },

                breakpoints: {
                    0: {
                        slidesPerView: 1
                    },
                    768: {
                        slidesPerView: 2,
                        centeredSlides: false
                    },
                    1024: {
                        slidesPerView: 3,
                        centeredSlides: false
                    },
                },

                on: {
                    init: function () {
                        console.log('Swiper initialized successfully');
                    },
                    error: function (e) {
                        console.error('Swiper initialization error:', e);
                    }
                }
            });
        } else {
            console.warn('Swiper container not found in DOM');
        }
    }

    function handleNavigation() {
        const hash = window.location.hash;
        const page = hash ? hash.substring(1) : "home";
        loadPage(page);
    }

    // Event Listeners
    window.addEventListener("hashchange", handleNavigation);
    
    // Initialize nav indicator position on window resize
    window.addEventListener("resize", () => {
        const currentPage = window.location.hash.substring(1) || "home";
        updateActiveLink(currentPage);
    });

    // Initial load
    handleNavigation();
});