// ==============================
// MINDRUSH - SCRIPT
// ==============================

// HOME + SETTINGS
const homeScreen = document.getElementById("homeScreen");
const startButton = document.getElementById("startButton");
const settingsButton = document.getElementById("settingsButton");
const settingsScreen = document.getElementById("settingsScreen");
const closeSettings = document.getElementById("closeSettings");

const englishButton = document.getElementById("englishButton");
const hindiButton = document.getElementById("hindiButton");

// GAME
const gameScreen = document.getElementById("gameScreen");
const question = document.getElementById("question");
const answerButtons = document.querySelectorAll(".answer");
const timerDisplay = document.getElementById("timer");
const categoryDisplay = document.getElementById("category");
const questionNumber = document.getElementById("questionNumber");

// ==============================
// BACKGROUND MUSIC
// ==============================

const backgroundMusic =
    new Audio("background.mp3");

backgroundMusic.loop = true;
backgroundMusic.preload = "auto";

// Start background music
function startBackgroundMusic() {

    backgroundMusic.play().catch(function () {

        // Browser autoplay protection

    });

}

// Stop background music
function stopBackgroundMusic() {

    backgroundMusic.pause();

    backgroundMusic.currentTime = 0;

}

// ==============================
// GAME VARIABLES
// ==============================

let currentQuestion = 0;
let score = 0;
let answered = false;
let timer;
let timeLeft = 30;

// Remember selected language
let currentLanguage =
    localStorage.getItem("mindrushLanguage") || "en";

// ==============================
// CATEGORY ICONS
// ==============================

const categoryIcons = {
    LOGIC: "🧩",
    MATHS: "➗",
    EMOJI: "😀"
};

// ==============================
// SETTINGS
// ==============================

settingsButton.addEventListener("click", function () {

    homeScreen.style.display = "none";
    settingsScreen.style.display = "block";

});

closeSettings.addEventListener("click", function () {

    settingsScreen.style.display = "none";
    homeScreen.style.display = "block";

});

englishButton.addEventListener("click", function () {

    currentLanguage = "en";

    localStorage.setItem(
        "mindrushLanguage",
        "en"
    );

});

hindiButton.addEventListener("click", function () {

    currentLanguage = "hi";

    localStorage.setItem(
        "mindrushLanguage",
        "hi"
    );

});

// ==============================
// SHUFFLE
// ==============================

function shuffle(array) {

    return [...array].sort(
        () => Math.random() - 0.5
    );

}

// ==============================
// CREATE DAILY QUESTIONS
// ==============================

function createDailyQuestions() {

    const logicQuestions =
        shuffle(questionBank.logic)
            .slice(0, 5)
            .map(q => ({
                ...q,
                category: "LOGIC"
            }));

    const mathsQuestions =
        shuffle(questionBank.maths)
            .slice(0, 5)
            .map(q => ({
                ...q,
                category: "MATHS"
            }));

    const emojiQuestions =
        shuffle(questionBank.emoji)
            .slice(0, 5)
            .map(q => ({
                ...q,
                category: "EMOJI"
            }));

    return shuffle([

        ...logicQuestions,
        ...mathsQuestions,
        ...emojiQuestions

    ]);

}

// ==============================
// DAILY DATE
// ==============================

function getTodayDate() {

    const today = new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            today.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}

// ==============================
// GET DAILY QUESTIONS
// ==============================

function getDailyQuestions() {

    const today =
        getTodayDate();

    const savedDate =
        localStorage.getItem(
            "mindrushQuestionDate"
        );

    const savedQuestions =
        localStorage.getItem(
            "mindrushDailyQuestions"
        );

    // Same day + saved questions
    if (
        savedDate === today &&
        savedQuestions
    ) {

        try {

            const parsedQuestions =
                JSON.parse(
                    savedQuestions
                );

            if (
                Array.isArray(parsedQuestions) &&
                parsedQuestions.length === 15
            ) {

                return parsedQuestions;

            }

        } catch (error) {

            console.log(
                "Daily questions reset."
            );

        }

    }

    // New day OR no saved questions
    const newQuestions =
        createDailyQuestions();

    localStorage.setItem(
        "mindrushQuestionDate",
        today
    );

    localStorage.setItem(
        "mindrushDailyQuestions",
        JSON.stringify(newQuestions)
    );

    return newQuestions;

}

// ==============================
// LOAD TODAY'S QUESTIONS
// ==============================

let questions =
    getDailyQuestions();

// ==============================
// TIMER
// ==============================

function startTimer() {

    clearInterval(timer);

    timeLeft = 30;

    timerDisplay.textContent =
        "⏱️ " + timeLeft;

    timer = setInterval(function () {

        timeLeft--;

        timerDisplay.textContent =
            "⏱️ " + timeLeft;

        if (timeLeft <= 0) {

            clearInterval(timer);

            if (!answered) {

                timeUp();

            }

        }

    }, 1000);

}

// ==============================
// LOAD QUESTION
// ==============================

function loadQuestion() {

    const q =
        questions[currentQuestion];

    // Category
    categoryDisplay.textContent =
        categoryIcons[q.category] +
        " " +
        q.category;

    // Question number
    questionNumber.textContent =
        `${currentQuestion + 1} / ${questions.length}`;

    // Choose language
    const questionText =
        currentLanguage === "hi" && q.textHi
            ? q.textHi
            : q.text;

    const questionOptions =
        currentLanguage === "hi" && q.optionsHi
            ? q.optionsHi
            : q.options;

    // Show question
    question.textContent =
        questionText;

    // Show answers
    answerButtons.forEach(
        function (button, index) {

            button.textContent =
                questionOptions[index];

            button.disabled = false;

            button.onclick = function () {

                checkAnswer(index);

            };

        }
    );

    answered = false;

    startTimer();

}

