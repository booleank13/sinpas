document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const timerDisplay = document.getElementById('timer');
    const endScreen = document.getElementById('end-screen');

    // Images for the cards
    // 2 Cars and 2 Houses
    const carImages = [
        'assets/car_1.svg',
        'assets/car_2.svg'
    ];
    const houseImages = [
        'assets/house_1.svg',
        'assets/house_2.svg'
    ];

    let cardsArray = [];

    // Smart Shuffle: Implements strictly defined topology
    // Pattern: 1-2, 2-4, 4-3, 3-1.
    // Constraints:
    // 1. Matches must be on opposite columns (Diagonal).
    // 2. Every row must have 1 Car and 1 House (Mixed Type).
    function createSmartDeck() {
        const shuffledCars = [...carImages].sort(() => 0.5 - Math.random());
        const shuffledHouses = [...houseImages].sort(() => 0.5 - Math.random());

        // We need 4 pairs: A, B, C, D.
        // To satisfy "1 Car, 1 House per row", we need to alternate types for the pairs.
        // Let Pair A be a Car. Then Pair D (Row 1's other card) must be a House.
        // Let Pair B be a House (Row 2 matches Row 1[Car] with A[Car], so B must be House).
        // Let Pair C be a Car (Row 4 matches Row 2[House] with B[House], so C must be Car).

        // So: A=Car, B=House, C=Car, D=House.
        const pairA = shuffledCars[0];   // Link 1-2
        const pairB = shuffledHouses[0]; // Link 2-4
        const pairC = shuffledCars[1];   // Link 4-3
        const pairD = shuffledHouses[1]; // Link 3-1

        // Construct Rows with fixed indices [Left, Right] to ensure Diagonal matches.

        // Row 1: [A, D] -> [Car, House]
        // Position: A at 0 (Left), D at 1 (Right)
        const row1 = [pairA, pairD];

        // Row 2 matches Row 1 (A) and Row 4 (B).
        // Since A was at Col 0 in Row 1, A must be at Col 1 in Row 2.
        // Row 2: [B, A] -> [House, Car]
        // Position: B at 0 (Left), A at 1 (Right)
        const row2 = [pairB, pairA];

        // Row 4 matches Row 2 (B) and Row 3 (C).
        // Since B was at Col 0 in Row 2, B must be at Col 1 in Row 4.
        // Row 4: [C, B] -> [Car, House]
        // Position: C at 0 (Left), B at 1 (Right)
        const row4 = [pairC, pairB];

        // Row 3 matches Row 4 (C) and Row 1 (D).
        // Since C was at Col 0 in Row 4, C must be at Col 1 in Row 3.
        // Since D was at Col 1 in Row 1, D must be at Col 0 in Row 3.
        // Row 3: [D, C] -> [House, Car]
        // Position: D at 0 (Left), C at 1 (Right)
        const row3 = [pairD, pairC];

        // Now we have the rows constructed.
        // To add variety, we can flip the entire board horizontally (swap all L/R).
        const flipBoard = Math.random() > 0.5;

        const finalRows = [row1, row2, row3, row4];
        const finalDeck = [];

        for (const r of finalRows) {
            if (flipBoard) {
                finalDeck.push(r[1]); // New Left
                finalDeck.push(r[0]); // New Right
            } else {
                finalDeck.push(r[0]);
                finalDeck.push(r[1]);
            }
        }

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
