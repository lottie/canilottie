import { CorpusPage } from './common';

const searchInput = document.querySelector<HTMLInputElement>('#search_input')!;
const results = document.querySelector<HTMLUListElement>('#results')!;

let corpus: CorpusPage[] = [];

// Load the search corpus.
fetch('./allData.json')
  .then((response: Response) => response.json())
  .then((data) => corpus = data);

document.querySelector<HTMLButtonElement>('#search')!.addEventListener('click', () => {
  // Clear the results.
  results.innerHTML = '';

  const searchValue = searchInput.value;
  corpus.forEach((page) => {
    if (page.content.includes(searchValue)) {
      const li = document.createElement('li');
      li.innerHTML = `<a href="${page.url}">${page.title}</a>`;
      results.appendChild(li);
    }
  });
});
