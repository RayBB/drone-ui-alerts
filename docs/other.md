To generate the gif I used quicktime to record the screen and the code snippet below:

``` Javascipt
const statusOrder = ["","pending", "running", "success"]
let temp1 = new DroneAlerter(autoUpdate=false)
let counter = 0
const svg = document.querySelector("svg").outerHTML
for (let i = 0; i < statusOrder.length*10000; i++){
    counter++;
    if (i%4==0) counter++;
    setTimeout(function(){
        temp1.status = statusOrder[i%4]
        temp1.updateFaviconColor()
        setTimeout(function(){
            temp1.updateNavbarIconColor()
        }, 150)// this delay is here because the favicon updates slower
    }, counter*1000)
}
```