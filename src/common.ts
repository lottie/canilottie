/** CorpusPage has data for a single page. */
export interface CorpusPage {
  // Relative URL of the page.
  url: string

  /** The page title. */
  title: string

  /** A stripped down CanIUseData serialized as JSON. */
  content: string
}

export interface Link {
  url: string
  title: string
}

export type YesNo = 'y' | 'n'

export type Product = { [key: string]: YesNo}

export interface VersionStat {
  version: string
  className: string
}

export interface ProductStat {
  name: string
  product: Product
}

export interface SupportStats {
  [key: string]: Product
}

export interface NotesByNum {
  [key: string]: string
}

/** The format of the CanIUse data. */
export interface CanIUseData {
  title: string
  description: string
  spec: string
  links: Link[]
  categories: string[],
  stats: SupportStats
  notes: string
  parent: string
  keywords: string

  // TODO(jcgregorio) Figure out the shape of the following:
  bugs: any[]
  notes_by_num: NotesByNum,
}

export type CanIUseSearchableData = Omit<CanIUseData, 'stats'>
