document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const timerDisplay = document.getElementById('timer');
    const endScreen = document.getElementById('end-screen');

    // Images for the cards (4 unique images for 4 pairs)
    const allImages = [
        'assets/car_1.svg',
        'assets/car_2.svg',
        'assets/house_1.svg',
        'assets/house_2.svg'
    ];

    let cardsArray = [];

    // Smart Shuffle: Implements the specific "Ring Topology" requested by the user
    // The user specified a pattern that implies links: 1-2, 2-4, 4-3, 3-1.
    function createSmartDeck() {
        // Shuffle the images so the specific image for a link changes every game
        // This ensures "Pair A" isn't always "car_1.svg"
        const shuffledImages = [...allImages].sort(() => 0.5 - Math.random());

        // Assign images to Edges (Links between rows)
        const edge12 = shuffledImages[0]; // Link between Row 1 and Row 2
        const edge24 = shuffledImages[1]; // Link between Row 2 and Row 4
        const edge43 = shuffledImages[2]; // Link between Row 4 and Row 3 (User said 4. 3)
        const edge31 = shuffledImages[3]; // Link between Row 3 and Row 1 (User said 3. 1)

        // Construct Rows based on the topology
        // Row 1 connects to 2 (edge12) and 3 (edge31)
        const row1 = [edge12, edge31];

        // Row 2 connects to 1 (edge12) and 4 (edge24)
        const row2 = [edge12, edge24];

        // Row 3 connects to 4 (edge43) and 1 (edge31)
        const row3 = [edge43, edge31];

        // Row 4 connects to 2 (edge24) and 3 (edge43)
        const row4 = [edge24, edge43];

        // Helper to shuffle columns within a row (Left/Right)
        function shuffleRow(row) {
            return Math.random() > 0.5 ? [row[0], row[1]] : [row[1], row[0]];
        }

        const finalDeck = [
            ...shuffleRow(row1),
            ...shuffleRow(row2),
            ...shuffleRow(row3),
            ...shuffleRow(row4)
        ];

        return finalDeck;
    }

    cardsArray = createSmartDeck();

    let cardsChosen = [];
    let cardsChosenId = [];
    let cardsWon = [];
    let isLocked = false;
    let timeLeft = 60; // 1 minute
    let timerId;

    function createBoard() {
        grid.innerHTML = '';
        for (let i = 0; i < cardsArray.length; i++) {
            const card = document.createElement('div');
            card.classList.add('card');
            card.setAttribute('data-id', i);

            const front = document.createElement('div');
            front.classList.add('card-face', 'card-front');
            // Front is the back pattern (closed)

            const back = document.createElement('div');
            back.classList.add('card-face', 'card-back');
            // Back is the image (open)
            const img = document.createElement('img');
            img.src = cardsArray[i];
            back.appendChild(img);

            card.appendChild(front);
            card.appendChild(back);

            card.addEventListener('click', flipCard);
            grid.appendChild(card);
        }
    }

    function flipCard() {
        if (isLocked) return;
        const cardId = this.getAttribute('data-id');

        // Prevent clicking the same card twice
        if (!this.classList.contains('flipped') && !cardsWon.includes(cardId)) {
            cardsChosen.push(cardsArray[cardId]);
            cardsChosenId.push(cardId);
            this.classList.add('flipped');

            if (cardsChosen.length === 2) {
                isLocked = true; // Lock board while checking
                setTimeout(checkForMatch, 500);
            }
        }
    }

    function checkForMatch() {
        const cards = document.querySelectorAll('.card');
        const optionOneId = cardsChosenId[0];
        const optionTwoId = cardsChosenId[1];

        // Check matching logic based on image src
        if (cardsChosen[0] === cardsChosen[1]) {
            // Match found
            cards[optionOneId].classList.add('matched');
            cards[optionTwoId].classList.add('matched');
            cardsWon.push(optionOneId);
            cardsWon.push(optionTwoId);
        } else {
            // No match
            cards[optionOneId].classList.remove('flipped');
            cards[optionTwoId].classList.remove('flipped');
        }

        cardsChosen = [];
        cardsChosenId = [];
        isLocked = false;

        if (cardsWon.length === cardsArray.length) {
            endGame(true);
        }
    }

    function startTimer() {
        // Update display immediately
        updateTimerDisplay();

        timerId = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();

            if (timeLeft === 0) {
                clearInterval(timerId);
                endGame(false);
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    function endGame(won) {
        clearInterval(timerId);
        endScreen.classList.remove('hidden');
        const h2 = endScreen.querySelector('h2');
        const p = endScreen.querySelector('p');

        if (!won) {
            h2.textContent = "Süre Doldu!";
            p.textContent = "Tekrar deneyin.";
        } else {
             h2.textContent = "Tebrikler!";
             p.textContent = "Formu doldurarak fırsatlardan yararlanın.";
        }
    }

    createBoard();
    startTimer();
});
