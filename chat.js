document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // MENÚ HAMBURGUESA MÓVIL
    // ==========================================
    const menuBtn = document.getElementById('menu-hamburguesa');
    const navMenu = document.getElementById('navegacion-menu');

    if (menuBtn && navMenu) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navMenu.classList.toggle('abierto');
            menuBtn.classList.toggle('activo');
            menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        // Cerrar menú al hacer clic en cualquier enlace
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('abierto');
                menuBtn.classList.remove('activo');
                menuBtn.setAttribute('aria-expanded', 'false');
            });
        });

        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!menuBtn.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('abierto');
                menuBtn.classList.remove('activo');
                menuBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // ==========================================
    // WIDGET ASISTENTE IA TECHFIX
    // ==========================================
    const toggleBtn = document.getElementById('chat-toggle-btn');
    const chatContainer = document.getElementById('chat-container');
    const closeBtn = document.getElementById('chat-close-btn');
    const resetBtn = document.getElementById('chat-reset-btn');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const sendBtn = document.getElementById('chat-send-btn');
    const suggestionChips = document.querySelectorAll('.chat-chip');

    if (!toggleBtn || !chatContainer || !chatForm) return;

    // Obtener o generar identificador de sesión único para el visitante
    let sessionId = localStorage.getItem('techfix_session_id');
    if (!sessionId) {
        sessionId = 'user_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
        localStorage.setItem('techfix_session_id', sessionId);
    }

    const initialWelcomeHTML = `
        <div class="chat-msg bot">
            <p><strong>¡Hola! Soy TechFix IA</strong>, tu asistente virtual a domicilio.</p>
            <p>¿En qué te puedo ayudar hoy? Puedes preguntarme sobre nuestros mantenimientos, promociones o cómo agendar una visita técnica.</p>
        </div>
        <div class="chat-suggestions" id="chat-suggestions">
            <button type="button" class="chat-chip" data-query="¿Cuáles son los tipos de mantenimiento y qué incluyen?">Mantenimientos</button>
            <button type="button" class="chat-chip" data-query="¿Qué ofertas o promociones tienen vigentes?">Ofertas y Descuentos</button>
            <button type="button" class="chat-chip" data-query="¿En qué zonas atienden a domicilio?">Cobertura a Domicilio</button>
            <button type="button" class="chat-chip" data-query="¿Cómo puedo pedir un técnico por WhatsApp?">Pedir Técnico</button>
        </div>
    `;

    // Formatear texto simple (negrita, listas, saltos de línea y enlaces)
    function formatMarkdown(text) {
        if (!text) return '';
        let escaped = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        const wspIcon = '<svg viewBox="0 0 24 24"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.33C9.33 7.33 9.03 7.41 8.78 7.68C8.54 7.94 7.86 8.58 7.86 9.87C7.86 11.16 8.8 12.41 8.93 12.59C9.07 12.77 10.74 15.34 13.3 16.44C13.91 16.7 14.39 16.86 14.76 16.98C15.37 17.17 15.93 17.15 16.37 17.08C16.87 17.01 17.88 16.47 18.09 15.88C18.3 15.29 18.3 14.79 18.23 14.68C18.17 14.58 18.02 14.52 17.75 14.39C17.48 14.26 16.17 13.61 15.93 13.52C15.68 13.44 15.5 13.39 15.32 13.66C15.14 13.93 14.63 14.52 14.47 14.71C14.32 14.89 14.17 14.92 13.9 14.79C13.63 14.65 12.78 14.38 11.76 13.47C10.97 12.76 10.43 11.89 10.28 11.63C10.13 11.36 10.26 11.22 10.4 11.08C10.52 10.96 10.67 10.77 10.81 10.61C10.95 10.44 11 10.32 11.09 10.13C11.18 9.95 11.14 9.79 11.07 9.66C11 9.53 10.49 8.27 10.28 7.76C10.08 7.27 9.87 7.33 9.71 7.33H9.53Z"/></svg>';

        function renderLink(match, label, url) {
            if (url.includes('wa.me')) {
                return '<a href="' + url + '" target="_blank" rel="noopener noreferrer" class="chat-btn-wsp">' + wspIcon + '<span>' + label + '</span></a>';
            }
            return '<a href="' + url + '" target="_blank" rel="noopener noreferrer" style="color: #1D63ED; font-weight: 600; text-decoration: underline;">' + label + '</a>';
        }

        // Procesar listas por viñetas y párrafos
        const lines = escaped.split('\n');
        let html = '';
        let inList = false;

        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                return;
            }

            if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                if (!inList) {
                    html += '<ul>';
                    inList = true;
                }
                const parsed = trimmed.substring(2).replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, renderLink);
                html += '<li>' + parsed + '</li>';
            } else {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                const parsed = trimmed.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, renderLink);
                html += '<p>' + parsed + '</p>';
            }
        });

        if (inList) {
            html += '</ul>';
        }

        return html || '<p>' + escaped + '</p>';
    }

    // Backdrop oscuro para dispositivos móviles
    let backdrop = document.getElementById('chat-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'chat-backdrop';
        backdrop.className = 'chat-backdrop hidden';
        document.body.appendChild(backdrop);
        backdrop.addEventListener('click', closeChat);
    }

    function isMobileDevice() {
        return window.innerWidth <= 768 || ('ontouchstart' in window);
    }

    function openChat() {
        chatContainer.classList.remove('hidden');
        backdrop.classList.remove('hidden');
        document.body.classList.add('chat-modal-abierto');

        if (!isMobileDevice()) {
            setTimeout(() => chatInput.focus(), 150);
        } else {
            scrollChatToBottom();
        }
    }

    function closeChat() {
        chatContainer.classList.add('hidden');
        backdrop.classList.add('hidden');
        document.body.classList.remove('chat-modal-abierto');
        if (document.activeElement === chatInput) {
            chatInput.blur();
        }
    }

    function toggleChat(e) {
        if (e) e.stopPropagation();
        if (chatContainer.classList.contains('hidden')) {
            openChat();
        } else {
            closeChat();
        }
    }

    toggleBtn.addEventListener('click', toggleChat);

    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeChat();
        });
    }

    // Cerrar al hacer clic fuera del widget
    document.addEventListener('click', (e) => {
        if (!chatContainer.classList.contains('hidden')) {
            if (!chatContainer.contains(e.target) && !toggleBtn.contains(e.target)) {
                closeChat();
            }
        }
    });

    // Cerrar con tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !chatContainer.classList.contains('hidden')) {
            closeChat();
        }
    });

    // En móviles, al tocar o deslizar la lista de mensajes, ocultar el teclado
    chatMessages.addEventListener('touchstart', () => {
        if (document.activeElement === chatInput) {
            chatInput.blur();
        }
    }, { passive: true });

    chatMessages.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
            if (document.activeElement === chatInput) {
                chatInput.blur();
            }
        }
    });

    // Reiniciar conversación
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            chatMessages.innerHTML = initialWelcomeHTML;
            rebindSuggestionChips();
            chatInput.value = '';
            if (!isMobileDevice()) {
                chatInput.focus();
            }
        });
    }

    // Imprimir mensaje del usuario
    function appendUserMessage(text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-msg user';
        msgDiv.textContent = text;
        chatMessages.appendChild(msgDiv);
        scrollChatToBottom();
    }

    // Mostrar indicador de "escribiendo..."
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-typing';
        typingDiv.id = 'chat-typing-indicator';
        typingDiv.innerHTML = '<span></span><span></span><span></span>';
        chatMessages.appendChild(typingDiv);
        scrollChatToBottom();
        return typingDiv;
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('chat-typing-indicator');
        if (indicator) indicator.remove();
    }

    function appendBotMessage(text) {
        removeTypingIndicator();
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-msg bot';
        msgDiv.innerHTML = formatMarkdown(text);
        chatMessages.appendChild(msgDiv);
        scrollChatToBottom();
    }

    function scrollChatToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Enviar consulta a la API
    async function sendMessage(queryText) {
        const text = (queryText || chatInput.value).trim();
        if (!text) return;

        // Ocultar sugerencias una vez empieza a escribir
        const suggestions = document.getElementById('chat-suggestions');
        if (suggestions) {
            suggestions.style.display = 'none';
        }

        appendUserMessage(text);
        chatInput.value = '';
        chatInput.disabled = true;
        sendBtn.disabled = true;

        showTypingIndicator();

        try {
            const response = await fetch('https://api.techfixsolutions.online/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: text, sessionId: sessionId })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            if (data.reply) {
                appendBotMessage(data.reply);
            } else {
                appendBotMessage('No recibí una respuesta adecuada. Si deseas atención directa, escríbenos al WhatsApp: +503 7103-3085.');
            }
        } catch (error) {
            console.error('Error con TechFix IA:', error);
            appendBotMessage('Hubo un pequeño corte de conexión con el asistente. Puedes comunicarte directamente al WhatsApp **+503 7103-3085**.');
        } finally {
            chatInput.disabled = false;
            sendBtn.disabled = false;
            if (!isMobileDevice()) {
                chatInput.focus();
            }
            scrollChatToBottom();
        }
    }

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendMessage();
    });

    // Delegación para botones de sugerencias
    function rebindSuggestionChips() {
        const chips = chatMessages.querySelectorAll('.chat-chip');
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                const query = chip.getAttribute('data-query');
                if (query) sendMessage(query);
            });
        });
    }

    rebindSuggestionChips();

    // ==========================================
    // ACORDEÓN DE PREGUNTAS FRECUENTES (FAQ)
    // ==========================================
    const faqPreguntas = document.querySelectorAll('.faq-pregunta');
    faqPreguntas.forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            if (!item) return;
            const isOpen = item.classList.contains('activo');

            // Cerrar otros para mantener limpio el acordeón
            document.querySelectorAll('.faq-item.activo').forEach(openItem => {
                if (openItem !== item) {
                    openItem.classList.remove('activo');
                    const otherBtn = openItem.querySelector('.faq-pregunta');
                    if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                }
            });

            item.classList.toggle('activo', !isOpen);
            btn.setAttribute('aria-expanded', (!isOpen).toString());
        });
    });
});
