import { CorpusPage } from './common';

const AUTO_SUBMIT_TIMOUT_MS = 1000;
const MAX_RESULTS = 30;

const loadCorpus = async (): Promise<CorpusPage[]> => {
  const resp = await fetch('./allData.json');
  return resp.json();
};

const resultTemplate = (page: CorpusPage): HTMLLIElement => {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = page.url;
  a.textContent = page.title;
  li.appendChild(a);
  return li;
};

class SearchWidget extends HTMLElement {
  static corpusPromise: Promise<CorpusPage[]> = loadCorpus();

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

  private render() {
    this.innerHTML = `
    <form id=form>
      <input type=text id=search_input />
      <input type=submit value=Query />
    </form>
    <ul id=results>
    </ul>`;
  }

  private submitForm(e: SubmitEvent) {
    e.stopPropagation();
    e.preventDefault();

    this.doSearch();
  }

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
        this.results.appendChild(resultTemplate(page));
        totalResults++;
      }
    });

    // Clear any pending search.
    if (this.autoSubmitTimer) {
      window.clearTimeout(this.autoSubmitTimer);
      this.autoSubmitTimer = 0;
    }
  }
}

customElements.define('search-widget', SearchWidget);
