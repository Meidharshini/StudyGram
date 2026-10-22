
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Quiz.css";

const quizQuestions = {
  Java: [
    {
      question: "Which keyword is used to inherit a class in Java?",
      options: ["implements", "extends", "inherits", "super"],
      answer: "extends",
    },
    {
      question: "Which method is the entry point of a Java program?",
      options: ["start()", "run()", "main()", "init()"],
      answer: "main()",
    },
    {
      question: "Which of these is not a primitive data type in Java?",
      options: ["int", "char", "boolean", "String"],
      answer: "String",
    },
    {
      question: "Which keyword creates an object in Java?",
      options: ["class", "new", "this", "void"],
      answer: "new",
    },
    {
      question: "Which concept allows one interface to have different implementations?",
      options: [
        "Encapsulation",
        "Polymorphism",
        "Compilation",
        "Casting",
      ],
      answer: "Polymorphism",
    },
  ],



  Python: [
    {
      question: "Which keyword is used to define a function in Python?",
      options: ["function", "define", "def", "fun"],
      answer: "def",
    },
    {
      question: "Which data type stores True or False?",
      options: ["int", "bool", "str", "list"],
      answer: "bool",
    },
    {
      question: "What is the output of print(2 ** 3)?",
      options: ["6", "8", "9", "5"],
      answer: "8",
    },
    {
      question: "Which symbol is used for a single-line comment in Python?",
      options: ["//", "/*", "#", "--"],
      answer: "#",
    },
    {
      question: "Which method adds an item to the end of a list?",
      options: ["add()", "insertEnd()", "append()", "push()"],
      answer: "append()",
    },
  ],

  
  SQL: [
    {
      question: "Which SQL command retrieves data from a table?",
      options: ["GET", "SELECT", "FETCH ALL", "OPEN"],
      answer: "SELECT",
    },
    {
      question: "Which clause filters rows before grouping?",
      options: ["HAVING", "ORDER BY", "WHERE", "GROUP BY"],
      answer: "WHERE",
    },
    {
      question: "Which function counts the number of rows?",
      options: ["SUM()", "TOTAL()", "COUNT()", "NUMBER()"],
      answer: "COUNT()",
    },
    {
      question: "Which key uniquely identifies each row in a table?",
      options: [
        "Foreign key",
        "Primary key",
        "Alternate key",
        "Duplicate key",
      ],
      answer: "Primary key",
    },
    {
      question: "Which clause filters grouped results?",
      options: ["WHERE", "SELECT", "HAVING", "LIMIT"],
      answer: "HAVING",
    },
  ],

  
  "Web Development": [
    {
      question: "Which language is used to structure a web page?",
      options: ["CSS", "HTML", "JavaScript", "SQL"],
      answer: "HTML",
    },
    {
      question: "Which HTML tag is used to create a hyperlink?",
      options: ["<link>", "<a>", "<href>", "<url>"],
      answer: "<a>",
    },
    {
      question: "Which language is primarily used to style web pages?",
      options: ["Java", "Python", "CSS", "SQL"],
      answer: "CSS",
    },
    {
      question: "Which keyword declares a block-scoped variable in JavaScript?",
      options: ["var", "let", "define", "dim"],
      answer: "let",
    },
    {
      question: "Which React hook is commonly used to manage component state?",
      options: ["useRoute", "useFetch", "useState", "usePage"],
      answer: "useState",
    },
  ],


  
  "Data Structures and Algorithms": [
    {
      question: "Which data structure follows LIFO?",
      options: ["Queue", "Stack", "Linked List", "Tree"],
      answer: "Stack",
    },
    {
      question: "Which data structure follows FIFO?",
      options: ["Stack", "Tree", "Queue", "Graph"],
      answer: "Queue",
    },
    {
      question: "What is the time complexity of binary search on a sorted array?",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      answer: "O(log n)",
    },
    {
      question: "Which of these is a linear data structure?",
      options: ["Graph", "Tree", "Array", "Binary Search Tree"],
      answer: "Array",
    },
    {
      question: "Which algorithm is commonly used to sort an array by repeatedly swapping adjacent elements?",
      options: [
        "Binary Search",
        "Bubble Sort",
        "DFS",
        "Binary Search Tree",
      ],
      answer: "Bubble Sort",
    },
  ],


  
  Aptitude: [
    {
      question: "A number is 20% of 150. What is the number?",
      options: ["20", "25", "30", "35"],
      answer: "30",
    },
    {
      question: "If 5 pens cost ₹50, what is the cost of 8 pens at the same rate?",
      options: ["₹60", "₹70", "₹80", "₹100"],
      answer: "₹80",
    },
    {
      question: "Find the next number: 2, 4, 8, 16, __.",
      options: ["20", "24", "30", "32"],
      answer: "32",
    },
    {
      question: "A car travels 120 km in 3 hours. What is its average speed?",
      options: ["30 km/h", "40 km/h", "50 km/h", "60 km/h"],
      answer: "40 km/h",
    },
    {
      question: "The average of 10, 20, and 30 is:",
      options: ["15", "20", "25", "30"],
      answer: "20",
    },
  ],



};

