// ==UserScript==
// @name         PoE2 Trade Auto Whisper
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Allows to direct whisper on newest trade items automatically.
// @author       nscyclone@gmail.com
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @match        https://www.pathofexile.com/trade2/*
// @grant        none
// ==/UserScript==

/* globals jQuery, $, waitForKeyElements */

(async () => {
    const resultsSelector = '.results';

    function observe() {
        const observer = new MutationObserver(mutations => {
            for (let mutation of mutations) {
                if (mutation.type === "childList") {
                    mutation.addedNodes && mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1 && node.classList.contains("row")) {
                            let whisper = node.querySelector('.direct-btn');
                            whisper && whisper.click();
                        }
                    })
                }
            }
        });

        observer && observer.disconnect();
        observer.observe(document.querySelector(resultsSelector), {attributes: false, childList: true, subtree: true});
    }

    waitForKeyElements(resultsSelector, observe)
})();
