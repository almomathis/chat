// Initialize socket connection
const socket = io();
let username = '';

// Emoji data
const emojiData = {
    'smileys': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
    'gestures': ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '✋', '🤚', '🖐️', '✋', '👊', '🤛', '🤜'],
    'hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝'],
    'animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐔', '🐐', '🐒', '🦎', '🦖', '🐊', '🦦', '🦭', '🐬', '🕊️'],
    'food': ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝']
};

let currentEmojiCategory = 'smileys';
let isTyping = false;
let typingTimeout;
let typingUsers = new Set();

// DOM Elements
const loginForm = document.getElementById('login-form');
const chatContainer = document.getElementById('chat-container');
const messagesContainer = document.getElementById('messages-container');
const messages = document.getElementById('messages');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('m');
const fileInput = document.getElementById('file-input');
const uploadBtn = document.getElementById('upload-btn');
const emojiBtn = document.getElementById('emoji-btn');

// Create loading overlay
const loadingOverlay = document.createElement('div');
loadingOverlay.className = 'loading-overlay';
loadingOverlay.innerHTML = '<div class="loading-spinner"></div>';
loadingOverlay.style.display = 'none';
document.body.appendChild(loadingOverlay);

// Add fade out keyframes
const fadeOutKeyframes = document.createElement('style');
fadeOutKeyframes.textContent = `
@keyframes fadeOut {
    from { 
        opacity: 1;
        transform: translateY(0);
    }
    to { 
        opacity: 0;
        transform: translateY(10px);
    }
}`;
document.head.appendChild(fadeOutKeyframes);


// Error message handling
function showError(title, description = '', type = 'error') {
    const errorDiv = document.createElement('div');
    errorDiv.className = `error-message ${type}`;
    
    errorDiv.innerHTML = `
        <svg class="error-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            ${type === 'warning' 
                ? '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'
                : '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'}
        </svg>
        <div class="error-content">
            <div class="error-title">${title}</div>
            ${description ? `<div class="error-description">${description}</div>` : ''}
        </div>
        <button class="error-close" aria-label="Close error">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>
    `;

    const messagesContainer = document.getElementById('messages-container');
    messagesContainer.insertBefore(errorDiv, messagesContainer.firstChild);

    const closeBtn = errorDiv.querySelector('.error-close');
    closeBtn.addEventListener('click', () => {
        errorDiv.classList.add('error-fade-out');
        errorDiv.addEventListener('animationend', () => {
            errorDiv.remove();
        });
    });

    setTimeout(() => {
        if (errorDiv.parentElement) {
            errorDiv.classList.add('error-fade-out');
            errorDiv.addEventListener('animationend', () => {
                errorDiv.remove();
            });
        }
    }, 5000);
}

// Theme handling
const theme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', theme);

const chatHeader = document.getElementById('chat-header');
const themeToggle = document.createElement('button');
themeToggle.className = 'theme-toggle';
themeToggle.setAttribute('aria-label', 'Toggle theme');
themeToggle.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
      d="${theme === 'dark' 
        ? 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
        : 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
      }"
    />
  </svg>
`;

chatHeader.appendChild(themeToggle);

themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  themeToggle.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
        d="${newTheme === 'dark' 
          ? 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
          : 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
        }"
      />
    </svg>
  `;
});

// login function{
function login(e) {
    e?.preventDefault();
        
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    username = usernameInput.value;
    const password = passwordInput.value;
    
    if (!username || !password) {
        showError(
            'Invalid Input',
            'Please fill in both username and password fields'
        );
        return;
    
    }
    loadingOverlay.style.display = 'flex';

    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        setTimeout(() => {
            if (data.success) {
                loginForm.style.opacity = '0';
                setTimeout(() => {
                    loginForm.style.display = 'none';
                    chatContainer.style.display = 'flex';
                    socket.emit('join', username);
                    showNotification('Successfully logged in!', 'success');
                }, 300);
            } else {
                showNotification(data.message || 'Login failed', 'error');
            }
            loadingOverlay.style.display = 'none';
        }, 800);
    })
    .catch(error => {
        loadingOverlay.style.display = 'none';
        showNotification('Connection error. Please try again.', 'error');
    });
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease-out';
        notification.addEventListener('animationend', () => notification.remove());
    }, 3000);
}

