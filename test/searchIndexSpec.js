// Copyright (c) 2017 Jonathan Bredin
// MIT license http://opensource.org/licenses/MIT

const chai = require('chai');
const expect = chai.expect;
const contentByDate = require('../public/js/contentByDate');
const searchIndex = require('../public/js/searchIndex');
const fetchMock = require('fetch-mock');

describe('search index module', () => {
  after(() => {
    fetchMock.restore();
  });

  before(() => {
    const chaiAsPromised = require('chai-as-promised');
    chai.use(chaiAsPromised);

    $ = require('../public/js/lib/jquery');
    global.jQuery = $;
    const jqueryui = require('../public/js/lib/jquery-ui');

    fetchMock.get('solr/nothing',
      {'query': 'nothing', 'docs': []});
    fetchMock.get('solr/testing',
      {'query': 'testing', 'docs': [
        '2017/08/28/testing-stuff-20170828.html',
        '2017/08/27/testing-stuff-20170827.html']});
  });
  
  it('can instantiate a search widget', () => {    
    const contentPickerOptions = {};
    const searchWidget = searchIndex.createSearchOptions(
      'search-text', 'search-results', 'content', contentPickerOptions);
    return expect(searchWidget.searchIndex('nothing')).not.to.be.null;
  });

  it('can parse search results', () => {    
    $(document.documentElement).html(
      '<div id="search-results">previous content</div>');

    const contentPickerOptions = {};
    const searchWidget = searchIndex.createSearchOptions(
      'search-text', 'search-results', 'content', contentPickerOptions);
    const promise = searchWidget.searchIndex('testing').
      then(() => {
        const results = $('#search-results').html();
        return results.match('testing-stuff-20170827.html') &&
          results.match('testing-stuff-20170828.html') &&
          true;
      });

    return expect(promise).
      to.eventually.equal(true);
  });

});
