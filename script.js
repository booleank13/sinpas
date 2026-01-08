document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const timerDisplay = document.getElementById('timer');
    const endScreen = document.getElementById('end-screen');

    // Images for the cards
    // Cars
    const carImages = [
        'assets/car_1.svg',
        'assets/car_1.svg',
        'assets/car_2.svg',
        'assets/car_2.svg'
    ];
    // Houses
    const houseImages = [
        'assets/house_1.svg',
        'assets/house_1.svg',
        'assets/house_2.svg',
        'assets/house_2.svg'
    ];

    let cardsArray = [];

    // Smart Shuffle: Ensures each row (0-1, 2-3, 4-5, 6-7) has exactly 1 Car and 1 House
    function createSmartDeck() {
        // Shuffle the specialized arrays
        const shuffledCars = carImages.sort(() => 0.5 - Math.random());
        const shuffledHouses = houseImages.sort(() => 0.5 - Math.random());

        const finalDeck = [];

        // We have 4 rows
        for (let i = 0; i < 4; i++) {
            // Pick one car and one house for this row
            const pair = [shuffledCars[i], shuffledHouses[i]];

            // Randomly swap left/right position for this row
            if (Math.random() > 0.5) {
                finalDeck.push(pair[0]); // Left
                finalDeck.push(pair[1]); // Right
            } else {
                finalDeck.push(pair[1]); // Left
                finalDeck.push(pair[0]); // Right
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
        for (let i = 0; i < cardsArray.length; i++) {
            const card = document.createElement('div');
            card.classList.add('card');
            card.setAttribute('data-id', i);

            const front = document.createElement('div');
            front.classList.add('card-face', 'card-front');

            const back = document.createElement('div');
            back.classList.add('card-face', 'card-back');
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
        if (!won) {
            endScreen.querySelector('h2').textContent = "Süre Doldu!";
            endScreen.querySelector('p').textContent = "Tekrar deneyin.";
        }
    }

    createBoard();
    startTimer();
});
