(async function () {
  const searchInput = document.querySelector('#search_input');
  const results = document.querySelector('#results');

  // Load the search corpus.
  const resp = await fetch('./allData.json');
  const corpus = await resp.json();

  document.querySelector('#search').addEventListener('click', () => {
    // Clear the results.
    results.innerHTML = '';

    const searchValue = searchInput.value;
    corpus.forEach((page) => {
      if (page.content.includes(searchValue)) {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${page.url}">${page.title}</a>`;
        results.appendChild(li);
      }
    });
  });
})();
