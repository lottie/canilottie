import { CanIUseData, CanIUseDataStats, Product, YesNo } from '../common';

const renderTitle = (data: CanIUseData) => `
<section class="expand-page__header">
  <h1
    class="expand-page__header__title"
  >
    <a
      href="${data.spec}"
      class="expand-page__header__title__link"
    >
        ${data.title}
      </a>
  </h1>
  <p class="expand-page__header__description">${data.description}</p>
</section>
`;

const buildContentBox = (version: string, value: YesNo) => {
  const classes = ['stats-card__content__box'];
  if (value === 'y') {
    classes.push('stats-card__content__box--supported');
  } else {
    classes.push('stats-card__content__box--unsupported');
  }
  return `
    <div class="${classes.join(' ')}">
      ${version}
    </div>
  `
}

const renderCard = (name: string, stat: Product) => `
<div class="stats-card">
  <div class="stats-card__header">
    ${name}
  </div>
  <div class="stats-card__content">
    ${Object.keys(stat).map((key: string) => buildContentBox(key, stat[key])).join('')}
  </div>
</div>
`;

const renderPlayersTable = (stats: CanIUseDataStats) => `
  <section class="expand-page__stats">
    <div class="expand-page__stats__grid">
      ${Object.keys(stats).map((key: string) => renderCard(key, stats[key])).join('')}
    </div>
  </section>
`;

const template = (data: CanIUseData) => `
  <!DOCTYPE html>
  <html>
  <head>
      <title>${data.title}</title>
      <meta charset="utf-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="./styles/styles.css" />
  </head>
  <body class="expand-page">
  ${renderTitle(data)}
  ${renderPlayersTable(data.stats)}
  <section>
      <h2>Notes</h2>
      <p>${data.notes}</p>
  </section>
  </body>
  </html>
`;

export default template;
