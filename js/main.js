// Manual slider functionality
document.addEventListener('DOMContentLoaded', function() {
    const sliders = document.querySelectorAll('.manual-slider');
    
    sliders.forEach(slider => {
        const container = slider.querySelector('.slider-container');
        const slides = slider.querySelectorAll('.slide');
        const dots = slider.querySelectorAll('.slider-dot');
        const prevBtn = slider.querySelector('.slider-arrow.prev');
        const nextBtn = slider.querySelector('.slider-arrow.next');
        
        let currentSlide = 0;
        const slideCount = slides.length;
        
        // Initialize first slide
        updateSlider();
        
        function updateSlider() {
            // Update slides
            slides.forEach((slide, index) => {
                slide.classList.remove('active');
                if (index === currentSlide) {
                    slide.classList.add('active');
                }
            });
            
            // Update container position
            container.style.transform = `translateX(-${currentSlide * 102}%)`;
            
            // Update dots
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
        }
        
        function nextSlide() {
            currentSlide = (currentSlide + 1) % slideCount;
            updateSlider();
        }
        
        function prevSlide() {
            currentSlide = (currentSlide - 1 + slideCount) % slideCount;
            updateSlider();
        }
        
        // Event listeners
        nextBtn?.addEventListener('click', nextSlide);
        prevBtn?.addEventListener('click', prevSlide);
        
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentSlide = index;
                updateSlider();
            });
        });
        
        // Touch events for mobile
        let touchStartX = 0;
        let touchEndX = 0;
        
        slider.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, false);
        
        slider.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, false);
        
        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            }
        }
        
        // Auto-slide functionality
        let autoSlideInterval;
        
        function startAutoSlide() {
            autoSlideInterval = setInterval(nextSlide, 5000);
        }
        
        function stopAutoSlide() {
            clearInterval(autoSlideInterval);
        }
        
        // Start auto-slide and pause on hover
        startAutoSlide();
        
        slider.addEventListener('mouseenter', stopAutoSlide);
        slider.addEventListener('mouseleave', startAutoSlide);
    });
});

// FAQ functionality
document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const toggle = item.querySelector('.faq-toggle');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-toggle').textContent = '+';
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
                toggle.textContent = '−';
            }
        });
    });
});

// Numbers animation
function animateNumbers() {
    const numbers = document.querySelectorAll('.achievement-number');
    
    numbers.forEach(number => {
        const target = parseInt(number.getAttribute('data-value'));
        const duration = 2000; // 2 seconds
        const step = target / (duration / 16); // 60 FPS
        let current = 0;
        
        function updateNumber() {
            current += step;
            if (current >= target) {
                current = target;
                number.textContent = target;
                return;
            }
            number.textContent = Math.round(current);
            requestAnimationFrame(updateNumber);
        }
        
        // Start animation when element is in viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateNumber();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(number);
    });
}

// Call animation function when DOM is loaded
animateNumbers();

// Burger Menu
document.addEventListener('DOMContentLoaded', function() {
    const burgerMenu = document.querySelector('.burger-menu');
    const nav = document.querySelector('.nav');
    const body = document.body;

    if (burgerMenu && nav) {
        burgerMenu.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            burgerMenu.classList.toggle('active');
            nav.classList.toggle('active');
            body.classList.toggle('no-scroll');
        });

        // Close menu when clicking on a link
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                burgerMenu.classList.remove('active');
                nav.classList.remove('active');
                body.classList.remove('no-scroll');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (nav.classList.contains('active') && !nav.contains(e.target) && !burgerMenu.contains(e.target)) {
                burgerMenu.classList.remove('active');
                nav.classList.remove('active');
                body.classList.remove('no-scroll');
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && nav.classList.contains('active')) {
                burgerMenu.classList.remove('active');
                nav.classList.remove('active');
                body.classList.remove('no-scroll');
            }
        });
    }
});

