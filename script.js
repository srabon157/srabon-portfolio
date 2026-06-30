/* ==========================================================================
    Mohaimin Hossain Srabon | Portfolio Interaction Logic (script.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Loading Screen Animation
    const loaderScreen = document.getElementById('loaderScreen');
    const loaderBar = document.getElementById('loaderBar');
    
    // Animate loader bar progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 5;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                loaderScreen.classList.add('hidden');
                document.body.style.overflowY = 'auto'; // enable scrolling
                // Trigger scroll reveals on load
                reveal();
                animateCounters();
            }, 500);
        }
        loaderBar.style.width = `${progress}%`;
    }, 100);

    // Disable body scroll while loading
    document.body.style.overflow = 'hidden';

    // 2. Custom Cursor
    const cursor = document.getElementById('customCursor');
    const follower = document.getElementById('customCursorFollower');
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Instant position for central dot
        cursor.style.left = `${mouseX}px`;
        cursor.style.top = `${mouseY}px`;
    });

    // Follower easing animation
    function animateFollower() {
        // Easing factor (0.1 = smooth slow follow)
        followerX += (mouseX - followerX) * 0.15;
        followerY += (mouseY - followerY) * 0.15;
        
        follower.style.left = `${followerX}px`;
        follower.style.top = `${followerY}px`;
        
        requestAnimationFrame(animateFollower);
    }
    animateFollower();

    // Hover state on links & buttons
    const hoverElements = document.querySelectorAll('a, button, input, textarea, .tilt-element, .dot');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hovered');
            follower.classList.add('hovered');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hovered');
            follower.classList.remove('hovered');
        });
    });

    // 3. Canvas Particles System
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    
    let particlesArray = [];
    let particleCount = 60;
    let connectionDistance = 120;
    let mouseRadius = 150;
    let mouse = { x: null, y: null };

    // Handle screen resize
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // Adjust connection distance and particle density based on device width
        if (canvas.width < 768) {
            particleCount = 30;
            connectionDistance = 80;
        } else {
            particleCount = 60;
            connectionDistance = 120;
        }
        initParticles();
    }
    
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        
        // Mouse follow glow update
        const glowFollow = document.getElementById('glowFollow');
        glowFollow.style.left = `${e.clientX + window.scrollX}px`;
        glowFollow.style.top = `${e.clientY + window.scrollY}px`;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Particle constructor
    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
        
        update() {
            // Collision detection with canvas edge
            if (this.x > canvas.width || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.directionY = -this.directionY;
            }
            
            // Move particle
            this.x += this.directionX;
            this.y += this.directionY;
            
            // Interaction with mouse pointer
            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouseRadius) {
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    let force = (mouseRadius - distance) / mouseRadius;
                    // Push particles slightly away or drag
                    this.x -= forceDirectionX * force * 1.5;
                    this.y -= forceDirectionY * force * 1.5;
                }
            }
            
            this.draw();
        }
    }

    function initParticles() {
        particlesArray = [];
        const isLightTheme = document.documentElement.getAttribute('data-theme') === 'light';
        const color = isLightTheme ? 'rgba(59, 130, 246, 0.25)' : 'rgba(6, 182, 212, 0.2)';
        
        for (let i = 0; i < particleCount; i++) {
            let size = (Math.random() * 2) + 1;
            let x = Math.random() * (canvas.width - size * 2) + size;
            let y = Math.random() * (canvas.height - size * 2) + size;
            let directionX = (Math.random() * 0.4) - 0.2;
            let directionY = (Math.random() * 0.4) - 0.2;
            
            particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }

    function connectParticles() {
        const isLightTheme = document.documentElement.getAttribute('data-theme') === 'light';
        const strokeColor = isLightTheme ? 'rgba(59, 130, 246, ' : 'rgba(139, 92, 246, ';
        
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let dx = particlesArray[a].x - particlesArray[b].x;
                let dy = particlesArray[a].y - particlesArray[b].y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < connectionDistance) {
                    // Opacity changes dynamically according to distance
                    let opacity = (1 - (distance / connectionDistance)) * 0.15;
                    ctx.strokeStyle = strokeColor + opacity + ')';
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connectParticles();
        requestAnimationFrame(animateParticles);
    }

    resizeCanvas();
    animateParticles();

    // 4. Dark / Light Mode Toggle
    const themeToggleBtn = document.getElementById('themeToggle');
    
    // Read local storage settings
    const savedTheme = localStorage.getItem('portfolioTheme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    initParticles(); // reset particle theme colors

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('portfolioTheme', newTheme);
        
        // Reinitialize particle colors
        initParticles();
    });

    // 5. Animated Typing Effect
    const typedTextElement = document.getElementById('typedText');
    const professions = [
        "Front-End Developer", 
        "React Specialist", 
        "Creative UI Designer", 
        "Clean Coder"
    ];
    let professionIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function typeEffect() {
        const currentProfession = professions[professionIndex];
        
        if (isDeleting) {
            typedTextElement.textContent = currentProfession.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50; // faster delete
        } else {
            typedTextElement.textContent = currentProfession.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 150; // regular typing
        }
        
        if (!isDeleting && charIndex === currentProfession.length) {
            isDeleting = true;
            typingSpeed = 1800; // pause at full text
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            professionIndex = (professionIndex + 1) % professions.length;
            typingSpeed = 500; // pause before starting next word
        }
        
        setTimeout(typeEffect, typingSpeed);
    }
    
    if (typedTextElement) {
        setTimeout(typeEffect, 1500); // delay start after loading screen fades
    }

    // 6. Intersection Observer Scroll Reveal Animation
    const revealElements = document.querySelectorAll('.reveal');
    
    function reveal() {
        const triggerBottom = window.innerHeight * 0.85;
        revealElements.forEach(el => {
            const elTop = el.getBoundingClientRect().top;
            if (elTop < triggerBottom) {
                el.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', reveal);

    // 7. Stat Cards Number Counting Animation
    let countStarted = false;
    
    function animateCounters() {
        const aboutSec = document.getElementById('about');
        if (!aboutSec) return;
        
        const rect = aboutSec.getBoundingClientRect();
        if (rect.top < window.innerHeight && !countStarted) {
            countStarted = true;
            const counterElements = document.querySelectorAll('.stat-number');
            counterElements.forEach(counter => {
                const target = +counter.getAttribute('data-target');
                const isPercent = counter.textContent.includes('%');
                const suffix = isPercent ? '%' : '+';
                
                let current = 0;
                // Determine increment step
                const step = target / 40;
                
                const updateCount = () => {
                    current += step;
                    if (current >= target) {
                        counter.textContent = target + suffix;
                    } else {
                        counter.textContent = Math.ceil(current) + suffix;
                        setTimeout(updateCount, 25);
                    }
                };
                updateCount();
            });
        }
    }
    window.addEventListener('scroll', animateCounters);

    // 8. Sticky Navbar & Scroll Indicators
    const navbar = document.getElementById('navbar');
    const scrollProgress = document.getElementById('scrollProgress');
    const scrollToTopBtn = document.getElementById('scrollToTop');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPosition = window.scrollY;
        
        // Progress Bar
        const progressPercentage = (scrollPosition / totalHeight) * 100;
        scrollProgress.style.width = `${progressPercentage}%`;
        
        // Sticky Header navbar
        if (scrollPosition > 50) {
            navbar.classList.add('sticky');
        } else {
            navbar.classList.remove('sticky');
        }
        
        // Scroll To Top button visibility
        if (scrollPosition > 500) {
            scrollToTopBtn.classList.add('active');
        } else {
            scrollToTopBtn.classList.remove('active');
        }
        
    });

    // Scroll to Top action
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Mobile Navigation Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu on clicking link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // 9. 3D Tilt Effect on hover
    const tiltElements = document.querySelectorAll('.tilt-element');
    
    // Only apply tilt on tablet & desktops
    if (window.innerWidth > 768) {
        tiltElements.forEach(element => {
            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left; // x coordinate inside element
                const y = e.clientY - rect.top;  // y coordinate inside element
                
                const width = rect.width;
                const height = rect.height;
                
                // Tilt levels (-10deg to 10deg)
                const rotateX = ((y / height) - 0.5) * -15; 
                const rotateY = ((x / width) - 0.5) * 15;
                
                element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
            });
        });
    }

    // 10. Testimonial Slider Carousel (Auto sliding + dots)
    const testimonialSlider = document.getElementById('testimonialSlider');
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    let slideTimer;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentSlide = index;
    }

    function nextSlide() {
        let next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }

    function startSlideShow() {
        slideTimer = setInterval(nextSlide, 6000); // 6s transition
    }

    function stopSlideShow() {
        clearInterval(slideTimer);
    }

    // Add click listeners to slide indicators
    dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            stopSlideShow();
            const targetIndex = parseInt(e.target.getAttribute('data-index'));
            showSlide(targetIndex);
            startSlideShow();
        });
    });

    if (testimonialSlider && slides.length > 0) {
        startSlideShow();
        testimonialSlider.addEventListener('mouseenter', stopSlideShow);
        testimonialSlider.addEventListener('mouseleave', startSlideShow);
    }

    // 11. Contact Form Verification & Submitting Feedback
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const formStatus = document.getElementById('formStatus');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            let isValid = true;
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const subjectInput = document.getElementById('subject');
            const messageInput = document.getElementById('message');
            
            // Name validation
            if (nameInput.value.trim() === '') {
                nameInput.parentElement.parentElement.classList.add('invalid');
                isValid = false;
            } else {
                nameInput.parentElement.parentElement.classList.remove('invalid');
            }
            
            // Email validation (regex)
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailInput.value.trim())) {
                emailInput.parentElement.parentElement.classList.add('invalid');
                isValid = false;
            } else {
                emailInput.parentElement.parentElement.classList.remove('invalid');
            }
            
            // Subject validation
            if (subjectInput.value.trim() === '') {
                subjectInput.parentElement.parentElement.classList.add('invalid');
                isValid = false;
            } else {
                subjectInput.parentElement.parentElement.classList.remove('invalid');
            }
            
            // Message validation
            if (messageInput.value.trim() === '') {
                messageInput.parentElement.parentElement.classList.add('invalid');
                isValid = false;
            } else {
                messageInput.parentElement.parentElement.classList.remove('invalid');
            }
            
            if (isValid) {
                // Show Sending loader UI
                submitBtn.disabled = true;
                const btnText = submitBtn.querySelector('.btn-text');
                const btnIcon = submitBtn.querySelector('i');
                const originalText = btnText.textContent;
                
                btnText.textContent = "Sending Message...";
                btnIcon.className = "fa-solid fa-circle-notch fa-spin icon-right";
                
                // Simulate backend API call (2s)
                setTimeout(() => {
                    submitBtn.disabled = false;
                    btnText.textContent = originalText;
                    btnIcon.className = "fa-solid fa-paper-plane icon-right";
                    
                    // Reset form
                    contactForm.reset();
                    
                    // Show success block
                    formStatus.textContent = "Thank you! Your message has been sent successfully.";
                    formStatus.className = "form-status success";
                    
                    // Hide success status box after 5s
                    setTimeout(() => {
                        formStatus.style.display = 'none';
                    }, 5000);
                }, 2000);
            }
        });
        
        // Remove invalid classes on type
        const inputs = contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                input.parentElement.parentElement.classList.remove('invalid');
            });
        });
    }
});
