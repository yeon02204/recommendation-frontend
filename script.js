// ========== 뷰 전환 시스템 ==========
const views = {
    landing: document.getElementById('landingView'),
    app: document.getElementById('appView'),
    info: document.getElementById('infoView'),
    guide: document.getElementById('guideView')
};

let currentView = 'landing';
let previousView = 'landing'; // 이전 뷰 기억

function switchView(viewName, autoQuery = null) {
    // 이전 뷰 저장 (guide로 가는 경우만)
    if (viewName === 'guide') {
        previousView = currentView;
    }
    
    // 현재 뷰 페이드 아웃
    views[currentView].classList.add('fade-out');
    
    setTimeout(() => {
        // 모든 뷰 숨기기
        Object.keys(views).forEach(key => {
            views[key].style.display = 'none';
            views[key].classList.remove('fade-out');
        });
        
        // 새 뷰 보이기
        views[viewName].style.display = 'block';
        currentView = viewName;
        
        // 스크롤 최상단으로
        window.scrollTo(0, 0);
        
        // 챗봇 뷰로 전환 시 자동 쿼리 실행
        if (viewName === 'app' && autoQuery) {
            setTimeout(() => {
                userInput.value = autoQuery;
                handleSendMessage();
            }, 300);
        }
    }, 300);
}

// ========== 다크모드 시스템 ==========
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// localStorage에서 다크모드 설정 불러오기
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// ========== 랜딩 페이지 이벤트 ==========

// 시작하기 버튼
document.getElementById('startButton').addEventListener('click', () => {
    switchView('app');
});

// 예시 버튼들
document.querySelectorAll('.example-button').forEach(button => {
    button.addEventListener('click', () => {
        const query = button.getAttribute('data-query');
        switchView('app', query);
    });
});

// Footer 링크들
document.getElementById('openInfoPage').addEventListener('click', () => {
    switchView('info');
});

document.getElementById('openGuidePage').addEventListener('click', () => {
    switchView('guide');
});

// ========== 챗봇 페이지 이벤트 ==========

// 뒤로가기 버튼
document.getElementById('backToLanding').addEventListener('click', () => {
    switchView('landing');
});

// ? 가이드 버튼 (헤더)
document.getElementById('guideButtonHeader').addEventListener('click', () => {
    switchView('guide');
});

// 메뉴 버튼 & 드롭다운
const menuButton = document.getElementById('menuButton');
const menuDropdown = document.getElementById('menuDropdown');

menuButton.addEventListener('click', (e) => {
    e.stopPropagation();
    menuDropdown.classList.toggle('active');
    console.log('메뉴 버튼 클릭, active 상태:', menuDropdown.classList.contains('active'));
});

// 메뉴 외부 클릭 시 닫기
document.addEventListener('click', () => {
    if (menuDropdown.classList.contains('active')) {
        menuDropdown.classList.remove('active');
        console.log('메뉴 외부 클릭, 메뉴 닫힘');
    }
});

menuDropdown.addEventListener('click', (e) => {
    e.stopPropagation();
});

// 메뉴 아이템들
document.getElementById('menuRefresh').addEventListener('click', () => {
    // 채팅 초기화
    resetChat();
    menuDropdown.classList.remove('active');
});

document.getElementById('menuInfo').addEventListener('click', () => {
    switchView('info');
});

document.getElementById('menuGuide').addEventListener('click', () => {
    switchView('guide');
});

document.getElementById('menuHome').addEventListener('click', () => {
    switchView('landing');
});

// ========== 개발자 정보 페이지 이벤트 ==========

// 뒤로가기
document.getElementById('backFromInfo').addEventListener('click', () => {
    switchView('landing');
});

// GitHub 링크 저장
const githubInput = document.getElementById('githubInput');
const githubButton = document.getElementById('githubButton');
const githubLink = document.getElementById('githubLink');

// localStorage에서 GitHub 링크 불러오기
const savedGithubUrl = localStorage.getItem('githubUrl');
if (savedGithubUrl) {
    githubInput.value = savedGithubUrl;
    githubLink.href = savedGithubUrl;
    githubLink.style.display = 'inline-flex';
}

githubButton.addEventListener('click', () => {
    const url = githubInput.value.trim();
    if (url) {
        localStorage.setItem('githubUrl', url);
        githubLink.href = url;
        githubLink.style.display = 'inline-flex';
        alert('GitHub 링크가 저장되었습니다!');
    }
});

// ========== 사용 가이드 페이지 이벤트 ==========

