// Copyright (c) 2017 Jonathan Bredin
// MIT license http://opensource.org/licenses/MIT

const expect = require('chai').expect;
const find = require('../src/find');

describe('find module', function() {      
  it('can recursively search directories', function() {
    // point it at any relatively small directory tree.
    expect(find.findFiles(`${__dirname}/../public/js`, 'jquery.js$')).
      to.deep.equal([`${__dirname}/../public/js/lib/jquery.js`]);
  });

  it('returns empty on no match', function() {
    expect(find.findFiles(__dirname, 'not a test')).to.deep.equal([]);
  });
    
  it('returns finds this test', function() {
    expect(find.findFiles(__dirname, 'findSpec.js$')).to.deep.equal(
      [`${__dirname}/findSpec.js`]);
  });
});
