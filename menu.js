document.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.getElementById('menuContainer');
    const newRankingModal = document.getElementById('newRankingModal');
    const deleteRankingModal = document.getElementById('deleteRankingModal');
    const newRankingForm = document.getElementById('newRankingForm');
    const addRankingBtn = document.getElementById('addRankingBtn');
    const cancelNewRanking = document.getElementById('cancelNewRanking');
    const confirmDeleteRanking = document.getElementById('confirmDeleteRanking');
    const cancelDeleteRanking = document.getElementById('cancelDeleteRanking');
    const rankingModalTitle = document.getElementById('rankingModalTitle');
    const editRankingId = document.getElementById('editRankingId');

    let rankingToDelete = null;

    // Load existing rankings
    loadRankings();

    // Modal controls
    addRankingBtn.addEventListener('click', () => {
        rankingModalTitle.textContent = 'Ny rankning';
        editRankingId.value = '';
        newRankingForm.reset();
        newRankingModal.classList.add('active');
    });

    cancelNewRanking.addEventListener('click', closeNewRankingModal);
    cancelDeleteRanking.addEventListener('click', closeDeleteRankingModal);

    // Close modals when clicking outside
    newRankingModal.addEventListener('click', (e) => {
        if (e.target === newRankingModal) closeNewRankingModal();
    });

    deleteRankingModal.addEventListener('click', (e) => {
        if (e.target === deleteRankingModal) closeDeleteRankingModal();
    });

    confirmDeleteRanking.addEventListener('click', () => {
        if (rankingToDelete) {
            const rankings = JSON.parse(localStorage.getItem('rankings')) || {};
            delete rankings[rankingToDelete.dataset.id];
            localStorage.setItem('rankings', JSON.stringify(rankings));
            rankingToDelete.remove();
            closeDeleteRankingModal();
        }
    });

    function closeNewRankingModal() {
        newRankingModal.classList.remove('active');
        newRankingForm.reset();
    }

    function closeDeleteRankingModal() {
        deleteRankingModal.classList.remove('active');
        rankingToDelete = null;
    }

    // Handle new ranking creation
    newRankingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = document.getElementById('rankingTitleInput').value;
        const isEditing = editRankingId.value !== '';

        if (title) {
            if (isEditing) {
                updateRanking(editRankingId.value, title);
            } else {
                const rankingId = Date.now().toString();
                createRanking(rankingId, title);
            }
            closeNewRankingModal();
        }
    });

    function updateRanking(id, title) {
        const rankings = JSON.parse(localStorage.getItem('rankings')) || {};
        if (rankings[id]) {
            rankings[id].title = title;
            localStorage.setItem('rankings', JSON.stringify(rankings));
            
            const rankingElement = document.querySelector(`.menu-item[data-id="${id}"]`);
            if (rankingElement) {
                rankingElement.querySelector('h2').textContent = title;
            }
        }
    }

    function createRanking(id, title) {
        const rankings = JSON.parse(localStorage.getItem('rankings')) || {};
        rankings[id] = {
            id: id,
            title: title,
            items: []
        };
        localStorage.setItem('rankings', JSON.stringify(rankings));
        addRankingToMenu(id, title);
    }

    function addRankingToMenu(id, title) {
        const rankingElement = document.createElement('div');
        rankingElement.className = 'menu-item';
        rankingElement.dataset.id = id;
        rankingElement.innerHTML = `
            <h2>${title}</h2>
            <div class="item-actions">
                <button class="action-button edit-button" title="Redigera">
                    <i class="fas fa-pencil-alt"></i>
                </button>
                <button class="action-button delete-button" title="Radera">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add click events
        rankingElement.addEventListener('click', (e) => {
            if (!e.target.closest('.action-button')) {
                window.location.href = `index.html?id=${id}`;
            }
        });

        const editButton = rankingElement.querySelector('.edit-button');
        const deleteButton = rankingElement.querySelector('.delete-button');

        editButton.addEventListener('click', (e) => {
            e.stopPropagation();
            rankingModalTitle.textContent = 'Redigera rankning';
            editRankingId.value = id;
            document.getElementById('rankingTitleInput').value = title;
            newRankingModal.classList.add('active');
        });

        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            rankingToDelete = rankingElement;
            deleteRankingModal.classList.add('active');
        });

        menuContainer.appendChild(rankingElement);
    }

    function loadRankings() {
        const rankings = JSON.parse(localStorage.getItem('rankings')) || {};
        Object.entries(rankings).forEach(([id, ranking]) => {
            addRankingToMenu(id, ranking.title);
        });
    }
}); 
