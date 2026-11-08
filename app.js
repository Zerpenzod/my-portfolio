/**
 * Portfolio — Vanilla JS Refactorizado
 */
(function () {
    'use strict';

    // ============================================================
    // CONFIGURACIÓN Y RUTAS
    // ============================================================
    const SECTIONS = [
        { id: 'inicio',      label: 'Inicio' },
        { id: 'sobremi',     label: 'Sobre mí' },
        { id: 'proyectos',   label: 'Proyectos' },
        { id: 'contactame',  label: 'Contáctame' },
        { id: 'terminal',    label: 'Terminal' },
    ];
    const DEFAULT_SECTION = 'inicio';

    // ============================================================
    // REFERENCIAS AL DOM
    // ============================================================
    const els = {
        content:       document.getElementById('content'),
        year:          document.getElementById('year'),
        
        // Reseñas
        reviews:       document.getElementById('reviews-list'),
        sidebar:       document.getElementById('reviews-sidebar'),
        btnToggle:     document.getElementById('btn-toggle-reviews'),
        formContainer: document.getElementById('review-form-container'),
        iconExpand:    document.getElementById('icon-expand'),
        form:          document.getElementById('review-form'),
        inputName:     document.getElementById('review-name'),
        inputText:     document.getElementById('review-text'),

        // Configuración y Modo Video
        btnSettings:   document.getElementById('btn-settings'),
        settingsPanel: document.getElementById('settings-panel'),
        bgAudio:       document.getElementById('bg-audio'),
        btnVideoMode:  document.getElementById('btn-video-mode'),
        btnExitVideo:  document.getElementById('btn-exit-video-mode'),

        // Menús y Navegación
        menuOverlay:   document.getElementById('menu-overlay'),
        btnMobileMenu: document.getElementById('btn-mobile-menu'),
        mobileMenu:    document.getElementById('mobile-menu'),
        mobileAccordions: document.querySelectorAll('.mobile-accordion'),
        mobileLinks:      document.querySelectorAll('.mobile-link'),

        // Buscador
        btnSearch:     document.getElementById('search-btn'),
        searchBar:     document.getElementById('search-bar'),
        searchForm:    document.getElementById('search-form'),
        searchInput:   document.getElementById('search-input'),
        btnCloseSearch:document.getElementById('btn-close-search')
    };

    // ============================================================
    // UTILIDADES
    // ============================================================
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
        // 1. Lógica para el Menú Móvil (El de PC ahora es CSS puro con group-hover)
        function toggleMobileMenu() {
            const isOpen = !els.mobileMenu.classList.contains('opacity-0');
            if (isOpen) {
                els.mobileMenu.classList.add('-translate-y-[120%]', 'opacity-0', 'pointer-events-none');
                els.mobileMenu.classList.remove('translate-y-0', 'opacity-100');
                els.menuOverlay.classList.add('opacity-0', 'pointer-events-none');
                els.menuOverlay.classList.remove('opacity-100');
            } else {
                els.mobileMenu.classList.remove('-translate-y-[120%]', 'opacity-0', 'pointer-events-none');
                els.mobileMenu.classList.add('translate-y-0', 'opacity-100');
                els.menuOverlay.classList.remove('opacity-0', 'pointer-events-none');
                els.menuOverlay.classList.add('opacity-100');
            }
        }

        els.btnMobileMenu.addEventListener('click', toggleMobileMenu);

        // Acordeones móviles
        els.mobileAccordions.forEach(acc => {
            const btn = acc.querySelector('.mobile-accordion-btn');
            const content = acc.querySelector('.mobile-accordion-content');
            const icon = btn.querySelector('svg');

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
                if (!els.mobileMenu.classList.contains('opacity-0')) toggleMobileMenu();
            });
        });

        els.menuOverlay.addEventListener('click', () => {
            if (!els.mobileMenu.classList.contains('opacity-0')) toggleMobileMenu();
            if (!els.searchBar.classList.contains('-translate-y-full')) toggleSearchBar();
        });

        // 2. Lógica de la Barra de Búsqueda
        function toggleSearchBar() {
            const isOpen = !els.searchBar.classList.contains('-translate-y-full');
            
            if (isOpen) {
                els.searchBar.classList.add('-translate-y-full', 'opacity-0', 'pointer-events-none');
                els.searchBar.classList.remove('translate-y-0', 'opacity-100');
                els.menuOverlay.classList.add('opacity-0', 'pointer-events-none');
                els.menuOverlay.classList.remove('opacity-100');
            } else {
                els.searchBar.classList.remove('-translate-y-full', 'opacity-0', 'pointer-events-none');
                els.searchBar.classList.add('translate-y-0', 'opacity-100');
                els.menuOverlay.classList.remove('opacity-0', 'pointer-events-none');
                els.menuOverlay.classList.add('opacity-100');
                setTimeout(() => els.searchInput.focus(), 100);
                
                if (!els.mobileMenu.classList.contains('opacity-0')) toggleMobileMenu();
            }
        }

        els.btnSearch.addEventListener('click', toggleSearchBar);
        els.btnCloseSearch.addEventListener('click', toggleSearchBar);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !els.searchBar.classList.contains('-translate-y-full')) {
                toggleSearchBar();
            }
        });

        // 3. Redirección al buscar
        els.searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = els.searchInput.value.trim();
            if (query) {
                // Redirige a search.html con el parámetro de búsqueda
                window.location.href = `search.html?q=${encodeURIComponent(query)}`;
            }
        });
    }

    // ... (El resto de funciones: renderReviews, renderSection, initTerminal, initReviewsPanel, initSettings, initVideo, getCurrentHash, handleRouteChange se mantienen exactamente igual) ...

    async function renderReviews() {
        els.reviews.innerHTML = '<p class="text-xs text-zinc-600 animate-pulse">Cargando reseñas...</p>';
        try {
            const res = await fetch('/api/getReviews');
            if (!res.ok) throw new Error('Error al obtener reseñas');
            const reviews = await res.json();
            if (!reviews || reviews.length === 0) {
                els.reviews.innerHTML = '<p class="text-xs text-zinc-600">No hay reseñas aún. ¡Sé el primero!</p>';
                return;
            }
            els.reviews.innerHTML = reviews.map(r => `
                <article class="rounded-lg border border-zinc-800/50 bg-zinc-900/20 p-3 space-y-2 fade-in">
                    <header class="flex items-center gap-2">
                        <div class="min-w-0">
                            <p class="text-sm text-zinc-300 truncate">${escapeHtml(r.user_name)}</p>
                            <p class="text-[11px] text-zinc-600">${new Date(r.created_at).toLocaleString()}</p>
                        </div>
                    </header>
                    <p class="text-[10px] text-zinc-500 uppercase tracking-wide">Web > Opinión</p>
                    <p class="text-xs text-zinc-400 leading-relaxed">${escapeHtml(r.comment)}</p>
                </article>
            `).join('');
        } catch (error) {
            console.error("Error cargando reseñas:", error);
            els.reviews.innerHTML = '<p class="text-xs text-red-500">Error de conexión con la base de datos.</p>';
        }
    }

    function renderSection(id) {
        const tpl = document.getElementById('tpl-' + id);
        if (!tpl) {
            els.content.innerHTML = `<p class="text-zinc-500">Sección "${escapeHtml(id)}" no encontrada.</p>`;
            return;
        }
        els.content.replaceChildren(tpl.content.cloneNode(true));
        if (id === 'terminal') initTerminal();
    }

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
                        output = `Comandos: <span class="term-prompt">inicio</span>, <span class="term-prompt">sobremi</span>, <span class="term-prompt">proyectos</span>, <span class="term-prompt">contactame</span>, <span class="term-prompt">clear</span>`;
                        break;
                    case 'inicio': case 'sobremi': case 'proyectos': case 'contactame':
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

    function initReviewsPanel() {
        let isExpanded = false;
        els.btnToggle.addEventListener('click', () => {
            isExpanded = !isExpanded;
            if (isExpanded) {
                if (window.innerWidth >= 1024) els.sidebar.classList.replace('lg:w-[320px]', 'lg:w-[450px]');
                els.formContainer.classList.remove('hidden');
                els.formContainer.classList.add('fade-in');
                els.iconExpand.classList.add('rotate-90', 'text-brand');
            } else {
                els.sidebar.classList.replace('lg:w-[450px]', 'lg:w-[320px]');
                els.formContainer.classList.add('hidden');
                els.iconExpand.classList.remove('rotate-90', 'text-brand');
            }
        });

        els.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newReview = { user_name: els.inputName.value.trim(), comment: els.inputText.value.trim() };
            const submitBtn = els.form.querySelector('button[type="submit"]');
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
                    els.form.reset();
                } else {
                    const errorData = await res.json();
                    alert(`Error: ${errorData.error || 'No se pudo guardar la reseña'}`);
                }
            } catch (error) {
                console.error("Error al enviar:", error);
                alert("No se pudo conectar con el servidor.");
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    function initSettings() {
        function toggleSettingsPanel(forceClose = false) {
            const isCurrentlyOpen = els.settingsPanel.classList.contains('opacity-100');
            if (isCurrentlyOpen || forceClose) {
                els.settingsPanel.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
                els.settingsPanel.classList.add('opacity-0', '-translate-y-4', 'pointer-events-none');
            } else {
                els.settingsPanel.classList.remove('opacity-0', '-translate-y-4', 'pointer-events-none');
                els.settingsPanel.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
            }
        }

        els.btnSettings.addEventListener('click', (e) => { e.stopPropagation(); toggleSettingsPanel(); });
        document.addEventListener('click', (e) => {
            if (!els.settingsPanel.contains(e.target) && !els.btnSettings.contains(e.target)) toggleSettingsPanel(true);
        });

        const musicState = localStorage.getItem('portfolio_music') || 'off';
        if (musicState === 'on') els.bgAudio.play().then(() => updateMusicBtn(true)).catch(() => updateMusicBtn(false));

        document.getElementById('btn-music').addEventListener('click', () => {
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

        function updateMusicBtn(isPlaying) {
            const btn = document.getElementById('btn-music');
            btn.textContent = isPlaying ? 'ON' : 'OFF';
            btn.className = isPlaying ? 'px-3 py-1 rounded-md text-xs font-medium bg-brand text-zinc-950 transition' : 'px-3 py-1 rounded-md text-xs font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition';
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

        function setVideoMode(activate) {
            if (activate) {
                document.body.classList.add('video-only');
                els.btnVideoMode.textContent = 'ON';
                els.btnVideoMode.classList.add('bg-brand', 'text-zinc-950');
                els.btnVideoMode.classList.remove('bg-zinc-800', 'text-zinc-300');
                els.btnExitVideo.classList.remove('hidden');
                toggleSettingsPanel(true);
            } else {
                document.body.classList.remove('video-only');
                els.btnVideoMode.textContent = 'OFF';
                els.btnVideoMode.classList.remove('bg-brand', 'text-zinc-950');
                els.btnVideoMode.classList.add('bg-zinc-800', 'text-zinc-300');
                els.btnExitVideo.classList.add('hidden');
            }
        }

        els.btnVideoMode.addEventListener('click', () => {
            const isCurrentlyActive = document.body.classList.contains('video-only');
            setVideoMode(!isCurrentlyActive);
        });
        els.btnExitVideo.addEventListener('click', () => setVideoMode(false));
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
                };
                document.addEventListener('click', forcePlay, { once: true });
                document.addEventListener('touchstart', forcePlay, { once: true });
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
        renderReviews(); 
        initSettings();
        initReviewsPanel();
        
        if (!isKnownSection(window.location.hash.replace('#', ''))) {
            history.replaceState(null, '', '#' + DEFAULT_SECTION);
        }
        renderSection(getCurrentHash());
        window.addEventListener('hashchange', handleRouteChange);
        els.year.textContent = String(new Date().getFullYear());
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();