// Copyright (c) 2017 Jonathan Bredin
// MIT license http://opensource.org/licenses/MIT
//
// Bridge from web client to Solr index.
//
// Index with solr/bin/post -c journal/public/content/*/*/*.html
const AsyncRouter = require('express-async-router').AsyncRouter;
const fetch = require('node-fetch');
const router = AsyncRouter();

const contentRoot = /.*\/content\//;
const solrCollection = 'journal';
const solrPort = 8983;

function formatSolrQuery(solrResponse) {
  const docs = solrResponse.response.
    docs.
    map(doc => doc.id).
    filter(id => id.endsWith('.html')).
    map(id => id.replace(contentRoot, ''));
  const result = {
    'docs': docs,
    'query': solrResponse.responseHeader.params.q
  };
  return(JSON.stringify(result));
}

/* Bridge Solr searches on the journal. */
router.get('/:query', function(req, res) {
  const query = req.params.query;
  const url = `http://localhost:${solrPort}/solr/${solrCollection}/select?indent=on&wt=json&q=${query}`;

  return fetch(url).
    then(solrResponse => {
      // console.log('solrResponse', solrResponse);
      if (solrResponse.ok) {
        return solrResponse.json();
      } else {
        console.error(`error from solr ${url}`, solrResponse);
        return res.send('ERROR');
      }
    }).then(solrJson => {
      res.send(formatSolrQuery(solrJson));
    });
});

module.exports = router;
