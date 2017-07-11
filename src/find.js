// Copyright (c) 2017 Jonathan Bredin
// MIT license http://opensource.org/licenses/MIT
//
/**
 * Recursive file-search functions.
 */
const find = (function() {
  const fs = require('fs');
  
  /** Find files matching the regular expression under the root directory. */
  function findFiles(root, regEx) {
    const dirListing = fs.readdirSync(root);
    var results = [];
    
    for (var i = dirListing.length - 1; i >= 0; i--) {
      var fileName = `${root}/${dirListing[i]}`
      if (fs.lstatSync(fileName).isDirectory()) {
        results = results.concat(findFiles(fileName, regEx));
      } else if (fileName.match(regEx)) {
        results.push(fileName);
      }
    }
    
    return results;
  }
  
  return {
    'findFiles': findFiles
  };
})();

module.exports = find;
