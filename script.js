document.addEventListener('DOMContentLoaded', () => {
    const rankingContainer = document.getElementById('rankingContainer');
    const uploadModal = document.getElementById('uploadModal');
    const deleteModal = document.getElementById('deleteModal');
    const uploadForm = document.getElementById('uploadForm');
    const addImageBtn = document.getElementById('addImageBtn');
    const cancelUpload = document.getElementById('cancelUpload');
    const backButton = document.querySelector('.back-button');
    const modalTitle = document.getElementById('modalTitle');
    const editItemId = document.getElementById('editItemId');
    const confirmDelete = document.getElementById('confirmDelete');
    const cancelDelete = document.getElementById('cancelDelete');

    let itemToDelete = null;

    // Get ranking ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const rankingId = urlParams.get('id') || '1';
    
    // Load ranking data
    loadRanking();

    // Modal controls
    addImageBtn.addEventListener('click', () => {
        modalTitle.textContent = 'Lägg till bild';
        editItemId.value = '';
        uploadForm.reset();
        uploadModal.classList.add('active');
    });

    cancelUpload.addEventListener('click', closeUploadModal);
    cancelDelete.addEventListener('click', closeDeleteModal);

    // Close modals when clicking outside
    uploadModal.addEventListener('click', (e) => {
        if (e.target === uploadModal) closeUploadModal();
    });

    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) closeDeleteModal();
    });

    confirmDelete.addEventListener('click', () => {
        if (itemToDelete) {
            itemToDelete.remove();
            updatePositions();
            saveRanking();
            closeDeleteModal();
        }
    });

    function closeUploadModal() {
        uploadModal.classList.remove('active');
        uploadForm.reset();
    }

    function closeDeleteModal() {
        deleteModal.classList.remove('active');
        itemToDelete = null;
    }

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
        const url = document.getElementById('urlInput').value;
        const isEditing = editItemId.value !== '';

        // Validate URL if provided
        let validUrl = null;
        if (url) {
            try {
                validUrl = new URL(url);
            } catch (e) {
                // Invalid URL, ignore it
            }
        }

        if ((!file && !isEditing) || !title) return;

        if (isEditing) {
            updateCard(editItemId.value, title, description, file, validUrl ? validUrl.href : null);
        } else {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageData = {
                    src: e.target.result,
                    title: title,
                    description: description,
                    url: validUrl ? validUrl.href : null,
                    id: Date.now()
                };
                addCard(imageData);
                saveRanking();
            };
            reader.readAsDataURL(file);
        }
        closeUploadModal();
    });

    function updateCard(id, title, description, newFile, url) {
        const card = document.querySelector(`.ranking-card[data-id="${id}"]`);
        if (!card) return;

        const updateCardContent = (imageSrc) => {
            const titleElement = card.querySelector('.card-title');
            const descriptionElement = card.querySelector('.card-description');
            const readMoreButton = card.querySelector('.read-more-button');
            
            if (imageSrc) {
                card.querySelector('.card-image').src = imageSrc;
            }
            titleElement.textContent = title;
            descriptionElement.textContent = description;

            // Update or remove read more button
            if (url) {
                if (readMoreButton) {
                    readMoreButton.href = url;
                } else {
                    addReadMoreButton(card.querySelector('.card-text'), url);
                }
            } else if (readMoreButton) {
                readMoreButton.remove();
            }

            saveRanking();
        };

        if (newFile) {
            const reader = new FileReader();
            reader.onload = (e) => updateCardContent(e.target.result);
            reader.readAsDataURL(newFile);
        } else {
            updateCardContent();
        }
    }

    function addReadMoreButton(container, url) {
        const button = document.createElement('a');
        button.className = 'read-more-button';
        button.href = url;
        button.target = '_blank';
        button.rel = 'noopener noreferrer';
        button.innerHTML = `
            Läs mer
            <i class="fas fa-external-link-alt"></i>
        `;
        container.appendChild(button);
    }

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
                    ${imageData.url ? `
                        <a href="${imageData.url}" class="read-more-button" target="_blank" rel="noopener noreferrer">
                            Läs mer
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                    ` : ''}
                </div>
                <div class="card-actions">
                    <button class="action-button edit-button" title="Redigera">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button class="action-button delete-button" title="Radera">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        // Add action button events
        const editButton = card.querySelector('.edit-button');
        const deleteButton = card.querySelector('.delete-button');

        editButton.addEventListener('click', (e) => {
            e.stopPropagation();
            modalTitle.textContent = 'Redigera bild';
            editItemId.value = imageData.id;
            document.getElementById('titleInput').value = imageData.title;
            document.getElementById('descriptionInput').value = imageData.description || '';
            document.getElementById('urlInput').value = imageData.url || '';
            uploadModal.classList.add('active');
        });

        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            itemToDelete = card;
            deleteModal.classList.add('active');
        });

        // Add touch events
        card.addEventListener('touchstart', handleTouchStart);
        card.addEventListener('touchmove', handleTouchMove);
        card.addEventListener('touchend', handleTouchEnd);

        rankingContainer.appendChild(card);
        updatePositions();
    }

    // Touch and mouse event handling for cards
    let activeCard = null;
    let startY = 0;
    let currentY = 0;
    let initialPosition = 0;

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
                description: card.querySelector('.card-description').textContent,
                url: card.querySelector('.read-more-button')?.href || null
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