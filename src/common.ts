/** CorpusPage has data for a single page. */
export interface CorpusPage {
    // Relative URL of the page.
    url: string

    /** The page title. */
    title: string

    /** A stripped down CanIUseData serialized as JSON. */
    content: string
  }
