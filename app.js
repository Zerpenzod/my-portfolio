/**
 * Portfolio — Vanilla JS Refactorizado
 */
(function () {
    'use strict';

    const SECTIONS = [
        { id: 'inicio',      label: 'Inicio' },
        { id: 'sobremi',     label: 'Sobre mí' },
        { id: 'proyectos',   label: 'Proyectos' },
        { id: 'juegos',      label: 'Juegos' },
        { id: 'contactame',  label: 'Contáctame' },
        { id: 'reviews',     label: 'Reviews' }, // NUEVA SECCIÓN
        { id: 'terminal',    label: 'Terminal' },
    ];
    const DEFAULT_SECTION = 'inicio';

    const els = {
        content:       document.getElementById('content'),
        year:          document.getElementById('year'),
        
        // Configuración y Modo Video
        btnSettings:   document.getElementById('btn-settings'),
        settingsPanel: document.getElementById('settings-panel'),
        bgAudio:       document.getElementById('bg-audio'),
        btnVideoMode:  document.getElementById('btn-video-mode'),
        btnExitVideo:  document.getElementById('btn-exit-video-mode'),
        rotateAlert:   document.getElementById('rotate-alert'),

        // Menús y Navegación
        menuOverlay:      document.getElementById('menu-overlay'),
        pcSubmenuOverlay: document.getElementById('pc-submenu-overlay'),
        btnMobileMenu:    document.getElementById('btn-mobile-menu'),
        mobileMenu:       document.getElementById('mobile-menu'),
        mobileAccordions: document.querySelectorAll('.mobile-accordion'),
        mobileLinks:      document.querySelectorAll('.mobile-link'),
    };

    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function isKnownSection(id) {
        return SECTIONS.some(function (s) { return s.id === id; });
    }

    // ============================================================
    // LÓGICA DE NAVEGACIÓN Y MENÚS
    // ============================================================
    function initNavigation() {
        function closeAllPanels() {
            if (els.mobileMenu && !els.mobileMenu.classList.contains('opacity-0')) {
                els.mobileMenu.classList.add('-translate-y-4', 'opacity-0', 'pointer-events-none');
                els.mobileMenu.classList.remove('translate-y-0', 'opacity-100');
            }
            if (els.menuOverlay) {
                els.menuOverlay.classList.add('opacity-0', 'pointer-events-none');
                els.menuOverlay.classList.remove('opacity-100');
            }
        }

        function toggleMobileMenu() {
            if (!els.mobileMenu) return;
            const isOpen = !els.mobileMenu.classList.contains('opacity-0');
            closeAllPanels();
            if (!isOpen) {
                els.mobileMenu.classList.remove('-translate-y-4', 'opacity-0', 'pointer-events-none');
                els.mobileMenu.classList.add('translate-y-0', 'opacity-100');
                if (els.menuOverlay) {
                    els.menuOverlay.classList.remove('opacity-0', 'pointer-events-none');
                    els.menuOverlay.classList.add('opacity-100');
                }
            }
        }

        if (els.btnMobileMenu) {
            els.btnMobileMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleMobileMenu();
            });
        }

        els.mobileAccordions.forEach(acc => {
            const btn = acc.querySelector('.mobile-accordion-btn');
            const content = acc.querySelector('.mobile-accordion-content');
            const icon = btn.querySelector('svg');
            if(!btn || !content) return;

            btn.addEventListener('click', () => {
                const isHidden = content.classList.contains('hidden');
                if (isHidden) {
                    content.classList.remove('hidden');
                    content.classList.add('flex');
                    icon.classList.add('rotate-180');
                } else {
                    content.classList.add('hidden');
                    content.classList.remove('flex');
                    icon.classList.remove('rotate-180');
                }
            });
        });

        els.mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (els.mobileMenu && !els.mobileMenu.classList.contains('opacity-0')) toggleMobileMenu();
            });
        });

        if (els.menuOverlay) els.menuOverlay.addEventListener('click', closeAllPanels);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeAllPanels();
        });
    }

    function initPcMenuFade() {
        const mainNav = document.getElementById('main-nav');
        if (!mainNav || !els.pcSubmenuOverlay) return;
        mainNav.addEventListener('mouseenter', () => els.pcSubmenuOverlay.classList.add('opacity-100'));
        mainNav.addEventListener('mouseleave', () => els.pcSubmenuOverlay.classList.remove('opacity-100'));
    }

    // ============================================================
    // RESEÑAS (Ahora se cargan dinámicamente)
    // ============================================================
    async function renderReviews() {
        const reviewsList = document.getElementById('reviews-list');
        if(!reviewsList) return;
        
        reviewsList.innerHTML = '<p class="text-sm text-zinc-600 animate-pulse">Cargando reseñas...</p>';
        try {
            const res = await fetch('/api/getReviews');
            if (!res.ok) throw new Error('Error al obtener reseñas');
            const reviews = await res.json();
            
            if (!reviews || reviews.length === 0) {
                reviewsList.innerHTML = '<p class="text-sm text-zinc-600">No hay reseñas aún. ¡Sé el primero!</p>';
                return;
            }
            
            reviewsList.innerHTML = reviews.map(r => `
                <article class="rounded-xl border border-zinc-800/50 bg-zinc-900/20 p-5 space-y-3 fade-in">
                    <header class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                                ${escapeHtml(r.user_name).charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p class="text-sm font-bold text-zinc-200">${escapeHtml(r.user_name)}</p>
                                <p class="text-[11px] text-zinc-500">${new Date(r.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                    </header>
                    <p class="text-sm text-zinc-300 leading-relaxed">${escapeHtml(r.comment)}</p>
                </article>
            `).join('');
        } catch (error) {
            reviewsList.innerHTML = '<p class="text-sm text-red-500">Error de conexión con la base de datos.</p>';
        }
    }

    function initReviewsPanel() {
        const form = document.getElementById('review-form');
        const inputName = document.getElementById('review-name');
        const inputText = document.getElementById('review-text');
        
        if(!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newReview = { user_name: inputName.value.trim(), comment: inputText.value.trim() };
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Enviando...';
            submitBtn.disabled = true;

            try {
                const res = await fetch('/api/postReview', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newReview)
                });
                if (res.ok) {
                    await renderReviews();
                    form.reset();
                } else {
                    const errorData = await res.json();
                    alert(`Error: ${errorData.error || 'No se pudo guardar la reseña'}`);
                }
            } catch (error) {
                alert("No se pudo conectar con el servidor.");
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // ============================================================
    // RENDERIZADO DE SECCIONES
    // ============================================================
    function renderSection(id) {
        const tpl = document.getElementById('tpl-' + id);
        if (!tpl) {
            els.content.innerHTML = `<p class="text-zinc-500">Sección "${escapeHtml(id)}" no encontrada.</p>`;
            return;
        }
        els.content.replaceChildren(tpl.content.cloneNode(true));
        
        // Inicializadores específicos por sección
        if (id === 'terminal') {
            initTerminal();
        } else if (id === 'reviews') {
            renderReviews();
            initReviewsPanel();
        }
    }

    // ============================================================
    // TERMINAL
    // ============================================================
    function initTerminal() {
        const terminalWindow = document.getElementById('terminal-window');
        const input = document.getElementById('terminal-input');
        const visibleInput = document.getElementById('visible-input');
        const history = document.getElementById('terminal-history');

        if (!input || !visibleInput) return;

        function renderInput() {
            const val = input.value;
            const pos = input.selectionStart !== null ? input.selectionStart : val.length;
            const before = escapeHtml(val.slice(0, pos));
            const after = escapeHtml(val.slice(pos));
            const isFocused = document.activeElement === input;
            const cursorClass = isFocused ? 'cursor-blink term-prompt' : 'bg-zinc-600';
            visibleInput.innerHTML = before + `<span class="inline-block w-2.5 h-[1.1rem] translate-y-[3px] ml-[1px] ${cursorClass}"></span>` + after;
        }

        setTimeout(() => input.focus(), 50);
        terminalWindow.addEventListener('click', () => input.focus());
        input.addEventListener('input', renderInput);
        input.addEventListener('keyup', renderInput);
        input.addEventListener('click', renderInput);
        input.addEventListener('focus', renderInput);
        input.addEventListener('blur', renderInput);

        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                const cmd = input.value.trim().toLowerCase();
                input.value = '';
                renderInput();
                if (!cmd) return;
                history.innerHTML += `<div><span class="term-prompt">guest@grinshark:~$</span> ${escapeHtml(cmd)}</div>`;
                let output = '';
                switch (cmd) {
                    case 'ayuda': case 'help':
                        output = `Comandos: <span class="term-prompt">inicio</span>, <span class="term-prompt">sobremi</span>, <span class="term-prompt">proyectos</span>, <span class="term-prompt">juegos</span>, <span class="term-prompt">contactame</span>, <span class="term-prompt">reviews</span>, <span class="term-prompt">clear</span>`;
                        break;
                    case 'inicio': case 'sobremi': case 'proyectos': case 'juegos': case 'contactame': case 'reviews':
                        window.location.hash = cmd;
                        return;
                    case 'clear':
                        history.innerHTML = '';
                        return;
                    default:
                        output = `<span class="text-red-400">bash: ${escapeHtml(cmd)}: command not found.</span>`;
                }
                if (output) history.innerHTML += `<div class="mb-2">${output}</div>`;
                terminalWindow.scrollTop = terminalWindow.scrollHeight;
            }
        });
    }

    // ============================================================
    // AJUSTES (música, tema, modo video)
    // ============================================================
    function initSettings() {
        function toggleSettingsPanel(forceClose = false) {
            if (!els.settingsPanel) return;
            const isCurrentlyOpen = els.settingsPanel.classList.contains('opacity-100');
            if (isCurrentlyOpen || forceClose) {
                els.settingsPanel.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
                els.settingsPanel.classList.add('opacity-0', '-translate-y-4', 'pointer-events-none');
                if (els.pcSubmenuOverlay) els.pcSubmenuOverlay.classList.remove('opacity-100');
            } else {
                els.settingsPanel.classList.remove('opacity-0', '-translate-y-4', 'pointer-events-none');
                els.settingsPanel.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
                if (els.pcSubmenuOverlay) els.pcSubmenuOverlay.classList.add('opacity-100');
            }
        }

        if(els.btnSettings) {
            els.btnSettings.addEventListener('click', (e) => { e.stopPropagation(); toggleSettingsPanel(); });
        }
        document.addEventListener('click', (e) => {
            if (els.settingsPanel && !els.settingsPanel.contains(e.target) && els.btnSettings && !els.btnSettings.contains(e.target)) toggleSettingsPanel(true);
        });
        if (els.pcSubmenuOverlay) {
            els.pcSubmenuOverlay.addEventListener('click', () => toggleSettingsPanel(true));
        }

        const musicState = localStorage.getItem('portfolio_music') || 'off';
        if (musicState === 'on' && els.bgAudio) els.bgAudio.play().then(() => updateMusicBtn(true)).catch(() => updateMusicBtn(false));

        const musicBtn = document.getElementById('btn-music');
        if(musicBtn) {
            musicBtn.addEventListener('click', () => {
                if (els.bgAudio.paused) {
                    els.bgAudio.play();
                    localStorage.setItem('portfolio_music', 'on');
                    updateMusicBtn(true);
                } else {
                    els.bgAudio.pause();
                    localStorage.setItem('portfolio_music', 'off');
                    updateMusicBtn(false);
                }
            });
        }

        function updateMusicBtn(isPlaying) {
            if(!musicBtn) return;
            musicBtn.textContent = isPlaying ? 'ON' : 'OFF';
            musicBtn.className = isPlaying ? 'px-3 py-1 rounded-md text-xs font-medium bg-brand text-zinc-950 transition' : 'px-3 py-1 rounded-md text-xs font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition';
        }

        const savedTheme = localStorage.getItem('portfolio_theme') || 'theme-green';
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(savedTheme);

        document.querySelectorAll('[data-theme]').forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                document.body.className = document.body.className.replace(/theme-\w+/g, '');
                document.body.classList.add(theme);
                localStorage.setItem('portfolio_theme', theme);
            });
        });

        function checkOrientation() {
            if (!els.rotateAlert) return;
            const isMobile = window.innerWidth < 1024;
            const isPortrait = window.matchMedia("(orientation: portrait)").matches;
            const isVideoMode = document.body.classList.contains('video-only');

            if (isVideoMode && isMobile && isPortrait) {
                els.rotateAlert.classList.add('active');
            } else {
                els.rotateAlert.classList.remove('active');
            }
        }

        function setVideoMode(activate) {
            if (activate) {
                document.body.classList.add('video-only');
                els.btnVideoMode.textContent = 'ON';
                els.btnVideoMode.classList.add('bg-brand', 'text-zinc-950');
                els.btnVideoMode.classList.remove('bg-zinc-800', 'text-zinc-300');
                els.btnExitVideo.classList.remove('hidden');
                toggleSettingsPanel(true);
                checkOrientation();
            } else {
                document.body.classList.remove('video-only');
                els.btnVideoMode.textContent = 'OFF';
                els.btnVideoMode.classList.remove('bg-brand', 'text-zinc-950');
                els.btnVideoMode.classList.add('bg-zinc-800', 'text-zinc-300');
                els.btnExitVideo.classList.add('hidden');
                if(els.rotateAlert) els.rotateAlert.classList.remove('active');
            }
        }

        if(els.btnVideoMode) {
            els.btnVideoMode.addEventListener('click', () => {
                const isCurrentlyActive = document.body.classList.contains('video-only');
                setVideoMode(!isCurrentlyActive);
            });
        }
        if(els.btnExitVideo) {
            els.btnExitVideo.addEventListener('click', () => setVideoMode(false));
        }

        window.addEventListener('resize', checkOrientation);
        window.addEventListener('orientationchange', checkOrientation);
    }

    function initVideo() {
        const video = document.getElementById('bg-video');
        if (!video) return;
        
        video.muted = true;
        video.defaultMuted = true;
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');

        const playPromise = video.play();

        if (playPromise !== undefined) {
            playPromise.catch(() => {
                const forcePlay = () => {
                    video.play();
                    document.removeEventListener('click', forcePlay);
                    document.removeEventListener('touchstart', forcePlay);
                    document.removeEventListener('scroll', forcePlay);
                };
                document.addEventListener('click', forcePlay);
                document.addEventListener('touchstart', forcePlay);
                document.addEventListener('scroll', forcePlay);
            });
        }
    }

    function getCurrentHash() {
        const raw = window.location.hash.replace('#', '').trim();
        return isKnownSection(raw) ? raw : DEFAULT_SECTION;
    }

    function handleRouteChange() {
        renderSection(getCurrentHash());
    }

    function init() {
        initVideo();
        initNavigation(); 
        initPcMenuFade();
        initSettings();
        
        if (!isKnownSection(window.location.hash.replace('#', ''))) {
            history.replaceState(null, '', '#' + DEFAULT_SECTION);
        }
        
        renderSection(getCurrentHash());
        window.addEventListener('hashchange', handleRouteChange);
        
        if(els.year) els.year.textContent = String(new Date().getFullYear());
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();