// Copyright (c) 2017 Jonathan Bredin
// MIT license http://opensource.org/licenses/MIT
//
/**
 * Recursive file-search functions.
 */
const find = (function() {
  const fs = require('fs');
  
  /** 
   * Find files matching the regular expression under the root directory.
   */
  function findFiles(root, regEx, limit) {
    const dirListing = fs.readdirSync(root);
    var results = [];
    
console.log('limit', limit);
    for (var i = dirListing.length - 1; i >= 0; i--) {
      var fileName = `${root}/${dirListing[i]}`
console.log('fileName', fileName);
      if (fs.lstatSync(fileName).isDirectory()) {
        if (limit === undefined) {
          results = results.concat(findFiles(fileName, regEx));
        } else if (limit > 0) {
          results = results.concat(findFiles(fileName, regEx, limit - 1));
        }
      } else if (fileName.match(regEx)) {
console.log('found');
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
