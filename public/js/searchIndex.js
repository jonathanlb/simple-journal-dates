// Copyright (c) 2017 Jonathan Bredin
// MIT license http://opensource.org/licenses/MIT

/** 
 * Functionality to search and display searh results
 * Requires contentByDate.
 */
const searchIndex = (() => {
  if (typeof require !== 'undefined') { // for tests
    contentByDate = require('./contentByDate');
  }

  function parseYearMonthDateFromUrl(docUrl) {
    return contentByDate.parseYearMonthDate(
      docUrl.match(/-([0-9]{8})\.html$/)[1] || '???');
  }

  /** 
   * Create the search panel.
   */
  function createSearchOptions(
    searchTextName,
    searchResultsDivName,
    contentDivName,
    contentPickerOptions,
    selectTopicOptions)
  {

    /**
     * Return an object with fields from the doc, e.g. year, month, link, id...
     * for contentByDate.contentPickerOptions.updateContent.
     */
    function createResultLink(doc) {
      const [year, month, day] = parseYearMonthDateFromUrl(doc);
      const topic = contentByDate.getTopicName(doc);
      const id = `result-${year}-${month}-${day}-${topic.replace(/\s/g, '-')}`;

      const result = {
        day, doc, id, month, topic, year
      };

      result.link = `<a id="${id}"','${contentDivName}')">${year}/${month}/${day} ${topic}</a>`;
      return result;
    }

    function displaySearchResults(results) {
      const resultsDiv = $(`#${searchResultsDivName}`);
      // make html string to render once -- jquery will terminate hanging elts.
      const links = [];
      var html = `<label>Query:</label>
        <tt> ${results.query} </tt>
        <ol>`; // XXX TODO: escape query string.
      results.docs.forEach(doc => {
        const link = createResultLink(doc);
        links.push(link);
        html += `<li>${link.link}</li>`;
      });
      html += '</ol>';
      resultsDiv.html(html);

      links.forEach(link => {
        $(`#${link.id}`).bind('click', () => { 
          selectTopicOptions.setTopic(link.topic);
          contentPickerOptions.updateContent(link) 
        });
      });
    }

    function searchIndex(query) {
      const url = `solr/${query}`;
      return fetch(url).
        then(response => {
          if (response.ok) {
            return response.json();
          } else {
            console.error(`error searching from ${url}`, response);
          }
        }).then(displaySearchResults);
    };

    const searchText = $(`#${searchTextName}`);
    searchText.on('keyup', e => {
      if (e.keyCode == 13) {
        searchIndex(e.currentTarget.value);
        searchText.val('');
      }
    });

    return {
      searchIndex
    };
  }

  return {
    createSearchOptions: createSearchOptions,
  };

})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = searchIndex;
}
