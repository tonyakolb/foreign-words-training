"use strict";

const words = [
    { russianWord: "яблоко", englishWord: "apple", example: "My favorite fruit is an apple.", attempts: 0 },
    { russianWord: "кошка", englishWord: "cat", example: "My pet is a cat.", attempts: 0 },
    { russianWord: "улица", englishWord: "street", example: "Sherlock Holmes lived on Baker Street.", attempts: 0 },
    { russianWord: "дом", englishWord: "home", example: "That red building is my home.", attempts: 0 },
    { russianWord: "попкорн", englishWord: "popcorn", example: "I always buy popcorn at the cinema.", attempts: 0 },
];

const studyCards = document.querySelector('.study-cards');
const flipCard = document.querySelector('.flip-card');

const cardFrontH1 = document.querySelector('#card-front h1');
const cardBackH1 = document.querySelector('.flip-card-back h1');
const cardBackSpan = document.querySelector('.flip-card-back span');

const studyMode = document.querySelector('#study-mode');
const wordsProgress = document.querySelector('#words-progress');
const currentWord = document.querySelector('#current-word');

const examMode = document.querySelector('#exam-mode');
const timerSpan = document.querySelector('#time');
const examWordsContainer = document.querySelector('#exam-cards');
const examProgress = document.querySelector('#exam-progress');
const correctPersent = document.querySelector('#correct-percent');

const shuffleButton = document.querySelector('#shuffle-words');
const buttonBack = document.querySelector('#back');
const buttonNext = document.querySelector('#next');
const buttonTesting = document.querySelector('#exam');

const wordTemplate = document.querySelector('#word-stats');
const resultModal = document.querySelector('.results-modal');
const staticsContainer = document.querySelector('.results-content');
const staticsTimer = document.querySelector('.time');

let time = timerSpan.textContent.split(':');
let minutes = time[0];
let seconds = time[1];
let currentIndex = 0;
let cardMode = 'training';
let selectedCard;
let timerId;
let selectedCardIndex;
let correctAnswers = 0;

function displayCard(index) {
    const word = words[index];
    cardFrontH1.textContent = word.russianWord;
    cardBackH1.textContent = word.englishWord;
    cardBackSpan.textContent = word.example;
    currentWord.textContent = currentIndex + 1;
    wordsProgress.value = currentWord.textContent * 20;

    buttonBack.disabled = currentIndex === 0;
    buttonNext.disabled = currentIndex === words.length - 1;
}

buttonNext.addEventListener('click', function () {
    if (flipCard.classList.contains('active')) {
        flipCard.classList.remove('active');
    }
    if (currentIndex < words.length - 1) {
        currentIndex++;
        displayCard(currentIndex);
    }
});

buttonBack.addEventListener('click', function () {
    if (flipCard.classList.contains('active')) {
        flipCard.classList.remove('active');
    }
    if (currentIndex > 0) {
        currentIndex--;
        displayCard(currentIndex);
    }
});

flipCard.addEventListener('click', function () {
    this.classList.toggle('active');
});

displayCard(currentIndex);

buttonTesting.addEventListener('click', () => {
    cardMode = 'testing';
    examMode.classList.remove('hidden');
    studyMode.classList.add('hidden');
    renderWords();
    resetTimer();
    timerId = setInterval(updateTimer, 1000);
});

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

function renderWords() {
    studyCards.classList.toggle('hidden');

    const mixedWords = [];
    words.forEach(item => {
        mixedWords.push(item.russianWord, item.englishWord);
    });
    shuffle(mixedWords);

    examWordsContainer.innerHTML = '';

    mixedWords.forEach((word) => {
        const wordCard = document.createElement('div');
        wordCard.innerHTML = `<h2>${word}</h2>`;
        wordCard.classList.add('card');

        wordCard.addEventListener('click', () => handleCardClick(wordCard, word));
        examWordsContainer.appendChild(wordCard);
    });
}

