// Led controller
var ledController = require("neopixel");
// Light detector
var lightSensor = require("@amperka/light-sensor").connect(A0);
// Amount of steps
var steps = 16;
// Amount of leds on a step
var ledsOnStep = 18;
// All leds array
var ledsArray = new Uint8ClampedArray(ledsOnStep * steps * 3);
// Delay between steps lighting
var delay = 200;
var yellowColor = {
    r: 50,
    g: 255,
    b: 178
};
var blackColor = {
    r: 0,
    g: 0,
    b: 0
};
// Threshold of lux which should be interpreted as darkness
var lxLimit = 50;

// Clear leds
ledController.write(A7, ledsArray);

function lightStep(currentIdx, color) {
    for (var i = 0; i < ledsOnStep; i++) {
        ledsArray[currentIdx++] = color.r;
        ledsArray[currentIdx++] = color.g;
        ledsArray[currentIdx++] = color.b;
    }
    return currentIdx;
}

function reverseLightStep(currentIdx, color) {
    for (var i = 0; i < ledsOnStep; i++) {
        ledsArray[currentIdx--] = color.b;
        ledsArray[currentIdx--] = color.g;
        ledsArray[currentIdx--] = color.r;
    }
    return currentIdx;
}

function lightStairTopToBottom(color) {
    var i = 0;
    var interval = setInterval(function () {
        i = lightStep(i, color);
        ledController.write(A7, ledsArray);
        if (i >= ledsArray.length - 1) {
            clearInterval(interval);
        }
    }, delay);
}

function lightStairBottomToTop(color) {
    var i = ledsArray.length - 1;
    var interval = setInterval(function () {
        i = reverseLightStep(i, color);
        ledController.write(A7, ledsArray);
        if (i <= 0) {
            clearInterval(interval);
        }
    }, delay);
}

function isStairsDisabled() {
    return ledsArray[0] === 0 && ledsArray[ledsArray.length - 1] === 0;
}

function isDarkness() {
    return lightSensor.read('lx').toFixed(0) < lxLimit;
}

var lightSwitch;
// Movements detector on the top
setWatch(function () {
    if (isDarkness()) {
        if (isStairsDisabled()) {
            lightStairTopToBottom(yellowColor);
            lightSwitch = setTimeout(function () {
                lightStairTopToBottom(blackColor);
            }, 60000);
        } else {
            lightStairBottomToTop(blackColor);
            if (lightSwitch) {
                clearTimeout(lightSwitch);
            }
        }
    }
}, P4, {
    repeat: true,
    debounce: 5000
});

// Movements detector on the bottom
setWatch(function () {
    if (isDarkness()) {
        if (isStairsDisabled()) {
            lightStairBottomToTop(yellowColor);
            lightSwitch = setTimeout(function () {
                lightStairBottomToTop(blackColor);
            }, 60000);
        } else {
            lightStairTopToBottom(blackColor);
            if (lightSwitch) {
                clearTimeout(lightSwitch);
            }
        }
    }
}, P5, {
    repeat: true,
    debounce: 5000
});