// Emoji picker creation and handling
function createEmojiPicker() {
    const emojiPicker = document.createElement('div');
    emojiPicker.className = 'emoji-picker';
    
    const categories = document.createElement('div');
    categories.className = 'emoji-categories';
    
    Object.keys(emojiData).forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.textContent = emojiData[category][0];
        btn.onclick = () => showEmojiCategory(category);
        categories.appendChild(btn);
    });
    
    const emojiGrid = document.createElement('div');
    emojiGrid.className = 'emoji-grid';
    
    emojiPicker.appendChild(categories);
    emojiPicker.appendChild(emojiGrid);
    
    document.body.appendChild(emojiPicker);
    return emojiPicker;
}

function showEmojiCategory(category) {
    currentEmojiCategory = category;
    const emojiGrid = document.querySelector('.emoji-grid');
    emojiGrid.innerHTML = '';
    
    emojiData[category].forEach(emoji => {
        const emojiSpan = createEmojiElement(emoji);
        emojiGrid.appendChild(emojiSpan);
    });
}

function createEmojiElement(emoji) {
    const emojiSpan = document.createElement('div');
    emojiSpan.className = 'emoji-item';
    emojiSpan.textContent = emoji;
    emojiSpan.onclick = () => addEmojiToInput(emoji);
    return emojiSpan;
}

function addEmojiToInput(emoji) {
    const cursorPos = messageInput.selectionStart;
    const textBefore = messageInput.value.substring(0, cursorPos);
    const textAfter = messageInput.value.substring(cursorPos);
    
    messageInput.value = textBefore + emoji + textAfter;
    messageInput.focus();
    messageInput.selectionStart = cursorPos + emoji.length;
    messageInput.selectionEnd = cursorPos + emoji.length;
}

// Message handling
function sendMessage(text, fileType = '', fileData = '') {
    const messageData = { 
        text, 
        fileType, 
        fileData, 
        username,
        timestamp: new Date()
    };
    
    socket.emit('chat message', messageData);
    addMessage(messageData, true);
    
    messageInput.value = '';
    socket.emit('stop typing');
    isTyping = false;
}

function addMessage(msg, isSelf = false) {
    const li = document.createElement('li');
    if (isSelf) li.classList.add('self');

    // Username
    const usernameSpan = document.createElement('span');
    usernameSpan.className = 'username';
    usernameSpan.textContent = msg.username;
    li.appendChild(usernameSpan);

    // Message content
    if (msg.fileType?.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = msg.fileData;
        img.className = 'message-image';
        img.onload = () => {
            li.style.animation = 'slideIn 0.3s ease-out';
            scrollToBottom();
        };
        li.appendChild(img);
    } else if (msg.fileType?.startsWith('audio/')) {
        const audio = document.createElement('audio');
        audio.src = msg.fileData;
        audio.controls = true;
        audio.className = 'message-audio';
        li.appendChild(audio);
    } else {
        const textSpan = document.createElement('span');
        textSpan.className = 'message-text';
        textSpan.textContent = msg.text;
        li.appendChild(textSpan);
    }

    // Timestamp
    const timestampSpan = document.createElement('span');
    timestampSpan.className = 'timestamp';
    timestampSpan.textContent = new Date(msg.timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    li.appendChild(timestampSpan);

    messages.appendChild(li);
    scrollToBottom();
}

// Typing indicator
function showTypingIndicator(user) {
    if (user === username) return;

    typingUsers.add(user);
    const typingIndicator = document.getElementById('typing-indicator');
    const typingText = typingIndicator.querySelector('.typing-indicator-text');

    if (typingUsers.size === 1) {
        typingText.textContent = `${Array.from(typingUsers)[0]} is typing`;
    } else if (typingUsers.size === 2) {
        typingText.textContent = `${Array.from(typingUsers).join(' and ')} are typing`;
    } else {
        typingText.textContent = 'Several people are typing';
    }

    typingIndicator.style.display = 'flex';
    scrollToBottom();
}

function hideTypingIndicator(user) {
    typingUsers.delete(user);
    const typingIndicator = document.getElementById('typing-indicator');

    if (typingUsers.size === 0) {
        typingIndicator.style.display = 'none';
    } else {
        const typingText = typingIndicator.querySelector('.typing-indicator-text');
        if (typingUsers.size === 1) {
            typingText.textContent = `${Array.from(typingUsers)[0]} is typing`;
        } else if (typingUsers.size === 2) {
            typingText.textContent = `${Array.from(typingUsers).join(' and ')} are typing`;
        } else {
            typingText.textContent = 'Several people are typing';
        }
    }
}

// typing handler
function handleTyping() {
    if (!isTyping) {
        isTyping = true;
        socket.emit('typing', username);
    }

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        isTyping = false;
        socket.emit('stop typing', username);
    }, 2000);
}