// Testimonials Slider
document.addEventListener('DOMContentLoaded', function() {
    const track = document.querySelector('.testimonials-track');
    const cards = document.querySelectorAll('.testimonial-card');
    const prevBtn = document.querySelector('.testimonials-nav__btn.prev');
    const nextBtn = document.querySelector('.testimonials-nav__btn.next');
    const dotsContainer = document.querySelector('.testimonials-dots');

    // Проверяем наличие всех необходимых элементов
    if (!track || !cards.length || !prevBtn || !nextBtn || !dotsContainer) {
        return; // Если хотя бы один элемент отсутствует, прекращаем выполнение
    }

    let currentSlide = 0;
    let slidesPerView = getSlidesPerView();
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;

    // Create dots
    const totalDots = 3;
    for (let i = 0; i < totalDots; i++) {
        const dot = document.createElement('div');
        dot.classList.add('testimonials-dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }

    // Update slides per view on window resize
    window.addEventListener('resize', () => {
        slidesPerView = getSlidesPerView();
        goToSlide(currentSlide);
    });

    // Navigation buttons
    prevBtn.addEventListener('click', () => {
        if (currentSlide > 0) {
            goToSlide(currentSlide - 1);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentSlide < cards.length - slidesPerView) {
            goToSlide(currentSlide + 1);
        }
    });

    // Touch events
    track.addEventListener('touchstart', touchStart);
    track.addEventListener('touchmove', touchMove);
    track.addEventListener('touchend', touchEnd);

    // Mouse events
    track.addEventListener('mousedown', touchStart);
    track.addEventListener('mousemove', touchMove);
    track.addEventListener('mouseup', touchEnd);
    track.addEventListener('mouseleave', touchEnd);

    function touchStart(event) {
        isDragging = true;
        startPos = getPositionX(event);
        track.style.cursor = 'grabbing';
    }

    function touchMove(event) {
        if (!isDragging) return;
        
        const currentPosition = getPositionX(event);
        currentTranslate = prevTranslate + currentPosition - startPos;
        
        // Add boundaries
        const minTranslate = -(cards.length - slidesPerView) * (cards[0].offsetWidth + 30);
        currentTranslate = Math.max(Math.min(currentTranslate, 0), minTranslate);
        
        track.style.transform = `translateX(${currentTranslate}px)`;
    }

    function touchEnd() {
        isDragging = false;
        track.style.cursor = 'grab';
        
        const movedBy = currentTranslate - prevTranslate;
        
        if (Math.abs(movedBy) > 100) {
            if (movedBy < 0 && currentSlide < cards.length - slidesPerView) {
                goToSlide(currentSlide + 1);
            } else if (movedBy > 0 && currentSlide > 0) {
                goToSlide(currentSlide - 1);
            } else {
                goToSlide(currentSlide);
            }
        } else {
            goToSlide(currentSlide);
        }
    }

    function getPositionX(event) {
        return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
    }

    function goToSlide(index) {
        currentSlide = index;
        prevTranslate = currentTranslate = -(index * (cards[0].offsetWidth + 30));
        track.style.transform = `translateX(${currentTranslate}px)`;
        
        // Update dots
        document.querySelectorAll('.testimonials-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        
        // Update buttons
        prevBtn.style.opacity = index === 0 ? '0.5' : '1';
        nextBtn.style.opacity = index === cards.length - slidesPerView ? '0.5' : '1';
    }

    function getSlidesPerView() {
        if (window.innerWidth < 768) return 1;
        if (window.innerWidth < 1200) return 2;
        return 3;
    }

    // Auto play
    let autoPlayInterval = setInterval(() => {
        if (currentSlide < cards.length - slidesPerView) {
            goToSlide(currentSlide + 1);
        } else {
            goToSlide(0);
        }
    }, 5000);

    // Pause auto play on hover
    track.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
    track.addEventListener('mouseleave', () => {
        autoPlayInterval = setInterval(() => {
            if (currentSlide < cards.length - slidesPerView) {
                goToSlide(currentSlide + 1);
            } else {
                goToSlide(0);
            }
        }, 5000);
    });
}); 