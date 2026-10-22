document.addEventListener('DOMContentLoaded', () => {
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
            .replace(/>/g, '&gt;');

        // Enlaces [texto](url)
        escaped = escaped.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #1D63ED; font-weight: 600; text-decoration: underline;">$1</a>');

        // Negrita **texto**
        escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Procesar listas por viñetas
        const lines = escaped.split('\n');
        let html = '';
        let inList = false;

        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                if (!inList) {
                    html += '<ul>';
                    inList = true;
                }
                html += `<li>${trimmed.substring(2)}</li>`;
            } else {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                if (trimmed.length > 0) {
                    html += `<p>${trimmed}</p>`;
                }
            }
        });

        if (inList) {
            html += '</ul>';
        }

        return html || `<p>${escaped}</p>`;
    }

    // Alternar visibilidad del chat
    function toggleChat() {
        const isHidden = chatContainer.classList.contains('hidden');
        if (isHidden) {
            chatContainer.classList.remove('hidden');
            setTimeout(() => chatInput.focus(), 150);
        } else {
            chatContainer.classList.add('hidden');
        }
    }

    toggleBtn.addEventListener('click', toggleChat);

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            chatContainer.classList.add('hidden');
        });
    }

    // Reiniciar conversación
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            chatMessages.innerHTML = initialWelcomeHTML;
            rebindSuggestionChips();
            chatInput.value = '';
            chatInput.focus();
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
                body: JSON.stringify({ message: text })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            if (data.reply) {
                appendBotMessage(data.reply);
            } else {
                appendBotMessage('No recibí una respuesta adecuada. Si deseas atención directa, escríbenos al WhatsApp: +503 7654-3210.');
            }
        } catch (error) {
            console.error('Error con TechFix IA:', error);
            appendBotMessage('Hubo un pequeño corte de conexión con el asistente. Puedes comunicarte directamente al WhatsApp **+503 7654-3210**.');
        } finally {
            chatInput.disabled = false;
            sendBtn.disabled = false;
            chatInput.focus();
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
});
