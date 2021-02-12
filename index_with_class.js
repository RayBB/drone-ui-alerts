// ==UserScript==
// @name         Drone Favicon Updater
// @namespace    https://github.com/RayBB/drone-ui-alerts
// @version      0.1
// @description  Drone favicon now represents the current page build status not all builds running.
// @author       RayBB
// @match        https://drone.*/*
// @grant        GM_notification
// @updateURL    https://github.com/RayBB/drone-ui-alerts/blob/main/index.js
// @require      https://cdn.jsdelivr.net/gh/CoeJoder/waitForKeyElements.js@v1.2/waitForKeyElements.js
// ==/UserScript==

(function () {
    'use strict';

    const DEFAULT_COLOR = 'black';
    const FAVICON_UPDATE_INTERVAL = 1000; // 1 second to avoid accessing the DOM often
    const NOTIFICATION_TIMEOUT = 3000;
    const NOTIFICATIONS_ENABLED = true;

    const ICON_COLORS = {
        "": DEFAULT_COLOR,
        success: "#19d78c",
        running: "#ffbe00",
        failure: "#ff4164",
        killed: "#ffabba", // This color is my selection rather than taken from the page
        pending: "#96a5be"
    };

    const SELECTORS = Object.freeze({
        favicon: "#favicon",
        svg: ".logo svg",
        buildStatus: ".repo-item .status",
        buildTitle: ".repo-item .title"
    });

    class DroneAlerter {
        constructor(autoUpdate = true) {
            this.status = "";
            this.page = "";
            this.ENCODED_SVG_DATA_URI = "data:image/svg+xml," + encodeURIComponent(document.querySelector(SELECTORS.svg).outerHTML);
            if (autoUpdate) {
                const alerter = this;
                setInterval(() => alerter.checkForPageStatusChange(), FAVICON_UPDATE_INTERVAL);
            }
        }
        statusChanged() {
            this.updateFaviconColor();
            this.updateNavbarIconColor();
            if (this.shouldSendNotification()) {
                this.sendNotification();
            }
        }
        getStatus() {
            const statusElement = document.querySelector(SELECTORS.buildStatus);
            const wordsInStatusElementClassName = statusElement.className.replaceAll("-", " ").split(" ");
            const currentStatus = wordsInStatusElementClassName.filter(x => Object.keys(ICON_COLORS).includes(x))[0];
            return currentStatus;
        }
        checkForPageStatusChange() {
            const newStatus = this.getStatus();
            if (this.status !== newStatus) {
                this.status = newStatus;
                this.statusChanged();
            }
        }
        updateFaviconColor() {
            // we run this query selector every time because it changes after page load
            document.querySelector(SELECTORS.favicon).href = this.getDroneSVG(ICON_COLORS[this.status]);
        }
        updateNavbarIconColor() {
            document.querySelector(SELECTORS.svg).style.color = ICON_COLORS[this.status];
        }
        getDroneSVG(color = DEFAULT_COLOR) {
            return this.ENCODED_SVG_DATA_URI.replace("currentColor", encodeURIComponent(color));
        }
        shouldSendNotification() {
            const pageIsSame = this.page === window.location.href
            this.page = window.location.href;
            return pageIsSame && NOTIFICATIONS_ENABLED;
        }
        sendNotification() {
            const notificationPromise = GM_notification({
                title: `Status: ${this.status}`,
                text: document.querySelector(SELECTORS.buildTitle).innerText,
                image: this.getDroneSVG(ICON_COLORS[this.status]),
                onclick: window.focus
            });
            setTimeout(notificationPromise.remove, NOTIFICATION_TIMEOUT);
        }
    }
    // After the svg is visible on the page, start polling for status changes
    waitForKeyElements(SELECTORS.svg, () => { new DroneAlerter() });
})();
