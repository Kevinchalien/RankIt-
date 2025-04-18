document.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.getElementById('menuContainer');
    const newRankingModal = document.getElementById('newRankingModal');
    const newRankingForm = document.getElementById('newRankingForm');
    const addRankingBtn = document.getElementById('addRankingBtn');
    const cancelNewRanking = document.getElementById('cancelNewRanking');

    // Load existing rankings
    loadRankings();

    // Modal controls
    addRankingBtn.addEventListener('click', () => {
        newRankingModal.classList.add('active');
    });

    cancelNewRanking.addEventListener('click', () => {
        newRankingModal.classList.remove('active');
        newRankingForm.reset();
    });

    // Handle new ranking creation
    newRankingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = document.getElementById('rankingTitleInput').value;
        if (title) {
            const rankingId = Date.now().toString();
            createRanking(rankingId, title);
            newRankingModal.classList.remove('active');
            newRankingForm.reset();
        }
    });

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
        rankingElement.innerHTML = `<h2>${title}</h2>`;
        
        rankingElement.addEventListener('click', () => {
            window.location.href = `index.html?id=${id}`;
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