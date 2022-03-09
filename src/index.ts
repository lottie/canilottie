import '../css/index.scss';

import {
  html, render, TemplateResult,
} from 'lit';
import { CorpusPage } from './common';

const AUTO_SUBMIT_TIMOUT_MS = 1000;
const MAX_RESULTS = 30;

const loadCorpus = async (): Promise<CorpusPage[]> => {
  const resp = await fetch('./allData.json');
  return resp.json();
};

class SearchWidget extends HTMLElement {
  static corpusPromise: Promise<CorpusPage[]> = loadCorpus();

  private autoSubmitTimer: number = 0;

  private input: HTMLInputElement | null = null;

  private matchingPages: CorpusPage[] = [];

  static template = (ele: SearchWidget): TemplateResult => html`
    <form id=form @submit=${ele.submitForm}>
      <input type=text id=search_input @input=${ele.textInput} />
      <input type=submit value=Query />
    </form>
    <ul>
      ${ele.matchingPages.map((page: CorpusPage): TemplateResult => html`
        <li><a href="${page.url}">${page.title}</a></li>
      `)}
    </ul>`;

  connectedCallback(): void {
    this.render();
    this.input = this.querySelector('#search_input');
  }

  render() {
    render(SearchWidget.template(this), this, { host: this });
  }

  submitForm(e: SubmitEvent) {
    e.stopPropagation();
    e.preventDefault();

    this.doSearch();
  }

  textInput() {
    if (this.autoSubmitTimer) {
      window.clearTimeout(this.autoSubmitTimer);
      this.autoSubmitTimer = 0;
    }
    this.autoSubmitTimer = window.setTimeout(() => this.doSearch(), AUTO_SUBMIT_TIMOUT_MS);
  }

  async doSearch() {
    const searchValue: string = this.input!.value;
    let totalResults: number = 0;

    const corpus: CorpusPage[] = await SearchWidget.corpusPromise;
    this.matchingPages = [];
    corpus.forEach((page) => {
      if (totalResults > MAX_RESULTS) {
        return;
      }
      if (page.content.includes(searchValue)) {
        this.matchingPages.push(page);
        totalResults++;
      }
    });

    this.render();

    // Clear any pending search.
    if (this.autoSubmitTimer) {
      window.clearTimeout(this.autoSubmitTimer);
      this.autoSubmitTimer = 0;
    }
  }
}

customElements.define('search-widget', SearchWidget);
