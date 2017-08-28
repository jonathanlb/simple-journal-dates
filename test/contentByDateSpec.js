// Copyright (c) 2017 Jonathan Bredin
// MIT license http://opensource.org/licenses/MIT

const chai = require('chai');
const expect = chai.expect;
const contentByDate = require('../public/js/contentByDate');
const fetchMock = require('fetch-mock');

describe('content by date module', () => {
  after(() => {
    fetchMock.restore();
  });

  before(() => {
    const chaiAsPromised = require('chai-as-promised');
    chai.use(chaiAsPromised);

    $ = require('../public/js/lib/jquery');
    global.jQuery = $;
    const jqueryui = require('../public/js/lib/jquery-ui');

    fetchMock.get('getDates/todo/2017/06', []);
    fetchMock.get(
      'getDates/todo/2017/07',
      ['public/content/2017/07/todo-20170704.html', 
        'public/content/2017/07/todo-20170708.html']);
    fetchMock.get('getDates/todo/2017/08', []);

    fetchMock.get(
      'content/2017/07/todo-20170708.html',
      '<div>I did something!</div>');

    fetchMock.get('getDates/reading/2017/06', []);
    fetchMock.get('getDates/reading/2017/07', []);
    fetchMock.get('getDates/reading/2017/08', []);
  });
  
  it('can instantiate a date picker', () => {    
    const dpArgs = contentByDate.createContentPickerOptions(
      'datepicker', 'content', 'todo');
    dpArgs.defaultDate = new Date(2017, 06, 08);
    $('#datepicker').datepicker(dpArgs);
  });

  it('can instantiate a topic selector', () => {    
    const setTopic = (topic) => topic;
    const selectArgs = contentByDate.createTopicSelectorOptions(setTopic);
    const menu = $('#topic-select-menu').selectmenu(selectArgs);
    const event = { item: { label: 'Reading' } };
    expect(selectArgs.change(undefined, event)).to.equal('Reading');
  });

  it('handles onSelect by fetching content', () => {
    $(document.documentElement).html('<div id=content>previous content</div>');

    const yyyymmdd = '20170708';
    const dateStr = '2017-07-08';
    const date = contentByDate._createDate(yyyymmdd);
    const dpArgs = contentByDate.createContentPickerOptions(
      'datepicker', 'content', 'todo');
    dpArgs.defaultDate = date;

    const previousContent = $(document.documentElement).html();
    expect(previousContent.includes('previous content')).to.equal(true);

    const selectResponse = dpArgs.onSelect(dateStr).
      then(() => {
        const content = $(document.documentElement).html();
        return !content.includes('previous content') &&
          content.includes('I did something');
      });
    return expect(selectResponse).to.eventually.equal(true);
  });

  it('initially shows dates unjournaled', () => {
    const dpArgs = contentByDate.createContentPickerOptions(
      'datepicker', 'content', 'todo');
    const date = contentByDate._createDate('20170704');

    const initResponse = dpArgs.beforeShowDay(date);
    expect(initResponse).to.deep.equal([false]);
  });

  it('update content externally', () => {
    $(document.documentElement).html(
      `<select id="topic-select-menu">
        <option>Notes</option>
        <option selected="selected">Todo</option>
      </select>
      <div id=datepicker></div>
      <div id="content"></div>`);

    const dpArgs = contentByDate.createContentPickerOptions(
      'datepicker', 'content', 'todo');
    dpArgs.defaultDate = new Date(2017, 06, 04);
    const selectTopicOptions = contentByDate.createTopicSelectorOptions(
      dpArgs.setTopic, 'topic-select-menu');

    $('#topic-select-menu').selectmenu(selectTopicOptions);
    $('#datepicker').datepicker(dpArgs);

    dpArgs.updateContent({
      doc: '2017/07/todo-20170708.html',
      month: 07,
      topic: 'Todo',
      year: 2017
    });
  });

  it('updates dates', () => {
    const yyyymmdd = '20170702';
    const date = contentByDate._createDate(yyyymmdd);
    const dpArgs = contentByDate.createContentPickerOptions(
      'datepicker', 'content', 'todo');

    expect(dpArgs._isDateJournaled('todo', date)).to.equal(false);
    dpArgs.setDates('todo', ['blah/blah/2017/07/todo-20170702.html']);
    expect(dpArgs._isDateJournaled('todo', date)).to.equal(true);
  });

  it('updates dates using fetch/promises', () => {
    const yyyymm = '201707';
    const yyyymmdd = yyyymm + '04';
    const date = contentByDate._createDate(yyyymmdd);
    const dpArgs = contentByDate.createContentPickerOptions(
      'datepicker', 'content', 'todo');

    expect(dpArgs._isDateJournaled('todo', date)).to.equal(false);
    const fetchResponse = dpArgs.fetchDates('todo', yyyymm).
      then(() => 
        dpArgs._isDateJournaled('todo', date));
    return expect(fetchResponse).to.eventually.equal(true);
  });

  it('updates month year selection', () => {
    const dpArgs = contentByDate.createContentPickerOptions(
      'datepicker', 'content', 'todo');
    // check/cover types
    expect(typeof dpArgs.onChangeMonthYear(2017, 07, null)).to.equal('object'); 
  });

  it('updates topics', () => {
    $(document.documentElement).html('<div id=datepicker></div>');
    const date = new Date(2017, 06, 08);

    const initialTopic = 'reading';
    const dpArgs = contentByDate.createContentPickerOptions(
      'datepicker', 'content', initialTopic);
    dpArgs.defaultDate = date;

    const datepicker = $('#datepicker').datepicker(dpArgs);

    const newTopic = 'Todo';
    expect(dpArgs.setTopic(newTopic)).to.equal(initialTopic);
  });
});

describe('content by date module utilities', () => {
  it('can create dates from yyyymmdd strings', () => {
    const date = contentByDate._createDate('20170704');
    expect(date.getFullYear()).to.equal(2017);
    expect(date.getMonth()).to.equal(6);
    expect(date.getDate()).to.equal(4);
  });

  it('can get YYYYMM string keys from dates', () => {
    const date = contentByDate._createDate('20170704');
    const yyyymm = contentByDate._getYYYYMM(date);
    expect(yyyymm).to.equal('201707');
  });

  it('can parse dashed date strings', () => {
    const [year, month, day] = contentByDate.parseYearMonthDate('2017-07-04');
    expect(year).to.equal('2017');
    expect(month).to.equal('07');
    expect(day).to.equal('04');
  });

  it('can parse date strings', () => {
    const [year, month, day] = contentByDate.parseYearMonthDate('20170704');
    expect(year).to.equal('2017');
    expect(month).to.equal('07');
    expect(day).to.equal('04');
  });

  it('can parse slashed date strings', () => {
    const [year, month, day] = contentByDate.parseYearMonthDate('2017/07/04');
    expect(year).to.equal('2017');
    expect(month).to.equal('07');
    expect(day).to.equal('04');
  });

  it('can parse yyyymm strings', () => {
    const [year, month, day] = contentByDate.parseYearMonthDate('201707');
    expect(year).to.equal('2017');
    expect(month).to.equal('07');
  });

});
