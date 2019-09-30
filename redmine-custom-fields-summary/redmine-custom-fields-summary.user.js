// ==UserScript==
// @name         Redmine Custom Fields Summary
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Allows to sum numeric custom fields on the project issues page in Redmine.
// @author       nscyclone@gmail.com
// ==/UserScript==

(() => {
  const issueSelector = '[id^="issue"]';

  insertSummaryRow(getSummary());

  function getFieldName(fieldCell) {
    const fieldNameMatch = fieldCell.nodeType === 1 && fieldCell.className.match(/cf_\d+/i);
    return fieldNameMatch && fieldNameMatch[0] ? fieldNameMatch[0] : null;
  }

  function getSummary() {
    return Array
      .from(document.querySelectorAll(issueSelector))
      .reduce((acc, current) => {
        Array
          .from(current.getElementsByClassName('float'))
          .concat(Array.from(current.getElementsByClassName('int')))
          .forEach((fieldCell) => {
            const fieldName = getFieldName(fieldCell);
            if (fieldName !== null) {
              acc[fieldName] = (acc[fieldName] || 0) + +fieldCell.innerText;
            }
          });
        return acc;
      }, {});
  }

  function insertSummaryRow(summary) {
    const summaryRow = document.querySelector(issueSelector).cloneNode(true);
    summaryRow.id = 'issues-summary';
    summaryRow.className = '';
    summaryRow.style.backgroundColor = '#dbebe2';
    summaryRow.style.fontWeight = 'bold';

    summaryRow.childNodes.forEach((fieldCell) => {
      const fieldName = getFieldName(fieldCell);
      if (fieldName !== null && fieldName in summary) {
        fieldCell.innerText = summary[fieldName].toFixed(2);
      } else {
        fieldCell.innerHTML = '';
      }
    });
    document.querySelector('table.issues').appendChild(summaryRow);
  }
})();