function handleCardClick(clickedCard, word) {
    const clickedCardIndex = words.findIndex(item => item.russianWord === word || item.englishWord === word);

    if (!selectedCard) {
        selectedCard = clickedCard;
        selectedCardIndex = clickedCardIndex;
        selectedCard.classList.add('correct');
    } else {
        if (selectedCardIndex === clickedCardIndex) {
            clickedCard.classList.add('correct');
            correctAnswers++;
            words[clickedCardIndex].attempts++;
            setTimeout(() => {
                selectedCard.classList.add('fade-out');
                clickedCard.classList.add('fade-out');
                selectedCard = null;
                selectedCardIndex = null;
                checkAllCards();
            }, 500);
        } else {
            clickedCard.classList.add('wrong');
            words[clickedCardIndex].attempts++;
            setTimeout(() => {
                clickedCard.classList.remove('wrong');
                resetCardStates();
            }, 1000);
        }
    }
    correctPersent.textContent = `${correctAnswers * 20}%`;
    examProgress.value = correctAnswers * 20;
}

function resetCardStates() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        if (!card.classList.contains('correct')) {
            card.classList.remove('wrong');
        }
    });
}

function checkAllCards() {
    const remainingCards = document.querySelectorAll('.card:not(.fade-out)');
    if (remainingCards.length === 0) {
        clearInterval(timerId);
        setTimeout(() => {
            alert('Поздравляем! Вы успешно завершили проверку знаний!');
            saveProgress();
            resultModal.classList.toggle('hidden');
            examWordsContainer.classList.toggle('hidden');
            renderStatics(words);
        }, 500);

    }
}

shuffleButton.addEventListener('click', () => {
    if (cardMode === 'training') {
        shuffle(words);
        displayCard(currentIndex);
    }
});

function updateTimer() {
    seconds++;

    if (seconds > 59) {
        seconds = 0;
        minutes++;
    }

    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;


    timerSpan.textContent = `${formattedMinutes}:${formattedSeconds}`;
    staticsTimer.textContent = `${formattedMinutes}:${formattedSeconds}`;
}

function resetTimer() {
    seconds = 0;
    minutes = 0;
    timerSpan.textContent = '00:00';
}

function prepareWordItem(wordItem) {

    const { englishWord, attempts } = wordItem;
    const item = wordTemplate.content.cloneNode(true);

    item.querySelector(".word span").textContent = englishWord;
    item.querySelector(".attempts span").textContent = attempts;

    return item;
}

function renderStatics(arr) {
    staticsContainer.innerHTML = "";
    const correctCount = correctAnswers;
    const totalCount = words.reduce((total, word) => total + word.attempts, 0);

    const statsHeader = document.createElement('h2');
    statsHeader.textContent = `Правильные ответы: ${correctCount}, неправильные ответы: ${totalCount - correctCount}`;
    staticsContainer.appendChild(statsHeader);

    arr.forEach((item) => {
        staticsContainer.append(prepareWordItem(item));
    });
}

function saveProgress() {
    const progress = {
        currentIndex: currentIndex,
        shuffledWords: words.map(word => word.russianWord),
        timer: { minutes, seconds },
        correctAnswers: correctAnswers,
        totalAttempts: words.reduce((total, word) => total + word.attempts, 0)
    };
    localStorage.setItem('progress', JSON.stringify(progress));
}

function loadProgress() {
    try {
        const savedProgress = localStorage.getItem('progress');
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            currentIndex = progress.currentIndex;
            words.forEach((word) => {
                word.attempts = 0;
            });
            words.sort((a, b) => {
                return progress.shuffledWords.indexOf(a.russianWord) - progress.shuffledWords.indexOf(b.russianWord);
            });
            minutes = progress.timer.minutes;
            seconds = progress.timer.seconds;
            correctAnswers = progress.correctAnswers;
            displayCard(currentIndex);
            updateTimerDisplay();
        }
    } catch (error) {
        console.error('Ошибка при загрузке прогресса из localStorage:', error);
    }
}