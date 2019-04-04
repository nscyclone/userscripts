// ==UserScript==
// @name         Redmine Saved Replies
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Allows to store and use saved replies in Redmine commentaries.
// @author       nscyclone@gmail.com
// @grant        GM.getValue
// @grant        GM.setValue
// ==/UserScript==

(async () => {
  const storageKey = 'redmineSavedReplies';
  const dropdownClass = 'replies-dropdown';
  const textareaSelector = '.jstEditor > textarea';
  const toolbarContainers = [...document.querySelectorAll('.jstElements')];
  const savedReplies = await getReplies();

  toolbarContainers.forEach(async (container) => {
    container.appendChild(await createUI(savedReplies));
  });

  function createButton(caption, handler, title = null) {
    const button = document.createElement('button');
    button.type = 'button';
    button.style.textAlign = 'center';
    button.style.verticalAlign = 'bottom';
    button.style.fontSize = '1.75em';
    button.style.lineHeight = '1em';
    button.style.paddingTop = '0';
    button.style.paddingBottom = '0';
    button.style.color = '#333';
    button.innerText = caption;
    button.setAttribute('title', title);
    button.addEventListener('click', handler);

    return button;
  }

  async function createUI(replies) {
    const replyUI = document.createDocumentFragment();
    const replyDropdown = await createDropDown(replies);
    replyUI.appendChild(replyDropdown);
    replyUI.appendChild(createButton(
      '+',
      () => addReply(getReplyContainer(replyDropdown).value),
      'Add current commentary as a saved reply.',
    ));
    replyUI.appendChild(createButton(
      '-',
      () => removeReply(replyDropdown.selectedIndex),
      'Delete active saved reply.',
    ));

    return replyUI;
  }

  async function createDropDown(replies) {
    const dropdown = document.createElement('select');
    dropdown.className = dropdownClass;
    dropdown.style.width = '250px';
    dropdown.style.textOverflow = 'ellipsis';
    dropdown.style.marginRight = '4px';
    fillDropdownWithReplies(dropdown, replies);
    dropdown.addEventListener('change', () => {
      if (dropdown.selectedIndex !== 0) {
        const reply = dropdown.options[dropdown.selectedIndex].innerText;
        const container = getReplyContainer(dropdown);
        insertReply(reply, container);
      }
    });

    return dropdown;
  }

  function fillDropdownWithReplies(dropdown, replies) {
    dropdown.innerHTML = '';
    [null, ...replies].forEach((reply, replyIndex) => {
      dropdown.appendChild(createOption(reply, replyIndex));
    });

    return dropdown;
  }

  function getAllDropdowns() {
    return [...document.querySelectorAll(`.${dropdownClass}`)];
  }

  function createOption(reply, index) {
    const replyOption = document.createElement('option');
    replyOption.value = index;
    replyOption.innerText = reply;

    return replyOption;
  }

  async function getReplies() {
    return JSON.parse(await GM.getValue(storageKey, '[]'));
  }

  async function saveReplies(replies) {
    return GM.setValue(storageKey, JSON.stringify(replies));
  }

  async function addReply(reply) {
    if (reply.trim()) {
      const replies = await getReplies();
      if (replies.indexOf(reply) === -1) {
        replies.push(reply);
        await saveReplies(replies);
        getAllDropdowns().forEach(
          dropdown => dropdown.appendChild(createOption(reply, replies.length)),
        );
      }
    }
  }

  async function removeReply(replyIndex) {
    if (replyIndex) {
      const replies = await getReplies();
      replies.splice(replyIndex - 1, 1);
      await saveReplies(replies);
      getAllDropdowns().forEach(dropdown => dropdown.remove(replyIndex));
    }
  }

  function insertReply(reply, replyContainer) {
    const start = replyContainer.selectionStart;
    const end = replyContainer.selectionEnd;
    const text = replyContainer.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    replyContainer.value = (before + reply + after);
    replyContainer.selectionStart = start + reply.length;
    replyContainer.selectionEnd = start + reply.length;
    replyContainer.focus();
  }

  function getReplyContainer(dropdown) {
    return dropdown.parentNode.parentNode.querySelector(textareaSelector);
  }
})();
