document.addEventListener('DOMContentLoaded', () => {
    const cardGrid = document.getElementById('cardGrid');
    const searchInput = document.getElementById('searchInput');
    const filterCategory = document.getElementById('filterCategory');
    const noResult = document.getElementById('noResult');
    const modal = document.getElementById('detailModal');
    const modalBody = document.getElementById('modalBody');
    const backToTop = document.getElementById('backToTop');
    const navbar = document.getElementById('navbar');
    const closeModalBtn = document.querySelector('.close-modal');

    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const themeToggle = document.getElementById('theme-toggle');        
    const themeToggleMobile = document.getElementById('theme-toggle-mobile'); 

    if(menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('flex');
        });
    }

    window.toggleMobileMenu = () => {
        if(mobileMenu) {
            mobileMenu.classList.add('hidden');
            mobileMenu.classList.remove('flex');
        }
    };

    function toggleTheme() {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.theme = isDark ? 'dark' : 'light';
        const text = isDark ? '☀️ Light' : '🌙 Dark';
        if(themeToggle) themeToggle.innerText = text;
        if(themeToggleMobile) themeToggleMobile.innerText = text;
    }

    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        if(themeToggle) themeToggle.innerText = '☀️ Light';
        if(themeToggleMobile) themeToggleMobile.innerText = '☀️ Light';
    }

    if(themeToggle) themeToggle.addEventListener('click', toggleTheme);
    if(themeToggleMobile) themeToggleMobile.addEventListener('click', toggleTheme);

    let currentImageIndex = 0;
    let currentItemImages = [];
    let slideshowInterval;
    let animationTimeouts = [];

    function renderCards(data) {
        animationTimeouts.forEach(clearTimeout);
        animationTimeouts = [];

        cardGrid.innerHTML = '';
        if (data.length === 0) {
            noResult.style.display = 'block';
            return;
        } else {
            noResult.style.display = 'none';
        }

        data.forEach((item, index) => {
            const card = document.createElement('div');
            card.setAttribute('data-id', item.id);
            card.className = 'bg-white dark:bg-darkCard rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer group opacity-0';

            const coverImage = item.images && item.images.length > 0 ? item.images[0] : 'https://placehold.co/600x400';
            const fallbackLink = `https://placehold.co/600x400?text=${encodeURIComponent(item.name)}`;

            card.innerHTML = `
                <div class="h-64 overflow-hidden relative">
                    <img src="${coverImage}" alt="${item.name}" loading="lazy" 
                         class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                         onerror="this.onerror=null; this.src='${fallbackLink}';">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300"></div>
                    <span class="absolute top-4 right-4 px-3 py-1 text-xs font-bold bg-white/90 dark:bg-darkCard/90 text-primary rounded-full shadow-sm backdrop-blur-md">
                        #${getCategoryName(item.category)}
                    </span>
                </div>
                <div class="p-6 relative">
                    <h3 class="text-2xl font-bold text-gray-800 dark:text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">${item.name}</h3>
                    <p class="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-2">${item.description}</p>
                    <div class="w-full text-center bg-primary/10 text-primary py-3 rounded-xl font-bold group-hover:bg-primary group-hover:text-white transition-all shadow-sm group-hover:shadow-md active:scale-95">
                        ดูรายละเอียด
                    </div>
                </div>
            `;
            cardGrid.appendChild(card);
            
            const timeoutId = setTimeout(() => {
                card.classList.remove('opacity-0');
                card.classList.add('animate-slide-up');
            }, index * 100);
            animationTimeouts.push(timeoutId);
        });
    }

    cardGrid.addEventListener('click', (e) => {
        const card = e.target.closest('[data-id]');
        if (card) {
            const id = parseInt(card.getAttribute('data-id'));
            openModal(id);
        }
    });

    function getCategoryName(cat) {
        const names = { 'nature': 'ธรรมชาติ', 'temple': 'วัด/ศาสนา', 'culture': 'วัฒนธรรม', 'city': 'ในเมือง' };
        return names[cat] || cat;
    }

    function handleFilter() {
        const searchText = searchInput.value.toLowerCase();
        const category = filterCategory.value;
        const filtered = attractions.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchText) || item.description.toLowerCase().includes(searchText);
            const matchesCategory = category === 'all' || item.category === category;
            return matchesSearch && matchesCategory;
        });
        renderCards(filtered);
    }
    
    searchInput.addEventListener('input', debounce(handleFilter, 300));
    filterCategory.addEventListener('change', handleFilter);

    let isScrolling = false;
    const heroText = document.getElementById('hero-text');

    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                handleScrollEffects();
                isScrolling = false;
            });
            isScrolling = true;
        }
    });

    function handleScrollEffects() {
        const scrollPosition = window.scrollY;
        
        if (heroText) {
            let opacity = 1 - (scrollPosition / 500);
            let translateY = scrollPosition * 0.5;
            if (opacity < 0) opacity = 0; 
            heroText.style.opacity = opacity;
            heroText.style.transform = `translateY(${translateY}px)`;
        }

        if (scrollPosition > 50) navbar.classList.add('shadow-sm', 'bg-white/90', 'dark:bg-darkCard/90', 'backdrop-blur-md');
        else navbar.classList.remove('shadow-sm', 'bg-white/90', 'dark:bg-darkCard/90', 'backdrop-blur-md');
        
        if (scrollPosition > 300) backToTop.classList.remove('hidden');
        else backToTop.classList.add('hidden');
    }

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.remove('opacity-0-start', 'translate-y-10');
                entry.target.classList.add('animate-slide-up');
                sectionObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    const observerTargets = ['attractions-title', 'search-container', 'map-title', 'map-container'];
    observerTargets.forEach(id => {
        const el = document.getElementById(id);
        if(el) sectionObserver.observe(el);
    });

    const openModal = (id) => {
        const item = attractions.find(a => a.id === id);
        if (!item) return;

        currentImageIndex = 0;
        currentItemImages = item.images && item.images.length > 0 ? item.images : ['https://placehold.co/600x400?text=No+Image'];
        stopSlideshow();

        let thumbsHTML = '';
        if(currentItemImages.length > 1) {
            thumbsHTML = `<div class="flex gap-2 overflow-x-auto pb-2 mt-4 px-6 no-scrollbar" id="thumbContainer">`;
            currentItemImages.forEach((img, index) => {
                thumbsHTML += `<img src="${img}" 
                                onerror="this.src='https://placehold.co/100x100?text=No+Image'"
                                class="w-20 h-14 object-cover rounded-lg cursor-pointer opacity-50 hover:opacity-100 border-2 border-transparent hover:border-primary transition-all thumb-img active:scale-95" 
                                data-index="${index}" onclick="changeSlide(${index})">`;
            });
            thumbsHTML += `</div>`;
        }

        const query = encodeURIComponent(item.name + ' อุดรธานี');
        const mapEmbedUrl = `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
        const mapOpenUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
        
        const mainImg = currentItemImages[0];

        modalBody.innerHTML = `
            <div class="relative w-full h-[300px] md:h-[450px] bg-black group">
                <button class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md z-10 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 active:scale-90" onclick="moveSlide(-1)">❮</button>
                <button class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md z-10 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 active:scale-90" onclick="moveSlide(1)">❯</button>
                
                <img id="modalMainImage" src="${mainImg}" 
                     class="w-full h-full object-contain transition-opacity duration-300 animate-fade-in"
                     onerror="this.src='https://placehold.co/600x400?text=${encodeURIComponent(item.name)}'">
                
                <div class="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 to-transparent text-white">
                     <h2 class="text-3xl font-bold mb-2">${item.name}</h2>
                     <div class="flex flex-wrap gap-4 text-sm opacity-95 font-medium">
                        <span class="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">📍 ${item.location}</span>
                        <span class="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">🕒 ${item.time}</span>
                    </div>
                </div>
            </div>

            ${thumbsHTML}

            <div class="p-6 space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-700/50">
                        <h4 class="font-bold text-yellow-700 dark:text-yellow-400 mb-1 flex items-center gap-2">✨ ไฮไลท์ห้ามพลาด</h4>
                        <p class="text-sm text-gray-700 dark:text-gray-300">${item.highlight || '-'}</p>
                    </div>
                    <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-700/50">
                        <h4 class="font-bold text-green-700 dark:text-green-400 mb-1 flex items-center gap-2">💰 ค่าเข้าชม</h4>
                        <p class="text-sm text-gray-700 dark:text-gray-300">${item.price || 'ไม่ระบุ'}</p>
                    </div>
                </div>

                <div class="p-5 bg-gray-50 dark:bg-gray-700/30 rounded-2xl text-gray-700 dark:text-gray-300 leading-relaxed text-lg border-l-4 border-primary">
                    ${item.description}
                </div>
                
                <div class="flex gap-4">
                     <a href="${mapOpenUrl}" target="_blank" class="flex-1 text-center bg-gradient-to-r from-[#34a853] to-[#2c8f46] hover:from-[#2c8f46] hover:to-[#1e6b32] text-white py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-xl active:scale-95 flex items-center justify-center gap-2">
                        🗺️ เปิด Google Maps
                    </a>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
        history.pushState({ modalOpen: true }, "", "#detail");
        document.body.style.overflow = 'hidden';
        
        // --- ส่วนที่แก้ไข: สั่งให้ Scroll กลับขึ้นไปข้างบนสุดเสมอ ---
        modalBody.scrollTop = 0; 
        // ----------------------------------------------------

        updateGalleryDisplay();
        startSlideshow();

        const bigMap = document.getElementById('googleMap');
        if(bigMap) {
            bigMap.src = mapEmbedUrl;
        }
    };

    window.updateGalleryDisplay = () => {
        const mainImage = document.getElementById('modalMainImage');
        const thumbs = document.querySelectorAll('.thumb-img');
        if(!mainImage) return;

        mainImage.style.opacity = 0.5;
        setTimeout(() => {
            mainImage.src = currentItemImages[currentImageIndex];
            mainImage.style.opacity = 1;
        }, 150);

        thumbs.forEach(thumb => {
            thumb.classList.remove('border-primary', 'opacity-100');
            thumb.classList.add('opacity-50', 'border-transparent');
        });
        if (thumbs[currentImageIndex]) {
            thumbs[currentImageIndex].classList.remove('opacity-50', 'border-transparent');
            thumbs[currentImageIndex].classList.add('opacity-100', 'border-primary');
        }
    };

    window.moveSlide = (n) => {
        currentImageIndex += n;
        if (currentImageIndex >= currentItemImages.length) currentImageIndex = 0;
        if (currentImageIndex < 0) currentImageIndex = currentItemImages.length - 1;
        updateGalleryDisplay();
    };

    window.changeSlide = (index) => {
        currentImageIndex = index;
        updateGalleryDisplay();
    };

    function startSlideshow() {
        if(currentItemImages.length <= 1) return;
        stopSlideshow();
        slideshowInterval = setInterval(() => { moveSlide(1); }, 3500);
    }
    function stopSlideshow() { clearInterval(slideshowInterval); }

    window.addEventListener('popstate', (event) => {
        if (!modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
            stopSlideshow();
        }
    });

    window.closeModalFunc = () => {
        if (history.state && history.state.modalOpen) {
            history.back();
        } else {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
            stopSlideshow();
        }
    };
    closeModalBtn.onclick = closeModalFunc;

    backToTop.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const dropdownBtn = document.getElementById('dropdownBtn');
    const dropdownList = document.getElementById('dropdownList');
    const dropdownArrow = document.getElementById('dropdownArrow');
    const selectedText = document.getElementById('selectedText');
    const dropdownItems = dropdownList.querySelectorAll('li');
    const hiddenInput = document.getElementById('filterCategory');

    dropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = !dropdownList.classList.contains('invisible');
        if (isOpen) closeDropdown();
        else openDropdown();
    });

    function openDropdown() {
        dropdownList.classList.remove('invisible', 'opacity-0', 'scale-95');
        dropdownList.classList.add('opacity-100', 'scale-100');
        dropdownArrow.classList.add('rotate-180');
        dropdownItems.forEach((item) => {
            item.classList.remove('translate-y-2', 'opacity-0');
        });
    }

    function closeDropdown() {
        dropdownList.classList.add('invisible', 'opacity-0', 'scale-95');
        dropdownList.classList.remove('opacity-100', 'scale-100');
        dropdownArrow.classList.remove('rotate-180');
        dropdownItems.forEach((item) => {
            item.classList.add('translate-y-2', 'opacity-0');
        });
    }

    dropdownItems.forEach(item => {
        item.addEventListener('click', () => {
            const value = item.getAttribute('data-value');
            const text = item.innerText;
            selectedText.innerText = text;
            hiddenInput.value = value;
            handleFilter();
            closeDropdown();
        });
    });

    window.addEventListener('click', () => { closeDropdown(); });
    
    window.sharePlace = (name, desc) => {
        if (navigator.share) {
            navigator.share({
                title: `ไปเที่ยว ${name} กันเถอะ!`,
                text: `${name}: ${desc}`,
                url: window.location.href
            }).catch(console.error);
        } else {
            alert('คัดลอกลิงก์เรียบร้อยแล้ว!');
        }
    };

    window.randomTravel = () => {
        const randomIndex = Math.floor(Math.random() * attractions.length);
        const randomItem = attractions[randomIndex];
        openModal(randomItem.id);
    };
    
    renderCards(attractions);
});
            animationTimeouts.push(timeoutId);
        });
    }

    cardGrid.addEventListener('click', (e) => {
        const card = e.target.closest('[data-id]');
        if (card) {
            const id = parseInt(card.getAttribute('data-id'));
            openModal(id);
        }
    });

    function getCategoryName(cat) {
        const names = { 'nature': 'ธรรมชาติ', 'temple': 'วัด/ศาสนา', 'culture': 'วัฒนธรรม', 'city': 'ในเมือง' };
        return names[cat] || cat;
    }

    function handleFilter() {
        const searchText = searchInput.value.toLowerCase();
        const category = filterCategory.value;
        const filtered = attractions.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchText) || item.description.toLowerCase().includes(searchText);
            const matchesCategory = category === 'all' || item.category === category;
            return matchesSearch && matchesCategory;
        });
        renderCards(filtered);
    }
    
    searchInput.addEventListener('input', debounce(handleFilter, 300));
    filterCategory.addEventListener('change', handleFilter);

    let isScrolling = false;
    const heroText = document.getElementById('hero-text');

    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                handleScrollEffects();
                isScrolling = false;
            });
            isScrolling = true;
        }
    });

    function handleScrollEffects() {
        const scrollPosition = window.scrollY;
        
        if (heroText) {
            let opacity = 1 - (scrollPosition / 500);
            let translateY = scrollPosition * 0.5;
            if (opacity < 0) opacity = 0; 
            heroText.style.opacity = opacity;
            heroText.style.transform = `translateY(${translateY}px)`;
        }

        if (scrollPosition > 50) navbar.classList.add('shadow-sm', 'bg-white/90', 'dark:bg-darkCard/90', 'backdrop-blur-md');
        else navbar.classList.remove('shadow-sm', 'bg-white/90', 'dark:bg-darkCard/90', 'backdrop-blur-md');
        
        if (scrollPosition > 300) backToTop.classList.remove('hidden');
        else backToTop.classList.add('hidden');
    }

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.remove('opacity-0-start', 'translate-y-10');
                entry.target.classList.add('animate-slide-up');
                sectionObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    const observerTargets = ['attractions-title', 'search-container', 'map-title', 'map-container'];
    observerTargets.forEach(id => {
        const el = document.getElementById(id);
        if(el) sectionObserver.observe(el);
    });

    const openModal = (id) => {
        const item = attractions.find(a => a.id === id);
        if (!item) return;

        currentImageIndex = 0;
        currentItemImages = item.images && item.images.length > 0 ? item.images : ['https://placehold.co/600x400?text=No+Image'];
        stopSlideshow();

        let thumbsHTML = '';
        if(currentItemImages.length > 1) {
            thumbsHTML = `<div class="flex gap-2 overflow-x-auto pb-2 mt-4 px-6 no-scrollbar" id="thumbContainer">`;
            currentItemImages.forEach((img, index) => {
                thumbsHTML += `<img src="${img}" 
                                onerror="this.src='https://placehold.co/100x100?text=No+Image'"
                                class="w-20 h-14 object-cover rounded-lg cursor-pointer opacity-50 hover:opacity-100 border-2 border-transparent hover:border-primary transition-all thumb-img active:scale-95" 
                                data-index="${index}" onclick="changeSlide(${index})">`;
            });
            thumbsHTML += `</div>`;
        }

        const query = encodeURIComponent(item.name + ' อุดรธานี');
        const mapEmbedUrl = `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
        const mapOpenUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
        
        const mainImg = currentItemImages[0];

        modalBody.innerHTML = `
            <div class="relative w-full h-[300px] md:h-[450px] bg-black group">
                <button class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md z-10 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 active:scale-90" onclick="moveSlide(-1)">❮</button>
                <button class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md z-10 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 active:scale-90" onclick="moveSlide(1)">❯</button>
                
                <img id="modalMainImage" src="${mainImg}" 
                     class="w-full h-full object-contain transition-opacity duration-300 animate-fade-in"
                     onerror="this.src='https://placehold.co/600x400?text=${encodeURIComponent(item.name)}'">
                
                <div class="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 to-transparent text-white">
                     <h2 class="text-3xl font-bold mb-2">${item.name}</h2>
                     <div class="flex flex-wrap gap-4 text-sm opacity-95 font-medium">
                        <span class="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">📍 ${item.location}</span>
                        <span class="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">🕒 ${item.time}</span>
                    </div>
                </div>
            </div>

            ${thumbsHTML}

            <div class="p-6 space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-700/50">
                        <h4 class="font-bold text-yellow-700 dark:text-yellow-400 mb-1 flex items-center gap-2">✨ ไฮไลท์ห้ามพลาด</h4>
                        <p class="text-sm text-gray-700 dark:text-gray-300">${item.highlight || '-'}</p>
                    </div>
                    <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-700/50">
                        <h4 class="font-bold text-green-700 dark:text-green-400 mb-1 flex items-center gap-2">💰 ค่าเข้าชม</h4>
                        <p class="text-sm text-gray-700 dark:text-gray-300">${item.price || 'ไม่ระบุ'}</p>
                    </div>
                </div>

                <div class="p-5 bg-gray-50 dark:bg-gray-700/30 rounded-2xl text-gray-700 dark:text-gray-300 leading-relaxed text-lg border-l-4 border-primary">
                    ${item.description}
                </div>
                
                <div class="flex gap-4">
                     <a href="${mapOpenUrl}" target="_blank" class="flex-1 text-center bg-gradient-to-r from-[#34a853] to-[#2c8f46] hover:from-[#2c8f46] hover:to-[#1e6b32] text-white py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-xl active:scale-95 flex items-center justify-center gap-2">
                        🗺️ เปิด Google Maps
                    </a>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
        history.pushState({ modalOpen: true }, "", "#detail");
        document.body.style.overflow = 'hidden';
        updateGalleryDisplay();
        startSlideshow();

        const bigMap = document.getElementById('googleMap');
        if(bigMap) {
            bigMap.src = mapEmbedUrl;
        }
    };

    window.updateGalleryDisplay = () => {
        const mainImage = document.getElementById('modalMainImage');
        const thumbs = document.querySelectorAll('.thumb-img');
        if(!mainImage) return;

        mainImage.style.opacity = 0.5;
        setTimeout(() => {
            mainImage.src = currentItemImages[currentImageIndex];
            mainImage.style.opacity = 1;
        }, 150);

        thumbs.forEach(thumb => {
            thumb.classList.remove('border-primary', 'opacity-100');
            thumb.classList.add('opacity-50', 'border-transparent');
        });
        if (thumbs[currentImageIndex]) {
            thumbs[currentImageIndex].classList.remove('opacity-50', 'border-transparent');
            thumbs[currentImageIndex].classList.add('opacity-100', 'border-primary');
        }
    };

    window.moveSlide = (n) => {
        currentImageIndex += n;
        if (currentImageIndex >= currentItemImages.length) currentImageIndex = 0;
        if (currentImageIndex < 0) currentImageIndex = currentItemImages.length - 1;
        updateGalleryDisplay();
    };

    window.changeSlide = (index) => {
        currentImageIndex = index;
        updateGalleryDisplay();
    };

    function startSlideshow() {
        if(currentItemImages.length <= 1) return;
        stopSlideshow();
        slideshowInterval = setInterval(() => { moveSlide(1); }, 3500);
    }
    function stopSlideshow() { clearInterval(slideshowInterval); }

    window.addEventListener('popstate', (event) => {
        if (!modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
            stopSlideshow();
        }
    });

    window.closeModalFunc = () => {
        if (history.state && history.state.modalOpen) {
            history.back();
        } else {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
            stopSlideshow();
        }
    };
    closeModalBtn.onclick = closeModalFunc;

    backToTop.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const dropdownBtn = document.getElementById('dropdownBtn');
    const dropdownList = document.getElementById('dropdownList');
    const dropdownArrow = document.getElementById('dropdownArrow');
    const selectedText = document.getElementById('selectedText');
    const dropdownItems = dropdownList.querySelectorAll('li');
    const hiddenInput = document.getElementById('filterCategory');

    dropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = !dropdownList.classList.contains('invisible');
        if (isOpen) closeDropdown();
        else openDropdown();
    });

    function openDropdown() {
        dropdownList.classList.remove('invisible', 'opacity-0', 'scale-95');
        dropdownList.classList.add('opacity-100', 'scale-100');
        dropdownArrow.classList.add('rotate-180');
        dropdownItems.forEach((item) => {
            item.classList.remove('translate-y-2', 'opacity-0');
        });
    }

    function closeDropdown() {
        dropdownList.classList.add('invisible', 'opacity-0', 'scale-95');
        dropdownList.classList.remove('opacity-100', 'scale-100');
        dropdownArrow.classList.remove('rotate-180');
        dropdownItems.forEach((item) => {
            item.classList.add('translate-y-2', 'opacity-0');
        });
    }

    dropdownItems.forEach(item => {
        item.addEventListener('click', () => {
            const value = item.getAttribute('data-value');
            const text = item.innerText;
            selectedText.innerText = text;
            hiddenInput.value = value;
            handleFilter();
            closeDropdown();
        });
    });

    window.addEventListener('click', () => { closeDropdown(); });
    
    window.sharePlace = (name, desc) => {
        if (navigator.share) {
            navigator.share({
                title: `ไปเที่ยว ${name} กันเถอะ!`,
                text: `${name}: ${desc}`,
                url: window.location.href
            }).catch(console.error);
        } else {
            alert('คัดลอกลิงก์เรียบร้อยแล้ว!');
        }
    };

    window.randomTravel = () => {
        const randomIndex = Math.floor(Math.random() * attractions.length);
        const randomItem = attractions[randomIndex];
        openModal(randomItem.id);
    };
    
    renderCards(attractions);
});

