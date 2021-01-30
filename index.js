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
        // # is replaced with %23 because https://stackoverflow.com/questions/61099149/svg-fill-color-not-working-with-hex-colors
        let svg_color = color.replace("#", "%23");
        // Shoutout to this took for making this svg easy https://yoksel.github.io/url-encoder/
        // This svg was copied from the drone ui
        const svg = `%3Csvg viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg' \
               xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Cdefs%3E%3Cpath d='M12.086 5.814l-.257.258 10.514 10.514C20.856 \
               18.906 20 21.757 20 25c0 9.014 6.618 15 15 15 3.132 0 6.018-.836 8.404-2.353l10.568 10.568C48.497 55.447 \
               39.796 60 30 60 13.434 60 0 46.978 0 30 0 19.903 4.751 11.206 12.086 5.814zm5.002-2.97C20.998 1.015 25.378 \
               0 30 0c16.566 0 30 13.022 30 30 0 4.67-1.016 9.04-2.835 12.923l-9.508-9.509C49.144 31.094 50 28.243 50 \
               25c0-9.014-6.618-15-15-15-3.132 0-6.018.836-8.404 2.353l-9.508-9.508zM35 34c-5.03 0-9-3.591-9-9s3.97-9 \
               9-9c5.03 0 9 3.591 9 9s-3.97 9-9 9z' id='a'%3E%3C/path%3E%3C/defs%3E%3Cuse fill='${svg_color}' xlink:href='%23a' \
               fill-rule='evenodd'%3E%3C/use%3E%3C/svg%3E`
        const dataPrefix = "data:image/svg+xml,"
        return dataPrefix + svg;
    }

    /*
    * Determines if a notification should be sent
    */
    function shouldSendNotification(currentStatus) {
        const currentPage = window.location.href;
        const pageIsSame = oldPage === currentPage; // We don't want to alert on status unless page is same as last status check
        const statusHasChanged = oldStatus !== currentStatus; // We don't want to alert unless the status has changed

        oldStatus = currentStatus;
        oldPage = currentPage;
        return pageIsSame && statusHasChanged && NOTIFICATIONS_ENABLED;
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
        updateFaviconColor(currentStatus);
        if (shouldSendNotification(currentStatus)) {
            sendNotification(currentStatus);
        }
    }

    setInterval(main, 1000);
})();

