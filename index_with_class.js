// ==UserScript==
// @name         Drone Favicon
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
    const ICON_COLORS = {
        "success": "#19d78c",
        "running": "#ffbe00",
        "failure": "#ff4164",
        "pending": "#96a5be"
    }

    const DEFAULT_COLOR = 'black';
    const NOTIFICATION_TIMEOUT = 3000;
    const NOTIFICATIONS_ENABLED = true;

    class DroneAlerter {
        constructor() {
            this.status = "";
            this.page = "";
            this.FAVICON_ELEMENT = document.querySelector("#favicon");
            this.ENCODED_SVG_DATA_URI = "data:image/svg+xml," + encodeURIComponent(document.querySelector(".logo svg").outerHTML);
        }
        statusChanged() {
            console.log("status changed")
            this.updateFaviconColor()
            if (this.shouldSendNotification()) {
                this.sendNotification();
            }
        }
        checkForStatusChange() {
            const statusElement = document.querySelector(".repo-item .status");
            const wordsInStatusElementClassName = statusElement.className.replaceAll("-", " ").split(" ");
            const currentStatus = wordsInStatusElementClassName.filter(x => Object.keys(ICON_COLORS).includes(x))[0];
            if (this.status !== currentStatus) {
                this.status = currentStatus;
                this.statusChanged();
            }
        }
        updateFaviconColor() {
            this.FAVICON_ELEMENT.href = this.getDroneSVG(ICON_COLORS[this.status]);
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
                text: document.querySelector(".repo-item .title").innerText,
                image: this.getDroneSVG(ICON_COLORS[this.status]),
                onclick: window.focus
            });
            setTimeout(notificationPromise.remove, NOTIFICATION_TIMEOUT);
        }
    }

    console.log(new Date())
    waitForKeyElements(".logo svg", () => {
        let d = new DroneAlerter();
        setInterval(() => d.checkForStatusChange(), 1000);
        console.log(new Date())
    });
})();