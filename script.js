// ===== 전역 변수 =====
const API_URL = 'https://api.example.com/recommend'; // 실제 API 주소로 교체

const messagesContainer = document.getElementById('messagesContainer');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const cardsDeckContainer = document.getElementById('cardsDeckContainer');
const cardsNavigation = document.getElementById('cardsNavigation');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const cardIndicators = document.getElementById('cardIndicators');
const cardCount = document.getElementById('cardCount');

// 현재 카드 상태
let currentProducts = [];
let currentCardIndex = 0;

// 봇 이미지 경로
const BOT_AVATAR = 'dog-normal.jpg';

// 챗봇 메시지
const BOT_MESSAGES = [
    '이런 상품들 찾아봤어!',
    '마음에 드는 게 있으면 좋겠다',
    '이 중에서 골라봐',
    '비슷한 것들 모아봤어',
    '어떤 게 제일 좋아 보여?'
];

// ===== 가짜 상품 데이터 =====
const FAKE_PRODUCTS = [
    {
        id: 1,
        name: '여자 가을 오버핏 맨투맨 기본 무지 베이직 티셔츠',
        price: '24,900원',
        image: 'https://via.placeholder.com/400x400/e8dfd3/8b7d6b?text=Product+1',
        mall: '스타일난다',
        link: 'https://search.shopping.naver.com',
        reason: '오버핏 실루엣으로 편안하게 입기 좋고, 베이직한 디자인이라 어떤 옷과도 잘 어울려요.'
    },
    {
        id: 2,
        name: '캐주얼 루즈핏 맨투맨 티셔츠 가을 신상',
        price: '19,800원',
        image: 'https://via.placeholder.com/400x400/d9cfc1/6b6b6b?text=Product+2',
        mall: '무신사',
        link: 'https://search.shopping.naver.com',
        reason: '가성비가 좋고 색상이 다양해서 선택의 폭이 넓어요. 세탁도 편리해요.'
    },
    {
        id: 3,
        name: '편안한 오버사이즈 맨투맨 가을 추천 아이템',
        price: '32,000원',
        image: 'https://via.placeholder.com/400x400/cfc2b0/5a5a5a?text=Product+3',
        mall: '지그재그',
        link: 'https://search.shopping.naver.com',
        reason: '소재가 부드럽고 신축성이 좋아 활동하기 편해요. 내구성도 뛰어나요.'
    },
    {
        id: 4,
        name: '베이직 라운드넥 맨투맨 심플 디자인',
        price: '27,500원',
        image: 'https://via.placeholder.com/400x400/b8b0a3/4a4a4a?text=Product+4',
        mall: '에이블리',
        link: 'https://search.shopping.naver.com',
        reason: '심플한 디자인으로 데일리룩에 잘 어울리고, 핏이 예쁘다는 후기가 많아요.'
    },
    {
        id: 5,
        name: '트렌디 오버핏 맨투맨 가을 신상 베스트',
        price: '29,900원',
        image: 'https://via.placeholder.com/400x400/a89f91/3a3a3a?text=Product+5',
        mall: '29CM',
        link: 'https://search.shopping.naver.com',
        reason: '올 가을 트렌드를 반영한 디자인이고, 착용감이 좋아 재구매율이 높아요.'
    }
];

// ===== 초기화 =====
sendButton.addEventListener('click', handleSendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSendMessage();
    }
});

prevButton.addEventListener('click', showPreviousCard);
nextButton.addEventListener('click', showNextCard);

// ===== 메시지 전송 =====
function handleSendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // 사용자 메시지 추가
    addUserMessage(message);
    userInput.value = '';

    // 로딩 상태
    showLoadingMessage();

    // API 호출 시뮬레이션
    setTimeout(() => {
        // 실제 환경: fetchRecommendations(message);
        showRecommendations(FAKE_PRODUCTS);
    }, 2000);
}

// ===== 사용자 메시지 추가 =====
function addUserMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';

    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    bubbleDiv.textContent = text;

    messageDiv.appendChild(bubbleDiv);
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

// ===== 봇 메시지 추가 =====
function addBotMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';

    const avatarImg = document.createElement('img');
    avatarImg.src = BOT_AVATAR;
    avatarImg.alt = '봇';
    avatarImg.className = 'bot-avatar';

    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    bubbleDiv.textContent = text;

    messageDiv.appendChild(avatarImg);
    messageDiv.appendChild(bubbleDiv);
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

// ===== 로딩 메시지 =====
function showLoadingMessage() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.id = 'loading-message';

    const avatarImg = document.createElement('img');
    avatarImg.src = BOT_AVATAR;
    avatarImg.alt = '봇';
    avatarImg.className = 'bot-avatar';

    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble loading-dots';
    bubbleDiv.innerHTML = '<span></span><span></span><span></span>';

    messageDiv.appendChild(avatarImg);
    messageDiv.appendChild(bubbleDiv);
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

