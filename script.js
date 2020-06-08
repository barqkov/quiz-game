(function () {

    window.onload = function () {
        fillCategories();
    }

    const sendHttpRequest = (method, url, data) => {
        const promise = new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open(method, url);

            xhr.responseType = "json";

            if (data) {
                xhr.setRequestHeader("Content-Type", "application/json");
            }

            xhr.onload = () => {
                if (xhr.status >= 400) {
                    reject(xhr.response);
                } else {
                    resolve(xhr.response);
                }
            };

            xhr.onerror = () => {
                reject("Something went wrong!");
            };

            xhr.send(JSON.stringify(data));
        });
        return promise;
    };


    const gameOptionsForm = document.getElementById("game-options-form");
    const questionsForm = document.getElementById("game-questions-form");
    let correctAnswers = [];


    const getGameOptions = e => {
        e.preventDefault();

        const numberOfQuestions = document.getElementById("game-number-of-questions").value;
        const category = document.getElementById("game-categories").value;
        const difficulty = document.getElementById("game-difficulty").value;

        let result = sendHttpRequest("GET", `https://opentdb.com/api.php?amount=${numberOfQuestions}&category=${category}&difficulty=${difficulty}&type=multiple`);


        fillQuestions(result);
    };


    function fillCategories() {
        const gameCategories = document.getElementById("game-categories");

        sendHttpRequest("GET", "https://opentdb.com/api_category.php").then(data => {
            for (let i = 0; i < data.trivia_categories.length; i++) {
                let categoryOption = document.createElement("option");
                categoryOption.setAttribute("value", `${data.trivia_categories[i].id}`);
                categoryOption.innerText = `${data.trivia_categories[i].name}`
                gameCategories.appendChild(categoryOption);
            }
        }

        );

    }



    async function fillQuestions(questionObj) {
        let responseCode = await questionObj.then(data => data).then(finalData => finalData.response_code);
        let questionArray = await questionObj.then(data => data).then(finalData => finalData.results);

        if (responseCode === 1) {
            alert("There are not enough questions in our database");
        }

        if (responseCode === 0) {
            let jsxParse = "";
            // console.log(questionArray);

            for (let i = 0; i < questionArray.length; i++) {
                correctAnswers.push(questionArray[i].correct_answer);
                let answersArr = questionArray[i].incorrect_answers.concat(questionArray[i].correct_answer);
                let shuffledAnswersArr = shuffleArray(answersArr);

                jsxParse += `<div class="game-question-answers">
                <h5>${questionArray[i].question}</h5>

                <label><input type="radio" name="question-${i}" value="${shuffledAnswersArr[0]}">${shuffledAnswersArr[0]}</label>
                <label><input type="radio" name="question-${i}" value="${shuffledAnswersArr[1]}">${shuffledAnswersArr[1]}</label>
                <label><input type="radio" name="question-${i}" value="${shuffledAnswersArr[2]}">${shuffledAnswersArr[2]}</label>
                <label><input type="radio" name="question-${i}" value="${shuffledAnswersArr[3]}">${shuffledAnswersArr[3]}</label>

            </div>
            `
            };


            jsxParse += `<input type="submit" value="Submit" class="submit-form-button">`
            questionsForm.innerHTML = jsxParse;
            console.log(correctAnswers);


            questionsForm.addEventListener('submit', getAnswers);

        }

    }


    gameOptionsForm.addEventListener("submit", getGameOptions);

    function shuffleArray(a) {
        var cidx, ridx, tmp;
        cidx = a.length;
        while (cidx != 0) {
            ridx = Math.floor(Math.random() * cidx);
            cidx--;
            tmp = a[cidx];
            a[cidx] = a[ridx];
            a[ridx] = tmp;
        }
        return a;
    }

    function getAnswers(e) {

        e.preventDefault();

        let nodeListOfDiv = document.querySelectorAll(".game-question-answers");
        let arrayOfDiv = Array.from(nodeListOfDiv);
        let userAnswers = [];

        for (let i = 0; i < arrayOfDiv.length; i++) {
            if (arrayOfDiv[i].querySelector("input:checked")) {
                userAnswers.push(arrayOfDiv[i].querySelector("input:checked").value);

            } else {
                userAnswers.push("Not answered")
            }
        }

        checkAnswers(userAnswers);

    }

    function checkAnswers(userAnswersArr) {
        let correctCount = 0;
        let wrongCount = 0;


        for (let i = 0; i < userAnswersArr.length; i++) {
            if (correctAnswers[i] === userAnswersArr[i]) {
                correctCount++;
            } else {
                wrongCount++;
            }
        }

        console.log(`You have: ${correctCount} correct answers and ${wrongCount} wrong answers. Enjoy!`);
    }

})();
