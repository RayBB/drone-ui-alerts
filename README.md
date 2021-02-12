# drone-ui-alerts
drone.io ui gets updating favicon and desktop notifications

## What does this do

It makes the drone-ui favicon refelect the status of the pipeline on the current page instead of the status of all pipelines running.

It also sends a notification when your pipeline changes status.

<img src="update.gif" alt="colors updating" height="150px"/>

## Why

Because it is very annoying to have to keep checking the drone page for updates instead of looking at the favicon or seeing a notification. There is an [open issue](https://github.com/drone/drone-ui/issues/290) in the drone-ui repo about this.

## Installation

This script was designed to be used with [Violentmonkey](https://violentmonkey.github.io/) but should also work with [Greasemonkey](https://wiki.greasespot.net/Greasemonkey) or [Tampermonkey](https://www.tampermonkey.net/).

To use this script just install one of the extension above, click [create new script](https://violentmonkey.github.io/guide/creating-a-userscript/), and paste [this](https://github.com/RayBB/drone-ui-alerts/blob/main/index.js) script in.

You should upate the `@match` section at the top of the script with the url of your drone installation.

## Bookmarklets

If you'd like to make a [bookmarket](https://en.wikipedia.org/wiki/Bookmarklet) to run as needed instead of installing an extension you can do that [here](https://chriszarate.github.io/bookmarkleter/). Notifications won't work with the bookmarklet since it depends on the Greasemonkey api.

### Next Steps

* Use getValue for preferences https://violentmonkey.github.io/api/gm/#gm_getvalue
* Use a more object oriented approach
* Evaluate using the [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) instead of polling

## Learnings

* You cannot use CSS to change SVGs when they are encoded in `img` tags. Otherwise I would use css to [change the svg color](https://css-tricks.com/lodge/svg/09-svg-data-uris/).
* You [don't](https://css-tricks.com/probably-dont-base64-svg/) need to base64 encode [data URI](https://en.wikipedia.org/wiki/Data_URI_scheme), but you may need to encode them with [encodeURIComponent](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent).
