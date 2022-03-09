import '../css/index.scss';

import { html, render, TemplateResult } from 'lit-html';
import { CorpusPage } from './common';

const main = async () => {
  const AUTO_SUBMIT_TIMOUT_MS = 1000;
  const MAX_RESULTS = 30;

  const searchInput = document.querySelector<HTMLInputElement>('#search_input')!;
  const results = document.querySelector<HTMLUListElement>('#results')!;
  const button = document.querySelector<HTMLInputElement>('#submit')!;
  const form = document.querySelector<HTMLFormElement>('#form')!;

  /** The handle of a timer that will trigger searching. Value of 0 if there is
   * no pending timer. */
  let autoSubmitTimer: number = 0;

  // Load the search corpus.
  const resp = await fetch('./allData.json');
  const corpus: CorpusPage[] = await resp.json();

  const template = (page: CorpusPage): TemplateResult => html`
    <li><a href="${page.url}">${page.title}</a></li>
  `;

  /** Does the actual search work and populates the results. */
  const doSearch = () => {
    const searchValue: string = searchInput.value;
    const templateResults: TemplateResult[] = [];
    let totalResults: number = 0;

    corpus.forEach((page) => {
      if (totalResults > MAX_RESULTS) {
        return;
      }
      if (page.content.includes(searchValue)) {
        templateResults.push(template(page));
        totalResults++;
      }
    });
    render(templateResults, results);

    // Clear any pending search.
    if (autoSubmitTimer) {
      window.clearTimeout(autoSubmitTimer);
      autoSubmitTimer = 0;
    }
  };

  // Hook up the query button.
  form.addEventListener('submit', (e: SubmitEvent) => {
    e.stopPropagation();
    e.preventDefault();

    doSearch();
  });

  // Watch as new characters are entered into the input and
  // AUTO_SUBMIT_TIMOUT_MS after the last character is entered then trigger the
  // search w/o the need for the user to press enter.
  searchInput.addEventListener('input', () => {
    if (autoSubmitTimer) {
      window.clearTimeout(autoSubmitTimer);
      autoSubmitTimer = 0;
    }
    autoSubmitTimer = window.setTimeout(doSearch, AUTO_SUBMIT_TIMOUT_MS);
  });

  // Enable the query button now that all setup is complete.
  button.disabled = false;
};

// Only run our code once the DOM is loaded.
if (document.readyState === 'complete') {
  main();
} else {
  window.addEventListener('DOMContentLoaded', main);
}
