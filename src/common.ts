/** CorpusPage has data for a single page. */
export interface CorpusPage {
  // Relative URL of the page.
  url: string

  /** The page title. */
  title: string

  /** A stripped down CanIUseData serialized as JSON. */
  content: string
}

interface Link {
  url: string
  title: string
}

type YesNo = 'yes' | 'no'

type Product = { [key: string]: YesNo}

/** The format of the CanIUse data. */
export interface CanIUseData {
  title: string
  description: string
  spec: string
  links: Link[]
  categories: string[],
  stats?: {[key: string]: Product}
  notes: string
  parent: string
  keywords: string

  // TODO(jcgregorio) Figure out the shape of the following:
  bugs: any[]
  notes_by_num: any,
}