let categories = [];
const NUM_CATEGORIES = 6;
const NUM_QUESTIONS_PER_CAT = 5;

// Replace this with the actual API endpoint
const API_BASE_URL = 'https://jservice.io/api';

/** Get NUM_CATEGORIES random categories from API.
 *
 * Returns array of category ids
 */
async function getCategoryIds() {
  const res = await fetch(`${API_BASE_URL}/categories?count=100`);
  const data = await res.json();
  const randomCategories = _.sampleSize(data, NUM_CATEGORIES);
  return randomCategories.map(category => category.id);
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */
async function getCategory(catId) {
  const res = await fetch(`${API_BASE_URL}/category?id=${catId}`);
  const data = await res.json();
  const clues = data.clues.slice(0, NUM_QUESTIONS_PER_CAT).map(clue => ({
    question: clue.question,
    answer: clue.answer,
    showing: null,
  }));
  return { title: data.title, clues };
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initially, just show a "?" where the question/answer would go.)
 */
async function fillTable() {
  const table = document.querySelector("#jeopardy");
  table.innerHTML = "";

  const thead = document.createElement("thead");
  const tr = document.createElement("tr");

  for (let category of categories) {
    const th = document.createElement("th");
    th.innerText = category.title;
    tr.appendChild(th);
  }
  thead.appendChild(tr);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  for (let i = 0; i < NUM_QUESTIONS_PER_CAT; i++) {
    const tr = document.createElement("tr");
    for (let category of categories) {
      const td = document.createElement("td");
      td.innerText = "?";
      td.dataset.categoryIndex = categories.indexOf(category);
      td.dataset.clueIndex = i;
      td.addEventListener("click", handleClick);
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */
function handleClick(evt) {
  const td = evt.target;
  const categoryIndex = td.dataset.categoryIndex;
  const clueIndex = td.dataset.clueIndex;
  const clue = categories[categoryIndex].clues[clueIndex];

  if (clue.showing === null) {
    td.innerText = clue.question;
    clue.showing = "question";
  } else if (clue.showing === "question") {
    td.innerText = clue.answer;
    clue.showing = "answer";
  }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */
function showLoadingView() {
  const table = document.querySelector("#jeopardy");
  table.innerHTML = "<div>Loading...</div>";
  const button = document.querySelector("#start-button");
  button.innerText = "Loading...";
}

/** Remove the loading spinner and update the button used to fetch data. */
function hideLoadingView() {
  const button = document.querySelector("#start-button");
  button.innerText = "Restart Game";
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */
async function setupAndStart() {
  showLoadingView();

  const categoryIds = await getCategoryIds();
  categories = await Promise.all(categoryIds.map(id => getCategory(id)));

  hideLoadingView();
  fillTable();
}

/** On click of start / restart button, set up game. */
document.querySelector("#start-button").addEventListener("click", setupAndStart);

/** On page load, add event handler for clicking clues */
document.addEventListener("DOMContentLoaded", setupAndStart);
