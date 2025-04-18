document.addEventListener('DOMContentLoaded', () => {
    const rankingContainer = document.getElementById('rankingContainer');
    const uploadModal = document.getElementById('uploadModal');
    const uploadForm = document.getElementById('uploadForm');
    const addImageBtn = document.getElementById('addImageBtn');
    const cancelUpload = document.getElementById('cancelUpload');
    const backButton = document.querySelector('.back-button');

    // Get ranking ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const rankingId = urlParams.get('id') || '1';
    
    // Load ranking data
    loadRanking();

    // Modal controls
    addImageBtn.addEventListener('click', () => {
        uploadModal.classList.add('active');
    });

    cancelUpload.addEventListener('click', () => {
        uploadModal.classList.remove('active');
        uploadForm.reset();
    });

    // Back button
    backButton.addEventListener('click', () => {
        window.location.href = 'menu.html';
    });

    // Handle form submission
    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const file = document.getElementById('imageInput').files[0];
        const title = document.getElementById('titleInput').value;
        const description = document.getElementById('descriptionInput').value;

        if (file && title) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageData = {
                    src: e.target.result,
                    title: title,
                    description: description,
                    id: Date.now()
                };
                addCard(imageData);
                saveRanking();
                uploadModal.classList.remove('active');
                uploadForm.reset();
            };
            reader.readAsDataURL(file);
        }
    });

    // Touch and mouse event handling for cards
    let activeCard = null;
    let startY = 0;
    let currentY = 0;
    let initialPosition = 0;

    function addCard(imageData) {
        const card = document.createElement('div');
        card.className = 'ranking-card';
        card.dataset.id = imageData.id;

        const position = rankingContainer.children.length + 1;
        
        card.innerHTML = `
            <div class="ranking-number">${position}</div>
            <div class="card-content">
                <img src="${imageData.src}" alt="${imageData.title}" class="card-image">
                <div class="card-text">
                    <h3 class="card-title">${imageData.title}</h3>
                    <p class="card-description">${imageData.description || ''}</p>
                </div>
            </div>
        `;

        // Add touch events
        card.addEventListener('touchstart', handleTouchStart);
        card.addEventListener('touchmove', handleTouchMove);
        card.addEventListener('touchend', handleTouchEnd);

        rankingContainer.appendChild(card);
        updatePositions();
    }

    function handleTouchStart(e) {
        activeCard = this;
        const touch = e.touches[0];
        startY = touch.clientY;
        currentY = startY;
        initialPosition = activeCard.offsetTop;
        
        activeCard.classList.add('dragging');
    }

    function handleTouchMove(e) {
        if (!activeCard) return;
        e.preventDefault();

        const touch = e.touches[0];
        currentY = touch.clientY;
        const deltaY = currentY - startY;

        activeCard.style.transform = `translateY(${deltaY}px)`;

        // Check for swap
        const cards = [...rankingContainer.children];
        const activeIndex = cards.indexOf(activeCard);
        const cardHeight = activeCard.offsetHeight;

        cards.forEach((card, index) => {
            if (card === activeCard) return;

            const cardPosition = card.offsetTop;
            if (initialPosition + deltaY < cardPosition && index < activeIndex) {
                card.style.transform = `translateY(${cardHeight}px)`;
            } else if (initialPosition + deltaY > cardPosition && index > activeIndex) {
                card.style.transform = `translateY(-${cardHeight}px)`;
            } else {
                card.style.transform = '';
            }
        });
    }

    function handleTouchEnd() {
        if (!activeCard) return;

        const cards = [...rankingContainer.children];
        const activeIndex = cards.indexOf(activeCard);
        const deltaY = currentY - startY;
        const cardHeight = activeCard.offsetHeight;
        const newIndex = Math.round(deltaY / cardHeight) + activeIndex;
        
        // Reset all transforms
        cards.forEach(card => {
            card.style.transform = '';
        });

        if (newIndex >= 0 && newIndex < cards.length && newIndex !== activeIndex) {
            if (newIndex > activeIndex) {
                rankingContainer.insertBefore(activeCard, cards[newIndex + 1]);
            } else {
                rankingContainer.insertBefore(activeCard, cards[newIndex]);
            }
            updatePositions();
            saveRanking();
        }

        activeCard.classList.remove('dragging');
        activeCard = null;
    }

    function updatePositions() {
        const cards = rankingContainer.children;
        Array.from(cards).forEach((card, index) => {
            const numberElement = card.querySelector('.ranking-number');
            numberElement.textContent = index + 1;
        });
    }

    function saveRanking() {
        const cards = rankingContainer.querySelectorAll('.ranking-card');
        const rankingData = {
            id: rankingId,
            title: document.getElementById('rankingTitle').textContent,
            items: []
        };
        
        cards.forEach(card => {
            rankingData.items.push({
                id: card.dataset.id,
                src: card.querySelector('.card-image').src,
                title: card.querySelector('.card-title').textContent,
                description: card.querySelector('.card-description').textContent
            });
        });

        const rankings = JSON.parse(localStorage.getItem('rankings')) || {};
        rankings[rankingId] = rankingData;
        localStorage.setItem('rankings', JSON.stringify(rankings));
    }

    function loadRanking() {
        const rankings = JSON.parse(localStorage.getItem('rankings')) || {};
        const ranking = rankings[rankingId];
        
        if (ranking) {
            document.getElementById('rankingTitle').textContent = ranking.title;
            ranking.items.forEach(item => addCard(item));
        }
    }
}); 