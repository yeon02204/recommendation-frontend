// ===== 전역 변수 =====
const API_URL = 'http://localhost:8080/api/recommend/home';

const messagesContainer = document.getElementById('messagesContainer');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const cardsDeckContainer = document.getElementById('cardsDeckContainer');
const cardsNavigation = document.getElementById('cardsNavigation');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const cardIndicators = document.getElementById('cardIndicators');
const cardCount = document.getElementById('cardCount');

let currentProducts = [];
let currentCardIndex = 0;

// ===== 봇 아바타 =====
const BOT_AVATAR_NORMAL = './dog-normal.png';
const BOT_AVATAR_LOADING = './dog-loading.png';
const BOT_AVATAR_SUCCESS = './dog-success.png';

const BOT_MESSAGES = [
    '이런 상품들 찾아봤어!',
    '마음에 드는 게 있으면 좋겠다',
    '이 중에서 골라봐',
    '비슷한 것들 모아봤어',
    '어떤 게 제일 좋아 보여?'
];

// ===== 초기화 =====
sendButton.addEventListener('click', handleSendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSendMessage();
});

prevButton.addEventListener('click', showPreviousCard);
nextButton.addEventListener('click', showNextCard);

// ===== 메시지 전송 =====
function handleSendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addUserMessage(message);
    userInput.value = '';

    showLoadingMessage();
    fetchRecommendations(message);
}

// ===== API 호출 =====
async function fetchRecommendations(userInputText) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userInput: userInputText })
        });

        const data = await response.json();

        const loadingMessage = document.getElementById('loading-message');
        if (loadingMessage) loadingMessage.remove();

        handleServerResponse(data);

    } catch (error) {
        console.error(error);
        showErrorMessage();
    }
}

// ===== 서버 응답 처리 =====
function handleServerResponse({ type, message, items }) {
    if (type === 'REQUERY' || type === 'INVALID') {
        addBotMessage(message, BOT_AVATAR_NORMAL);
        clearCards();
        return;
    }

    if (type === 'RECOMMEND') {
        addBotMessage(
            message || randomBotMessage(),
            BOT_AVATAR_SUCCESS
        );

        // 🔥 백엔드 Item 구조에 맞게 매핑
        const products = (items || []).map(item => ({
    id: item.productId,
    name: item.title,
    price: item.price ? `${item.price.toLocaleString()}원` : '',
    image: item.imageUrl,
    mall: item.mallName,
    link: item.link,
    reason: item.explanation || '추천 이유를 생성 중이에요.'
}));


        showRecommendations(products);
    }
}

// ===== 메시지 UI =====
function addUserMessage(text) {
    const div = document.createElement('div');
    div.className = 'message user-message';
    div.innerHTML = `<div class="message-bubble">${text}</div>`;
    messagesContainer.appendChild(div);
    scrollToBottom();
}

function addBotMessage(text, avatar = BOT_AVATAR_NORMAL) {
    const div = document.createElement('div');
    div.className = 'message bot-message';
    div.innerHTML = `
        <img src="${avatar}" class="bot-avatar">
        <div class="message-bubble">${text}</div>
    `;
    messagesContainer.appendChild(div);
    scrollToBottom();
}

function showLoadingMessage() {
    const div = document.createElement('div');
    div.className = 'message bot-message';
    div.id = 'loading-message';
    div.innerHTML = `
        <img src="${BOT_AVATAR_LOADING}" class="bot-avatar">
        <div class="message-bubble loading-dots">
            <span></span><span></span><span></span>
        </div>
    `;
    messagesContainer.appendChild(div);
    scrollToBottom();
}

function showErrorMessage() {
    addBotMessage(
        '앗, 지금은 상품을 찾기 어려워... 다시 시도해줄래?',
        BOT_AVATAR_NORMAL
    );
}

function randomBotMessage() {
    return BOT_MESSAGES[Math.floor(Math.random() * BOT_MESSAGES.length)];
}

// ===== 카드 처리 =====
function showRecommendations(products) {
    currentProducts = products;
    currentCardIndex = 0;
    displayCardDeck();
    updateCardCount();
}

function clearCards() {
    currentProducts = [];
    currentCardIndex = 0;
    cardsDeckContainer.innerHTML =
        '<div class="no-cards-message">조건을 더 알려주면 추천해줄게!</div>';
    cardsNavigation.style.display = 'none';
    cardCount.textContent = '';
}

function displayCardDeck() {
    cardsDeckContainer.innerHTML = '';

    if (currentProducts.length === 0) {
        clearCards();
        return;
    }

    const deck = document.createElement('div');
    deck.className = 'card-deck';

    currentProducts.forEach((product, index) => {
        deck.appendChild(createProductCard(product, index));
    });

    cardsDeckContainer.appendChild(deck);
    cardsNavigation.style.display = 'flex';

    updateCardPositions();
    updateIndicators();
    updateNavigationButtons();
}

function createProductCard(product, index) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.index = index;

    card.innerHTML = `
        <div class="card-content">
            <img src="${product.image}" class="card-image">
            <div class="card-info">
                <div class="card-title">${product.name}</div>
                <div class="card-price">${product.price}</div>
                <div class="card-mall">${product.mall}</div>
            </div>
            <div class="card-reason">
                <div class="reason-label">추천 이유</div>
                <div class="reason-text">${product.reason}</div>
            </div>
        </div>
    `;

    card.addEventListener('click', () => {
        if (index === currentCardIndex) {
            window.open(product.link, '_blank');
        }
    });

    return card;
}

// ===== 카드 네비 =====
function updateCardPositions() {
    document.querySelectorAll('.product-card').forEach(card => {
        const idx = Number(card.dataset.index);
        const diff = idx - currentCardIndex;

        card.className = 'product-card';

        if (diff === 0) card.classList.add('active');
        else if (diff === 1) card.classList.add('stacked', 'stacked-1');
        else if (diff === 2) card.classList.add('stacked', 'stacked-2');
        else if (diff >= 3) card.classList.add('stacked', 'stacked-3');
        else if (diff === -1) card.classList.add('prev-1');
        else if (diff <= -2) card.classList.add('prev-2');
    });
}

function showPreviousCard() {
    if (currentCardIndex > 0) {
        currentCardIndex--;
        updateAll();
    }
}

function showNextCard() {
    if (currentCardIndex < currentProducts.length - 1) {
        currentCardIndex++;
        updateAll();
    }
}

function updateAll() {
    updateCardPositions();
    updateIndicators();
    updateNavigationButtons();
    updateCardCount();
}

function updateIndicators() {
    cardIndicators.innerHTML = '';
    currentProducts.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'indicator';
        if (i === currentCardIndex) dot.classList.add('active');
        cardIndicators.appendChild(dot);
    });
}

function updateNavigationButtons() {
    prevButton.disabled = currentCardIndex === 0;
    nextButton.disabled = currentCardIndex === currentProducts.length - 1;
}

function updateCardCount() {
    cardCount.textContent =
        currentProducts.length > 0
            ? `(${currentCardIndex + 1}/${currentProducts.length})`
            : '';
}

// ===== 스크롤 =====
function scrollToBottom() {
    setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 50);
}