// 뒤로가기 (이전 페이지로)
document.getElementById('backFromGuide').addEventListener('click', () => {
    switchView(previousView);
});

// ========== 스크롤 애니메이션 ==========
function handleScrollAnimation() {
    const elements = document.querySelectorAll('.fade-in');
    const windowHeight = window.innerHeight;
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        
        if (elementTop < windowHeight - 100) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
}

window.addEventListener('scroll', handleScrollAnimation);
window.addEventListener('load', handleScrollAnimation);

// ========================================================
// ========== 여기서부터 기존 챗봇 로직 (절대 건드리지 않음) ==========
// ========================================================

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

// 🔥 HTML 초기 봇 메시지 제거 여부
let initialBotMessageCleared = false;

// ===== 봇 아바타 =====
const BOT_AVATAR_NORMAL = './dog-normal.png';
const BOT_AVATAR_LOADING = './dog-loading.png';
const BOT_AVATAR_SUCCESS = './dog-success.png';

// ===== 초기화 =====
sendButton.addEventListener('click', handleSendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSendMessage();
});

// 🔥 카드 네비게이션 이벤트 연결 (누락되어 있었음)
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
            body: JSON.stringify({
                userInput: userInputText // 🔥 백엔드 계약 그대로
            })
        });

        const data = await response.json();

        removeLoadingMessage();
        handleServerResponse(data);

    } catch (error) {
        console.error(error);
        removeLoadingMessage();
        showErrorMessage();
    }
}

// ===== 서버 응답 처리 =====
function handleServerResponse(data) {

    // 🔥 첫 서버 응답 시 HTML 기본 메시지 제거
    clearInitialBotMessageIfNeeded();

    const type =
        data.type ??
        data.decisionType;

    const message =
        data.message ??
        data.content ??
        '';

    const items =
        data.items ??
        data.products ??
        [];

    if (type === 'REQUERY' || type === 'INVALID') {
        addBotMessage(message || '조금만 더 알려줄래?', BOT_AVATAR_NORMAL);
        clearCards();
        return;
    }

    if (type === 'RECOMMEND') {
        addBotMessage(message || '이 상품들 어때?', BOT_AVATAR_SUCCESS);

        // 🔥 필드명 수정: item.image → item.imageUrl, item.lprice → item.price
        const products = items.map(item => ({
            id: item.productId,
            name: item.title,
            price: item.price
                ? `${Number(item.price).toLocaleString()}원`
                : '',
            image: item.imageUrl,
            mall: item.mallName,
            link: item.link,
            reason: item.explanation || '추천 이유를 생성 중이에요.'
        }));

        showRecommendations(products);
    }
}

// ===== 🔥 HTML 초기 봇 메시지 제거 =====
function clearInitialBotMessageIfNeeded() {
    if (initialBotMessageCleared) return;

    const botMessages = messagesContainer.querySelectorAll('.bot-message');

    if (botMessages.length === 1) {
        const bubble = botMessages[0].querySelector('.message-bubble');
        if (bubble && bubble.textContent.trim() === '안녕! 뭘 찾아드릴까요?') {
            botMessages[0].remove();
            initialBotMessageCleared = true;
        }
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

function addBotMessage(text, avatar) {
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
    div.id = 'loading-message';
    div.className = 'message bot-message';
    div.innerHTML = `
        <img src="${BOT_AVATAR_LOADING}" class="bot-avatar">
        <div class="message-bubble loading-dots">
            <span></span><span></span><span></span>
        </div>
    `;
    messagesContainer.appendChild(div);
    scrollToBottom();
}

function removeLoadingMessage() {
    document.getElementById('loading-message')?.remove();
}

function showErrorMessage() {
    addBotMessage('서버랑 연결이 끊겼어. 다시 시도해줄래?', BOT_AVATAR_NORMAL);
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

// ===== 채팅 초기화 =====
function resetChat() {
    // 메시지 전부 삭제
    messagesContainer.innerHTML = '';
    
    // 초기 봇 메시지 다시 추가
    const initialMessage = document.createElement('div');
    initialMessage.className = 'message bot-message';
    initialMessage.innerHTML = `
        <img src="${BOT_AVATAR_NORMAL}" alt="봇" class="bot-avatar">
        <div class="message-bubble">
            안녕! 뭘 찾아드릴까요?
        </div>
    `;
    messagesContainer.appendChild(initialMessage);
    
    // 카드 덱 초기화
    clearCards();
    
    // 플래그 리셋
    initialBotMessageCleared = false;
    
    // 입력창 비우기
    userInput.value = '';
    
    console.log('채팅이 초기화되었습니다.');
}