// ==============================
// START GAME
// ==============================

startButton.addEventListener(
    "click",
    function () {

        homeScreen.style.display =
            "none";

        gameScreen.style.display =
            "block";

        currentQuestion = 0;
        score = 0;

        // Get today's question set
        // New set only after date changes
        questions =
            getDailyQuestions();

        // Start background music
        startBackgroundMusic();

        loadQuestion();

    }
);

// ==============================
// CHECK ANSWER
// ==============================

function checkAnswer(selectedAnswer) {

    if (answered) {

        return;

    }

    answered = true;

    clearInterval(timer);

    const q =
        questions[currentQuestion];

    const questionOptions =
        currentLanguage === "hi" && q.optionsHi
            ? q.optionsHi
            : q.options;

    if (
        selectedAnswer ===
        q.correctAnswer
    ) {

        score++;

        showFeedback(
            "✅ CORRECT!",
            "+1 POINT"
        );

    } else {

        showFeedback(
            "❌ NOT QUITE!",
            "Correct answer: " +
            questionOptions[q.correctAnswer]
        );

    }

}

// ==============================
// TIME UP
// ==============================

function timeUp() {

    answered = true;

    const q =
        questions[currentQuestion];

    const questionOptions =
        currentLanguage === "hi" && q.optionsHi
            ? q.optionsHi
            : q.options;

    answerButtons.forEach(
        function (button) {

            button.disabled = true;

        }
    );

    showFeedback(
        "⏰ TIME UP!",
        "Correct answer: " +
        questionOptions[q.correctAnswer]
    );

}

// ==============================
// FEEDBACK
// ==============================

function showFeedback(
    title,
    message
) {

    const feedback =
        document.createElement("div");

    feedback.id =
        "feedback";

    feedback.innerHTML = `

        <h2>${title}</h2>

        <p>${message}</p>

        <p>Score: ${score}</p>

        <button id="nextButton">
            NEXT →
        </button>

    `;

    gameScreen.appendChild(
        feedback
    );

    document
        .getElementById("nextButton")
        .onclick = function () {

            feedback.remove();

            currentQuestion++;

            if (
                currentQuestion <
                questions.length
            ) {

                loadQuestion();

            } else {

                showFinalResult();

            }

        };

}

// ==============================
// FINAL RESULT
// ==============================

function showFinalResult() {

    clearInterval(timer);

    document.querySelector(
        ".game-top"
    ).style.display = "none";

    document.querySelector(
        ".question-box"
    ).style.display = "none";

    document.querySelector(
        ".answers"
    ).style.display = "none";

    const result =
        document.createElement("div");

    result.id =
        "resultChat";

    const accuracy =
        Math.round(
            (score / questions.length) * 100
        );

    // ==============================
    // LANGUAGE
    // ==============================

    const isHindi =
        currentLanguage === "hi";

    const challengeComplete =
        isHindi
            ? "चैलेंज पूरा हो गया! ⚡"
            : "Challenge complete! ⚡";

    const howDidIDo =
        isHindi
            ? "मैंने कैसा किया?"
            : "How did I do?";

    const yourScore =
        isHindi
            ? "आपका स्कोर:"
            : "Your Score:";

    const accuracyText =
        isHindi
            ? "सटीकता:"
            : "Accuracy:";

    const niceWork =
        isHindi
            ? "बहुत बढ़िया! 🧠"
            : "Nice work! 🧠";

    const completedText =
        isHindi
            ? `आपने सभी ${questions.length} चैलेंज पूरे कर लिए।`
            : `You completed all ${questions.length} challenges.`;

    const playAgainText =
        isHindi
            ? "🔄 फिर से खेलें"
            : "🔄 PLAY AGAIN";

    const homeText =
        isHindi
            ? "🏠 होम"
            : "🏠 HOME";

    // ==============================
    // RESULT SCREEN
    // ==============================

    result.innerHTML = `

        <div class="chat-bubble bot">

            🧠 <strong>MindRush</strong><br>

            ${challengeComplete}

        </div>

        <div class="chat-bubble user">

            ${howDidIDo}

        </div>

        <div class="chat-bubble bot">

            🎯 ${yourScore}
            <strong>
                ${score}/${questions.length}
            </strong>

            <br>

            ⚡ ${accuracyText}
            <strong>
                ${accuracy}%
            </strong>

        </div>

        <div class="chat-bubble bot">

            ${niceWork}<br>

            ${completedText}

        </div>

        <button id="playAgainButton">

            ${playAgainText}

        </button>

        <button id="homeButton">

            ${homeText}

        </button>

    `;

    gameScreen.appendChild(
        result
    );

    // ==============================
    // PLAY AGAIN
    // ==============================

    document
        .getElementById(
            "playAgainButton"
        )
        .onclick = function () {

            result.remove();

            document.querySelector(
                ".game-top"
            ).style.display = "flex";

            document.querySelector(
                ".question-box"
            ).style.display = "flex";

            document.querySelector(
                ".answers"
            ).style.display = "grid";

            currentQuestion = 0;

            score = 0;

            // Same daily questions
            questions =
                getDailyQuestions();

            // Make sure music is still playing
            startBackgroundMusic();

            loadQuestion();

        };

    // ==============================
    // HOME
    // ==============================

    document
        .getElementById(
            "homeButton"
        )
        .onclick = function () {

            result.remove();

            document.querySelector(
                ".game-top"
            ).style.display = "flex";

            document.querySelector(
                ".question-box"
            ).style.display = "flex";

            document.querySelector(
                ".answers"
            ).style.display = "grid";

            gameScreen.style.display =
                "none";

            homeScreen.style.display =
                "block";

            // Stop music when returning home
            stopBackgroundMusic();

        };

}