socket.on('typing', (user) => {
    if (user !== username) {
        showTypingIndicator(user);
    }
});

socket.on('stop typing', (user) => {
    hideTypingIndicator(user);
});

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// File handling
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        sendMessage('', file.type, e.target.result);
    };
    reader.readAsDataURL(file);
}

if (loginForm) {
    loginForm.addEventListener('submit', login);
}

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (messageInput.value.trim()) {
        sendMessage(messageInput.value);
    }
});

messageInput.addEventListener('input', handleTyping); 
uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);

// Initialize emoji picker
const emojiPicker = createEmojiPicker();
emojiBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    emojiPicker.classList.toggle('active');
    if (emojiPicker.classList.contains('active')) {
        showEmojiCategory(currentEmojiCategory);
    }
});

document.addEventListener('click', (e) => {
    if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) {
        emojiPicker.classList.remove('active');
    }
});

socket.on('chat history', (history) => {
    history.forEach(msg => addMessage(msg));
});

socket.on('chat message', (msg) => {
    addMessage(msg);
    if (msg.username !== username) {
        playNotificationSound();
    }
});

socket.on('user joined', (user) => {
    const li = document.createElement('li');
    li.textContent = `${user} has joined the chat`;
    li.className = 'system-message';
    messages.appendChild(li);
    showNotification(`${user} joined the chat`, 'info');
});

socket.on('user left', (user) => {
    const li = document.createElement('li');
    li.textContent = `${user} has left the chat`;
    li.className = 'system-message';
    messages.appendChild(li);
    showNotification(`${user} left the chat`, 'info');
    hideTypingIndicator(user);
});

// Utility functions
function playNotificationSound() {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(e => console.log('Audio playback failed:', e));
}

// Handle page visibility for online/offline status
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        socket.emit('away');
    } else {
        socket.emit('active');
    }
});

// Handle window resize for mobile responsiveness
window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
        emojiPicker.classList.remove('active');
    }
});

// Initialize tooltips
document.querySelectorAll('[data-tooltip]').forEach(element => {
    element.addEventListener('mouseenter', (e) => {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = e.target.dataset.tooltip;
        document.body.appendChild(tooltip);
        
        const rect = e.target.getBoundingClientRect();
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
        tooltip.style.left = `${rect.left + (rect.width - tooltip.offsetWidth) / 2}px`;
        
        element.addEventListener('mouseleave', () => tooltip.remove(), { once: true });
    });
});

// Socket error handling
socket.on('error', (error) => {
    showError(
        'Connection Error',
        error.message || 'An unexpected error occurred',
        error.type || 'error'
    );
});