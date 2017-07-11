// Copyright (c) 2017 Jonathan Bredin
// MIT license http://opensource.org/licenses/MIT
//
/** Facilitate access to dated file store.
 * Underlying file storage is structured under
 *   public/content/$yyyy/$mm/$topic-$yyyymmdd.html
 * where the topic name is transformed in setTopic() below
 * to match the filename prefix.
 *
 * The two publicly-exposed methods below are
 * - createContentPickerOptions
 * - createTopicSelectorOptions
 * passed to jquery-ui to build the date-picker and topic-selector widgets
 */
const contentByDate = (() => {
  /** 
   * Take a YYYYMMDD string, perhaps with separators to a Date. 
   */
  function createDate(yyyymmdd) {
    const [year, month, day] = parseYearMonthDate(yyyymmdd);
    return new Date(year, month - 1, day);  
  }

  /** 
   * Create the year-month key for directory look up. 
   */
  function getYYYYMM(date) {
    const month = date.getMonth() + 1;
    const mm = ((month < 10) ? '0' : '') + month
    const yyyy = date.getFullYear();
    return yyyy + mm;  
  }

  /** 
   * Take a YYYYMMDD string, perhaps with separators to the constituent parts.
   */
  function parseYearMonthDate(yyyymmdd) {
    const parts = yyyymmdd.match(
      /([0-9]{4})[\-/ ]?([0-9]{2})[\-/ ]?([0-9]{2})?/);
    return parts.splice(1,3);
  }

  /** 
   * Create the date picker options for jquery-ui.
   */
  function createContentPickerOptions(
    datePickerDivName,
    contentDivName,
    initialTopic)
  {
    var topic = initialTopic;
    const topics2yearmonth = {};
  
    /** 
     * Get the datepicker and apply function, e.g. 
     * datepicker('setDate', '2017-07-01'). 
     */
    function datepicker(...args) {
      return $(`#${datePickerDivName}`).datepicker(...args);
    }

    /**
     * Query back end for dates active for topic.
     */
    function fetchDates(topic, dateStr) {
      const [year, month, day] = parseYearMonthDate(dateStr);
      const url = `getDates/${topic}/${year}/${month}`; 
      
      // prevent repeated empty queries
      topics2yearmonth[year + month] = {};

      return fetch(url).
      then(response => {
          if (response.ok) {
            return response.json();
          } else {
            console.error(`error getting content from ${url}`, response);
          }
      }).then(content => setDates(topic, content));
    }

    /** 
     * Look up whether we've recorded content for the topic and date,
     * perhaps returning false and scheduling read from underlying storage.
     */
    function isDateJournaled(topic, date) {
      const month = date.getMonth() + 1;
      const mm = ((month < 10) ? '0' : '') + month
      const yyyy = date.getFullYear();
      const yyyymm = getYYYYMM(date);
      
      const dates = topics2yearmonth[yyyymm];
      if (dates) {
        return dates[date] || false;
      } else {
        fetchDates(topic, `${yyyy}-${mm}-01`);
        return false;
      }
    }
    
    /** 
     * Record dates with topic content.
     */
    function setDates(topic, datesResponse) {
      if (datesResponse.length) {
        const dates = datesResponse.map(contentStr =>
          contentStr.match(`${topic}-([0-9]{8})`)[1]).
        map(createDate);
        
        const datesObj = {};
        dates.forEach(date => datesObj[date] = true);
        
        topics2yearmonth[getYYYYMM(dates[0])] = datesObj;
      }
      datepicker('refresh');
    }

    /** 
     * Handle widget date selection by parsing date and topic to load content.
     */
    function scheduleDateSelect(dateStr) {
      const [year, month, day] = parseYearMonthDate(dateStr);
      const url = `content/${year}/${month}/${topic}-${year}${month}${day}.html`; 
      return fetch(url).
        then(response => {
          if (response.ok) {
            return response.text();
          } else {
            console.error(`error getting content from ${url}`, response);
          }
        }).then(content => 
          $(`#${contentDivName}`).html(content));
    }

    /** 
     * Set the topic to used to populate the datepicker.
     * Topics will be converted to lowercase and spaces replaced with dashes,
     * to align with file names.
     */
    function setTopic(newTopic) {
      const oldTopic = topic;
      topic = newTopic.toLowerCase().replace('/ /g', '-');
      const date = datepicker('getDate');
      fetchDates(topic, getYYYYMM(date));
      return oldTopic;
    }
    
    return {
      beforeShowDay: (date) => [isDateJournaled(topic, date)],
      dateFormat: 'yy-mm-dd',
      inline: true,
      onChangeMonthYear: (year, month, inst) => {
        datepicker('setDate', `${year}-${month}-01`);
        const yyyymm = year + ((month < 10) ? '0' : '') + month;
        return fetchDates(topic, yyyymm);
      },
      onSelect: scheduleDateSelect,
      setTopic: setTopic,
      _fetchDates: fetchDates,
      _isDateJournaled: isDateJournaled,
      _setDates: setDates
    };
  }
  
  /** 
   * Create the topic selector for jquery-ui.
   */
  function createTopicSelectorOptions(setTopic)
  {
    return {
      change: (event, ui) =>
        setTopic(ui.item.label),
    };
  };

  return {
    createContentPickerOptions: createContentPickerOptions,
    createTopicSelectorOptions: createTopicSelectorOptions,
    _createDate: createDate,
    _getYYYYMM: getYYYYMM,
    _parseYearMonthDate: parseYearMonthDate
  };

})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = contentByDate;
}