// ===== 추천 결과 표시 =====
function showRecommendations(products) {
    // 로딩 메시지 제거
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) {
        loadingMessage.remove();
    }

    // 봇 메시지 추가
    const randomMessage = BOT_MESSAGES[Math.floor(Math.random() * BOT_MESSAGES.length)];
    addBotMessage(randomMessage);

    // 상품 저장 및 카드 표시
    currentProducts = products;
    currentCardIndex = 0;
    displayCardDeck();
    updateCardCount();
}

// ===== 카드 덱 표시 =====
function displayCardDeck() {
    // 기존 내용 제거
    cardsDeckContainer.innerHTML = '';

    if (currentProducts.length === 0) {
        cardsDeckContainer.innerHTML = '<div class="no-cards-message">상품을 검색하면 여기에 추천 카드가 나타나요!</div>';
        cardsNavigation.style.display = 'none';
        return;
    }

    // 카드 덱 생성
    const deckDiv = document.createElement('div');
    deckDiv.className = 'card-deck';

    // 카드들 생성 (역순으로 추가하여 z-index 자연스럽게)
    currentProducts.forEach((product, index) => {
        const card = createProductCard(product, index);
        deckDiv.appendChild(card);
    });

    cardsDeckContainer.appendChild(deckDiv);

    // 카드 위치 업데이트
    updateCardPositions();

    // 네비게이션 표시
    cardsNavigation.style.display = 'flex';
    updateIndicators();
    updateNavigationButtons();
}

// ===== 상품 카드 생성 =====
function createProductCard(product, index) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.index = index;

    card.innerHTML = `
        <div class="card-content">
            <img src="${product.image}" alt="${product.name}" class="card-image">
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

    // 클릭 이벤트 - 네이버 쇼핑 이동
    card.addEventListener('click', () => {
        if (index === currentCardIndex) {
            window.open(product.link, '_blank');
        }
    });

    return card;
}

// ===== 카드 위치 업데이트 (3D 쌓임 효과) =====
function updateCardPositions() {
    const cards = document.querySelectorAll('.product-card');

    cards.forEach((card, index) => {
        const cardIndex = parseInt(card.dataset.index);
        const diff = cardIndex - currentCardIndex;

        // 클래스 및 스타일 초기화
        card.className = 'product-card';
        card.style.transform = '';
        card.style.opacity = '';

        if (diff === 0) {
            // 현재 카드
            card.classList.add('active');
        } else if (diff === 1) {
            // 바로 뒤 카드
            card.classList.add('stacked', 'stacked-1');
        } else if (diff === 2) {
            // 그 다음 카드
            card.classList.add('stacked', 'stacked-2');
        } else if (diff >= 3) {
            // 더 뒤 카드들
            card.classList.add('stacked', 'stacked-3');
        } else if (diff === -1) {
            // 바로 이전 카드 (왼쪽으로)
            card.classList.add('prev-1');
        } else if (diff <= -2) {
            // 그 이전 카드들 (더 왼쪽)
            card.classList.add('prev-2');
        }
    });
}

// ===== 이전 카드 =====
function showPreviousCard() {
    if (currentCardIndex > 0) {
        currentCardIndex--;
        updateCardPositions();
        updateIndicators();
        updateNavigationButtons();
    }
}

// ===== 다음 카드 =====
function showNextCard() {
    if (currentCardIndex < currentProducts.length - 1) {
        currentCardIndex++;
        updateCardPositions();
        updateIndicators();
        updateNavigationButtons();
    }
}

// ===== 인디케이터 업데이트 =====
function updateIndicators() {
    cardIndicators.innerHTML = '';

    currentProducts.forEach((_, index) => {
        const indicator = document.createElement('div');
        indicator.className = 'indicator';
        if (index === currentCardIndex) {
            indicator.classList.add('active');
        }
        cardIndicators.appendChild(indicator);
    });
}

// ===== 네비게이션 버튼 상태 =====
function updateNavigationButtons() {
    prevButton.disabled = currentCardIndex === 0;
    nextButton.disabled = currentCardIndex === currentProducts.length - 1;
}

// ===== 카드 개수 업데이트 =====
function updateCardCount() {
    if (currentProducts.length > 0) {
        cardCount.textContent = `(${currentCardIndex + 1}/${currentProducts.length})`;
    } else {
        cardCount.textContent = '';
    }
}

// ===== 스크롤 하단으로 =====
function scrollToBottom() {
    setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
}

// ===== 실제 API 호출 (참고용) =====
async function fetchRecommendations(query) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: query })
        });

        if (!response.ok) {
            throw new Error('API 호출 실패');
        }

        const data = await response.json();
        showRecommendations(data.products);

    } catch (error) {
        console.error('API 오류:', error);
        showErrorMessage();
    }
}

// ===== 에러 메시지 =====
function showErrorMessage() {
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) {
        loadingMessage.remove();
    }

    addBotMessage('앗, 지금은 상품을 찾기 어려워... 다시 시도해줄래?');
}

// ===== 카드 개수 실시간 업데이트 =====
setInterval(() => {
    if (currentProducts.length > 0) {
        updateCardCount();
    }
}, 100);