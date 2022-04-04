/**
 * The file defines the custom element <search-widget> which allows searching
 * over all the caniuse data.
 */

class FeaturesWidget extends HTMLElement {
  private currentView: string = '';

  private viewPrefix: string = 'view-';

  private tabPrefix: string = 'tab-';

  private tabSelectedClass: string = 'navigation__button--selected';

  private noteHighlightClass: string = 'notes-element--highlight';

  private statsByNumClass: string = 'stats-card__content__box__';

  private statsHighlight: string = 'stats-card__content__box--highlight';

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.render();
    this.buildNavigation();
    this.buildNotesHighlights();
  }

  private getFeatureNameFromId(id: string): string {
    const view = id.split('-')[1];
    return view;
  }

  private addNavigationButtonListener(button) {
    const { shadowRoot } = this;
    button.addEventListener('click', () => {
      const viewName = this.getFeatureNameFromId(button.getAttribute('id'));
      if (this.currentView !== '') {
        const viewElement = shadowRoot.querySelector<HTMLElement>(`#${this.viewPrefix}${this.currentView}`);
        if (viewElement) {
          viewElement.style.display = 'none';
        }
      }
      this.showView(viewName);
    });
  }

  private hidePreviousView() {
    const { shadowRoot } = this;
    if (this.currentView !== '') {
      const viewElement = shadowRoot.querySelector<HTMLElement>(`#${this.viewPrefix}${this.currentView}`);
      if (viewElement) {
        viewElement.style.display = 'none';
      }
      const buttonElement = shadowRoot.querySelector<HTMLElement>(`#${this.tabPrefix}${this.currentView}`);
      const elementClassList = buttonElement.classList;
      elementClassList.remove(this.tabSelectedClass);
    }
  }

  private showView(name: string) {
    this.hidePreviousView();
    const { shadowRoot } = this;
    const viewElement = shadowRoot.querySelector<HTMLElement>(`#${this.viewPrefix}${name}`);
    if (viewElement) {
      viewElement.style.display = 'block';
      this.currentView = name;
      const buttonElement = shadowRoot.querySelector<HTMLElement>(`#${this.tabPrefix}${name}`);
      const elementClassList = buttonElement.classList;
      elementClassList.add(this.tabSelectedClass);
    }
  }

  private buildNavigation() {
    const { shadowRoot } = this;
    const navigation = shadowRoot.querySelector<HTMLElement>('#navigation')!;
    Array.prototype.forEach.call(navigation.children, (child: HTMLElement) => {
      this.addNavigationButtonListener(child);
    });
    // Setting as visible the first element on tab
    if (navigation.children.length) {
      const viewName = this.getFeatureNameFromId(navigation.children[0].getAttribute('id'));
      this.showView(viewName);
    }
  }

  private buildNotesHighlights() {
    const { shadowRoot } = this;
    const notesHighlight = shadowRoot.querySelectorAll<HTMLElement>(`.${this.noteHighlightClass}`);
    notesHighlight.forEach((highlight) => {
      const id = highlight.getAttribute('id');
      const highlightLabel = id.split('-')[1];
      const stats = document.querySelectorAll<HTMLElement>(`.${this.statsByNumClass}${highlightLabel}`);
      highlight.addEventListener('mouseover', () => {
        stats.forEach((stat) => {
          const statClassList = stat.classList;
          statClassList.add(this.statsHighlight);
        });
      });
      highlight.addEventListener('mouseout', () => {
        stats.forEach((stat) => {
          const statClassList = stat.classList;
          statClassList.remove(this.statsHighlight);
        });
      });
    });
  }

  // Renders the initial contents of the element.
  private render() {
    const { shadowRoot } = this;
    const searchWidgetTemplate: HTMLTemplateElement = document.querySelector('#features-widget-template');

    const mainWidget = document.importNode(searchWidgetTemplate.content, true);
    shadowRoot.appendChild(mainWidget);
  }
}

customElements.define('features-widget', FeaturesWidget);
