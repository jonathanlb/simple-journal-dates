# simple-journal-dates
Keep todos, book-lists, and other notes by date.
![Alt text](screenshots/simple-journal-dates.png?raw=true "simple-journal-dates example view")

## Motivation
simple-journal-dates presents by-date html content, browseable using the date selector.
It's meant to be a simple front end to review a small corpus of personal notes -- todos, reading notes, etc -- for a single author using a small set of dependencies.

## Installation
- Clone simple-journal-dates and set a link to your dated content:
  ```bash
  git clone https://github.com/jonathanlb/simple-journal-dates.git
  cd simple-journal-dates/public
  ln -s <your-content-directory> content
  ```
- [Download jquery](https://jquery.com/download/) into public/js/lib/jquery.js
  ```bash
  curl https://code.jquery.com/jquery-3.2.1.js > public/js/lib/jquery.js
  ```
- [Download jquery-ui](https://jqueryui.com/download/) and choose theme to suit.
  Place the resulting code in public/js/lib/jquery-ui.js ; the stylesheets in public/css ; and images in public/css/images
- [Set up npm dependencies](https://docs.npmjs.com/getting-started/using-a-package.json)
  ```bash
  npm init
  npm install
  ```
- Optionally, run the tests
  ```bash
  npm test
  ```
- For search functionality, run [solr](http://lucene.apache.org/solr/)
  ```${SOLR_HOME}/bin/solr start -e cloud -noprompt```
  or hide the text-search div in public/journal.html or public/css/journal.css.
  
  Create a collection journal
  ```curl 'http://localhost:8983/solr/admin/collections?action=CREATE&name=test-collection&numShards=2&replicationFactor=2'```
  You will need to index periodically the content
  ```${SOLR_HOME}/bin/post -c journal public/content/*/*/*html```
- Start the server
  ```bash
  DEBUG=journal:* npm start
  ```
- Stop the server with ctl-c, etc.
