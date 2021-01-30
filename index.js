// ==UserScript==
// @name         Drone Favicon
// @namespace    https://github.com/RayBB/drone-ui-alerts
// @version      0.1
// @description  Drone favicon now represents the current page build status not all builds running.
// @author       RayBB
// @match        https://drone.*/*
// @grant        GM_notification
// @updateURL    https://github.com/RayBB/drone-ui-alerts/blob/main/index.js
// ==/UserScript==

/*
TODO:
Use mutation observer instead of a simple interval https://jsbin.com/livubes/
Create a github repo for this and link it in drone ui repo
*/

(function () {
    'use strict';
    // These match the drone css
    const ICON_COLORS = {
        "success": "#19d78c",
        "running": "#ffbe00",
        "failure": "#ff4164",
        "pending": "#96a5be"
    }
    const DEFAULT_COLOR = 'black';
    const NOTIFICATION_TIMEOUT = 3000; // miliseconds
    const NOTIFICATIONS_ENABLED = true;
    let oldStatus = "";     // the status when last checked
    let oldPage = "";       // the url when last checked

    /*
    * Get the svg string for drone icon with a specific color
    * @param  {string} color    The color for the drone svg
    * @return {string}          drone icon svg
    */
    function getDroneSVG(color = DEFAULT_COLOR) {
        const svg = document.querySelector(".logo svg").outerHTML.replace("currentColor", color)
        const encodedSvg = encodeURIComponent(svg);
        const dataPrefix = "data:image/svg+xml,"
        return dataPrefix + encodedSvg;
    }

    /*
    * Determines if a notification should be sent
    */
    function shouldSendNotification() {
        const currentPage = window.location.href;
        const pageIsSame = oldPage === currentPage; // We don't want to alert on status unless page is same as last status check

        oldPage = currentPage;
        return pageIsSame && NOTIFICATIONS_ENABLED;
    }

    /*
    * Sends a chrome notification of the status change
    */
    function sendNotification(currentStatus) {
        const notificationPromise = GM_notification({
            title: `Status: ${currentStatus}`,
            text: document.querySelector(".repo-item .title").innerText,
            image: getDroneSVG(ICON_COLORS[currentStatus]),
            onclick: window.focus
        });
        setTimeout(notificationPromise.remove, NOTIFICATION_TIMEOUT);
    }

    /*
    * Gets the current status of the first element on the page matching the query selector
    * Currently, this works best for
    */
    function getCurrentStatus() {
        const statusElement = document.querySelector(".repo-item .status");
        const wordsInStatusElementClassName = statusElement.className.replaceAll("-", " ").split(" ");
        const currentStatus = wordsInStatusElementClassName.filter(x => Object.keys(ICON_COLORS).includes(x))[0];
        return currentStatus;
    }

    function updateFaviconColor(currentStatus) {
        const faviconElement = document.querySelector("#favicon");
        faviconElement.href = getDroneSVG(ICON_COLORS[currentStatus]);
    }

    function main() {
        const currentStatus = getCurrentStatus();
        if (oldStatus === currentStatus) return; // if status hasn't changed we don't need to do anything;

        updateFaviconColor(currentStatus);
        if (shouldSendNotification()) {
            sendNotification(currentStatus);
        }
        oldStatus = currentStatus;
    }

    setInterval(main, 1000);
})();

