import { CorpusPage } from './common';

const main = async () => {
  const searchInput = document.querySelector<HTMLInputElement>('#search_input')!;
  const results = document.querySelector<HTMLUListElement>('#results')!;
  const button = document.querySelector<HTMLInputElement>('#submit')!;
  const form = document.querySelector<HTMLFormElement>('#form')!;

  // Load the search corpus.
  const resp = await fetch('./allData.json');
  const corpus: CorpusPage[] = await resp.json();

  // Hook up the query button.
  form.addEventListener('submit', (e: SubmitEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // Clear the results.
    results.innerHTML = '';

    const searchValue = searchInput.value;
    corpus.forEach((page) => {
      if (page.content.includes(searchValue)) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = page.url;
        a.innerText = page.title;
        results.appendChild(li);
      }
    });
  });

  // Enable the query button.
  button.disabled = false;
};

if (document.readyState === 'complete') {
  main();
} else {
  window.addEventListener('DOMContentLoaded', main);
}
