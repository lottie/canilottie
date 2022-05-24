/**
 * The file defines the custom element <search-widget> which allows searching
 * over all the caniuse data.
 */
import { CorpusPage } from './common';

const AUTO_SUBMIT_TIMOUT_MS = 500;

const MAX_RESULTS = 30;

interface SearchWidgetAttributes extends NamedNodeMap {
  small?: any;
}

class SearchWidget extends HTMLElement {
  // Loads the JSON data.
  static loadCorpus = async (): Promise<CorpusPage[]> => {
    const resp = await fetch('./allData.json');
    return resp.json();
  };

  static corpusPromise: Promise<CorpusPage[]> = SearchWidget.loadCorpus();

  static searchResultTemplate: HTMLTemplateElement = document.querySelector('#search-result');

  // If non-zero the value is a window timer handle used to count down
  // AUTO_SUBMIT_TIMOUT_MS after the user stops typing in the search input to
  // automatically trigger the search.
  private autoSubmitTimer: number = 0;

  private form: HTMLFormElement | null = null;

  private input: HTMLInputElement | null = null;

  private results: HTMLUListElement | null = null;

  private message: HTMLDivElement | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.render();
    const { shadowRoot } = this;
    this.input = shadowRoot.querySelector<HTMLInputElement>('#search_input')!;
    this.form = shadowRoot.querySelector<HTMLFormElement>('#form')!;
    this.results = shadowRoot.querySelector<HTMLUListElement>('#results');
    this.message = shadowRoot.querySelector<HTMLDivElement>('#message');

    this.input.addEventListener('input', () => this.textInput());
    this.form.addEventListener('submit', (e) => this.submitForm(e));
    document.addEventListener('click', (e) => this.checkForClickOutside(e));
  }

  // Renders a single page into displayable results.
  static resultTemplate = (page: CorpusPage, searchValue: string): DocumentFragment => {
    const instance = document.importNode(SearchWidget.searchResultTemplate.content, true);
    const a: HTMLAnchorElement = instance.querySelector('.link');
    a.href = page.url;
    const regEx = new RegExp(searchValue, 'i');
    const matchedPattern = regEx.exec(page.title);
    let resultText = page.title;
    if (matchedPattern) {
      resultText = `${resultText.substring(0, matchedPattern.index)
      }<b>${
        resultText.substring(matchedPattern.index, searchValue.length + matchedPattern.index)
      }</b>${
        resultText.substring(matchedPattern.index + searchValue.length)}`;
    }
    a.innerHTML = resultText;
    return instance;
  };

  // Renders the initial contents of the element.
  private render() {
    const { shadowRoot } = this;
    const searchWidgetTemplate: HTMLTemplateElement = document.querySelector('#search-widget-template');
    const searchWidget = document.importNode(searchWidgetTemplate.content, true);
    // TODO: fix this
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore:next-line
    if (this.attributes.small.value === 'true') {
      const wrapper = searchWidget.querySelector('.wrapper');
      wrapper.setAttribute('class', 'wrapper wrapper--small');
    }
    shadowRoot.appendChild(searchWidget);
  }

  // Triggers a search if the user presses the submit button of if they press
  // the Return key in the input field.
  private submitForm(e: SubmitEvent) {
    e.stopPropagation();
    e.preventDefault();

    this.doSearch();
  }

  private checkForClickOutside(e) {
    // Only need to compare with `this` because listening on document clicks
    // don't go beyoud the shadow dom
    if (e.target !== this) {
      this.results.innerHTML = '';
      this.message.textContent = '';
      this.message.style.display = 'none';
    }
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
    // Clear the auto submit timer.
    if (this.autoSubmitTimer) {
      window.clearTimeout(this.autoSubmitTimer);
      this.autoSubmitTimer = 0;
    }

    const searchValue: string = this.input!.value.toLowerCase().trim();
    if (searchValue === '') {
      return;
    }
    let totalResults: number = 0;

    // Clear out the previous search results.
    this.results.innerHTML = '';
    this.message.textContent = '';
    this.message.style.display = 'none';

    const corpus: CorpusPage[] = await SearchWidget.corpusPromise;
    corpus.forEach((page) => {
      if (totalResults > MAX_RESULTS) {
        return;
      }
      if (page.content.includes(searchValue)) {
        this.results.appendChild(SearchWidget.resultTemplate(page, searchValue));
        totalResults++;
      }
    });

    if (totalResults === 0) {
      this.message.textContent = '0 results found.';
      this.message.style.display = 'block';
    }
  }
}

customElements.define('search-widget', SearchWidget);
