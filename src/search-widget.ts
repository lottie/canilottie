/**
 * The file defines the custom element <search-widget> which allows searching
 * over all the caniuse data.
 */
import { CorpusPage } from './common';

const AUTO_SUBMIT_TIMOUT_MS = 1000;

const MAX_RESULTS = 30;

class SearchWidget extends HTMLElement {
  // Loads the JSON data.
  static loadCorpus = async (): Promise<CorpusPage[]> => {
    const resp = await fetch('./allData.json');
    return resp.json();
  };

  static corpusPromise: Promise<CorpusPage[]> = SearchWidget.loadCorpus();

  // If non-zero the value is a window timer handle used to count down
  // AUTO_SUBMIT_TIMOUT_MS after the user stops typing in the search input to
  // automatically trigger the search.
  private autoSubmitTimer: number = 0;

  private form: HTMLFormElement | null = null;

  private input: HTMLInputElement | null = null;

  private results: HTMLUListElement | null = null;

  connectedCallback(): void {
    this.render();
    this.input = this.querySelector<HTMLInputElement>('#search_input')!;
    this.form = this.querySelector<HTMLFormElement>('#form')!;
    this.results = this.querySelector<HTMLUListElement>('#results');

    this.input.addEventListener('input', () => this.textInput());
    this.form.addEventListener('submit', (e) => this.submitForm(e));
  }

  // Renders a single page into displayable results.
  static resultTemplate = (page: CorpusPage): HTMLLIElement => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = page.url;
    a.textContent = page.title;
    li.appendChild(a);
    return li;
  };

  // Renders the initial contents of the element.
  private render() {
    this.innerHTML = `
    <form id=form>
      <input type=text id=search_input />
      <input type=submit value=Query />
    </form>
    <ul id=results>
    </ul>`;
  }

  // Triggers a search if the user presses the submit button of if they press
  // the Return key in the input field.
  private submitForm(e: SubmitEvent) {
    e.stopPropagation();
    e.preventDefault();

    this.doSearch();
  }

  // As key presses arrive we continually bump back the auto submit timer.
  private textInput() {
    if (this.autoSubmitTimer) {
      window.clearTimeout(this.autoSubmitTimer);
      this.autoSubmitTimer = 0;
    }
    this.autoSubmitTimer = window.setTimeout(() => this.doSearch(), AUTO_SUBMIT_TIMOUT_MS);
  }

  private async doSearch() {
    const searchValue: string = this.input!.value;
    let totalResults: number = 0;

    // Clear out the previous search results.
    this.results.innerHTML = '';

    const corpus: CorpusPage[] = await SearchWidget.corpusPromise;
    corpus.forEach((page) => {
      if (totalResults > MAX_RESULTS) {
        return;
      }
      if (page.content.includes(searchValue)) {
        this.results.appendChild(SearchWidget.resultTemplate(page));
        totalResults++;
      }
    });

    // Clear the auto submit timer.
    if (this.autoSubmitTimer) {
      window.clearTimeout(this.autoSubmitTimer);
      this.autoSubmitTimer = 0;
    }
  }
}

customElements.define('search-widget', SearchWidget);