function Quiz() {

    const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState("Java");
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const questions = quizQuestions[selectedTopic] || [];

  function startQuiz() {
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setScore(0);
    setFinished(false);
    setStarted(true);
  }

  function submitAnswer() {
    if (!selectedAnswer) {
      alert("Please select an answer first!");
      return;
    }

    const isCorrect =
      selectedAnswer === questions[currentQuestion].answer;

    if (isCorrect) {
      setScore((previousScore) => previousScore + 1);
    }

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion((previous) => previous + 1);
      setSelectedAnswer("");
    } else {
      setFinished(true);
    }
  }

  function restartQuiz() {
    setStarted(false);
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setScore(0);
    setFinished(false);
  }

  return (
    <div className="quiz-page">
      
<header className="quiz-header">
  <button
    className="quiz-back-button"
    onClick={() => navigate("/dashboard")}
  >
    ← Back to Dashboard
  </button>

  <h2>StudyGram</h2>
  <h3>Knowledge Quiz</h3>
</header>


      <main className="quiz-content">
        {!started ? (
          <>
            <h1>Test Your Knowledge! 📝</h1>
            <p>Choose a topic and challenge yourself.</p>

            <div className="quiz-topic-section">
              <h3>Select a Topic</h3>

              <div className="quiz-topics">
                {[
                  "Java",
                  "Python",
                  "Web Development",
                  "SQL",
                  "Data Structures and Algorithms",
                  "Aptitude",
                ].map((topic) => (
                  <button
                    key={topic}
                    className={
                      selectedTopic === topic
                        ? "quiz-topic active"
                        : "quiz-topic"
                    }
                    onClick={() => setSelectedTopic(topic)}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <div className="quiz-start-section">
              <h2>{selectedTopic}</h2>
              <p>
                {quizQuestions[selectedTopic]
                  ? `${quizQuestions[selectedTopic].length} questions available`
                  : "Questions for this topic are coming soon!"}
              </p>

              <button
                className="quiz-start-button"
                onClick={startQuiz}
                disabled={!quizQuestions[selectedTopic]}
              >
                Start Quiz
              </button>
            </div>
          </>
        ) : finished ? (
          <div className="quiz-start-section">
            <h1>Quiz Completed! 🎉</h1>
            <h2>
              Your Score: {score} / {questions.length}
            </h2>
            <p>
              {score === questions.length
                ? "Excellent! You answered every question correctly!"
                : score >= 3
                ? "Great effort! Keep practising to improve."
                : "Keep learning! Try again to improve your score."}
            </p>

            <button
              className="quiz-start-button"
              onClick={restartQuiz}
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="quiz-start-section">
           
<div className="quiz-progress-info">
  <span>{selectedTopic}</span>
  <span>
    Question {currentQuestion + 1} of {questions.length}
  </span>
</div>

<div className="quiz-progress-track">
  <div
    className="quiz-progress-fill"
    style={{
      width: `${((currentQuestion + 1) / questions.length) * 100}%`,
    }}
  />
</div>


            <h2>{questions[currentQuestion].question}</h2>

            <div className="quiz-answer-options">
              {questions[currentQuestion].options.map((option) => (
                <button
                  key={option}
                  className={
                    selectedAnswer === option
                      ? "quiz-answer selected"
                      : "quiz-answer"
                  }
                  onClick={() => setSelectedAnswer(option)}
                >
                  {option}
                </button>
              ))}
            </div>

            <button
              className="quiz-start-button"
              onClick={submitAnswer}
            >
              {currentQuestion + 1 === questions.length
                ? "Finish Quiz"
                : "Next Question"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default Quiz;
