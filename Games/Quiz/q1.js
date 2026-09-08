const quizData = [
    {
      question: "1. Tâi-gí toaⁿ bú-im ū kúi ê ?",
      options: ["5 ê", "6 ê", "8 ê", "7 ê"],
      answer: "6 ê",
      point: 10
    },
    
    {
      question: "2. Tâi-gí pòaⁿ bú-im ū kúi ê?",
      options: ["2 ê", "3 ê", "4 ê", "5 ê"],
      answer: "2 ê",
      point: 10
    },
    {
      question: "3. Tâi-gí ji̍p siaⁿ ū kúi chióng?",
      options: ["4 chióng", "6 chióng", "7 chióng", "8 chióng"],
      answer: "8 chióng",
      point: 10
    },
        {
      question: "4. Tâi-gí ki-pún siaⁿ-tiāu ū kúi chióng?",
      options: ["4 chióng", "6 chióng", "7 chióng", "8 chióng"],
      answer: "7 chióng",
      point: 10
    },
        {
      question: "5. Tâi-gí té-sok im ū kúi chióng?",
      options: ["4 chióng", "6 chióng", "7 chióng", "8 chióng"],
      answer: "8 chióng",
      point: 10
    },
        {
      question: "6. Tâi-gí ki-pún piàn-tiāu kui-chek tó chi̍t chióng tio̍h?",
      options: ["4 piàn 8", "5 piàn 2", "3 piàn 2", "4 piàn 7"],
      answer: "3 piàn 2",
      point: 10
    },
        {
      question: "7. Tó chi̍t ê ū Tâi-gí lô-má-jī BÔ ēng-tio̍h ê jī ？",
      options: ["a, b, c, g", "d, e, f, g", "h, i, j, k", "l, m, n, o"],
      answer: "d, e, f, g",
      point: 10
    },
        {
      question: "8. Tâi-gí ho̍k bú-im（siang bú-im kah saⁿ bú-im liân chò-hóe ） ū kúi chióng？",
      options: ["10 chióng", "9 chióng", "11 chióng", "8 chióng"],
      answer: "10 chióng",
      point: 10
    },
        {
      question: "9. Tâi-gí lô-má-jī ū-sî bú-im ū-sî chú-im ê jī, toh chi̍t ê soán-hāng chèng-khak?",
      options: ["ph", "ch", "ng", "s"],
      answer: "ng",
      point: 10
    },
            {
      question: "10. Tâi-gí lô-má-jī ū-sî bú-im ū-sî chú-im ê jī, toh chi̍t ê soán-hāng chèng-khak?",
      options: ["th", "m", "g", "b"],
      answer: "m",
      point: 10
    },
        {
      question: "11. Tâi-gí lô-má-jī koh hō chòe sim-mih ？",
      options: ["pe̍h-ōe-jī", "Tâi-oân-jī", "hoan-á-jī", "khóng-chú-jī"],
      answer: "pe̍h-ōe-jī",
      point: 10
    },
    {
      question: "12. Biâu-su̍t Tâi-gí tó chi̍t hāng tio̍h?",
      options: ["tio̍h-sī bân-lâm-gí", "tio̍h-sī lâm-tó-gí", "ū im bô jī", "Tâi-oàn-ōe chài-lâi ê chheng-ho͘"],
      answer: "Tâi-oàn-ōe chài-lâi ê chheng-ho͘",
      point: 10
    },

    {
      question: "13. Tâi-gí tó chi̍t hāng siaⁿ-tiāu hû-hō tio̍h?",
      options: ["2 /", "3 /", "5 \\", "7 |" ],
      answer: "2 /",
      point: 10
    },

    {
      question: "14.Tâi-gí tó chi̍t hāng sī te̍k-sû siaⁿ-tiāu?",
      options: ["thâu-mo͘", "khò͘-khò͘", "tē-tāng", "chúi-chhiâng"],
      answer: "tē-tāng",
      point: 10
    },

    {
      question: "15. Tâi-gí tó chi̍t ê sû sī á chêng ê te̍k-sû piàn-tiāu?",
      options: ["chhia-á", "oân-á", "thò͘-á", "a̍p-á"],
      answer: "thò͘-á",
      point: 10
    },


    // Add more questions here...
  ];
  
  const questionElement = document.getElementById("question");
  const optionsElement = document.getElementById("options");
  const submitButton = document.getElementById("submit");
  
  let currentQuestion = 0;
  let score = 0;
  let wrongAnswer =[];
  function showQuestion() {
    const question = quizData[currentQuestion];
    questionElement.innerText = question.question;
  
    optionsElement.innerHTML = "";
    question.options.forEach(option => {
      const button = document.createElement("button");
      button.innerText = option;
      optionsElement.appendChild(button);
      button.addEventListener("click", selectAnswer);
    });
  }
  
  function selectAnswer(e) {
    const selectedButton = e.target;
    const answer = quizData[currentQuestion].answer;
  
    if (selectedButton.innerText === answer) {   
       score += quizData[currentQuestion].point;
    } else{
        wrongAnswer.push(currentQuestion +1);
    }
  
    currentQuestion++;
  
    if (currentQuestion < quizData.length) {
      showQuestion();
    } else {
      showResult();
    }
  }
  
  function showResult() {
    quiz.innerHTML = `
      <h1>Quiz Completed!</h1>
      <p>Your score: ${score}/${quizData.length}</p>
      <p>wrong answer: question ${wrongAnswer.slice().join(',')}</p>
    `;
  }
  
  showQuestion();