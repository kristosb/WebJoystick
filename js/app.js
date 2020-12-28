const bottom_zone = document.getElementById('bottom');
const middle_zone = document.getElementById('middle');
const left_zone = document.getElementById('left');
const right_zone = document.getElementById('right');
const gear_zone = document.getElementById('buttons');
var elem = document.documentElement;

var s = function (sel) { return document.querySelector(sel); };
var sId = function (sel) { return document.getElementById(sel); };
var removeClass = function (el, clss) {
    el.className = el.className.replace(new RegExp('\\b' + clss + ' ?\\b', 'g'), '');
}


var bottomControls = {
    t:TD.toggle({x:10,y:10,width:90,height:90,label:"HeadLights",value:1,name:"toggle"}),
    b:TD.button({x:110,y:10,width:90,height:90,label:"FullScreen",value:0,name:"button",glyph: "&#x1f501;", onchange:function(e){bottomControls.log.log("fs"); toggleFullScreen();}}),
    log:TD.log({x:210,y:10,width:190,height:90,label:"Log",text:"A\nB\nC"}),
    //db:TD.button({x:410,y:10,width:90,height:90,label:"del",value:0,name:"delb",glyph: "&#xe200",onchange:function(e){toggleFullScreen();}}),
    };
var midSize = {h:160, w: 170 };
var middleControls = {
    acc:TD.gauge({x:0,y:0,width:midSize.w,height:midSize.h,label:"RPMx1000",value:0,min:0,max:10,name:"acc"}),
    speed:TD.gauge({x:0,y:midSize.h,width:midSize.w,height:midSize.h,label:"km/h",value:100,min:0,max:200,name:"speed"}),
    fuel:TD.gauge({x:0,y:2*midSize.h,width:midSize.w*0.6,height:midSize.h*0.7,label:"Fuel",value:5,min:0,max:9,name:"speed"}),
    gear:TD.label({x:midSize.w*0.6,y:midSize.h*2,width:midSize.w*0.4,height:midSize.h*0.7,label:"gear",text:"N"})
    };
var gearControls = {
    drive:TD.button({x:0,y:10,width:100,height:100,label:"Drive",value:0,name:"drive",glyph:"&#x44;", onchange:function(e){bottomControls.log.log("Drive!");middleControls.gear.setValue("D");}}),
    neutral:TD.button({x:0,y:160,width:100,height:100,label:"Neutral",value:0,name:"neutral",glyph:"&#x4e;",onchange:function(e){bottomControls.log.log("Neutral!");middleControls.gear.setValue("N");}}),
    reverse:TD.button({x:0,y:310,width:100,height:100,label:"Reverse",value:0,name:"revers",glyph:"&#x52;",onchange:function(e){bottomControls.log.log("Reverse!");middleControls.gear.setValue("R");}}),
    //break:TD.button({x:410,y:380,width:100,height:100,label:"Break",value:0,name:"break",onchange:function(e){bottomControls.log.log("Break!");}})
    };

var joystick, joystickR;
var elDebug = sId('debug');
var elDebugR = sId('debugR');
var elDump = elDebug.querySelector('.dump');
var elDumpR = elDebugR.querySelector('.dump');

function debugContainer(debugId){
    var elements  = {
        position: {
            x: debugId.querySelector('.position .x .data'),
            y: debugId.querySelector('.position .y .data')
        },
        force: debugId.querySelector('.force .data'),
        pressure: debugId.querySelector('.pressure .data'),
        distance: debugId.querySelector('.distance .data'),
        angle: {
            radian: debugId.querySelector('.angle .radian .data'),
            degree: debugId.querySelector('.angle .degree .data')
        },
        direction: {
            x: debugId.querySelector('.direction .x .data'),
            y: debugId.querySelector('.direction .y .data'),
            angle: debugId.querySelector('.direction .angle .data')
        }
    };
    return elements;
}
var els = debugContainer(elDebug);
var elsR = debugContainer(elDebugR);

createNipple();

function bindNipple () {
    joystick.on('start end', function (evt, data) {
        dump(evt.type,elDump);
        debug(data, els);
        readJoystick(evt.type,data,middleControls);
    }).on('move', function (evt, data) {
        debug(data,els);
        readJoystick(evt.type,data,middleControls);
    }).on('dir:up plain:up dir:left plain:left dir:down ' +
        'plain:down dir:right plain:right',
        function (evt, data) {
            dump(evt.type, elDump);
        }
    ).on('pressure', function (evt, data) {
        debug({pressure: data}, els);
    });

    joystickR.on('start end', function (evt, data) {
        dump(evt.type,elDumpR);
        debug(data,elsR);
        readJoystickR(evt.type,data,middleControls);
    }).on('move', function (evt, data) {
        debug(data,elsR);
        readJoystickR(evt.type,data,middleControls);
    }).on('dir:up plain:up dir:left plain:left dir:down ' +
        'plain:down dir:right plain:right',
        function (evt, data) {
            dump(evt.type, elDumpR);
            //readJoystick(evt.type,data,middleControls);
        }
    ).on('pressure', function (evt, data) {
        debug({pressure: data},elsR);
        //readJoystick(evt.type,data,middleControls);
    });
}

function createNipple () {
    joystick = nipplejs.create({
        zone: left_zone,
        mode: 'static',
        position: { left: '50%', top: '50%' },
        color: 'green',
        size: 200,
        lockX: true,
        restPosition: {x:0,y:0},
        threshold : 0
    });
    joystickR = nipplejs.create({
        zone: right_zone,
        mode: 'static',
        position: { left: '70%', top: '40%' },
        color: 'red',
        size: 200,
        shape: "square",
        lockY: true,
        restJoystick:true,
        restPosition: {x:0,y:100},
        threshold : 0
    });
    bindNipple();
}

// Print data into elements
function debug (obj, elsIn) {
    function parseObj(sub, el) {
        for (var i in sub) {
            if (typeof sub[i] === 'object' && el) {
                parseObj(sub[i], el[i]);
            } else if (el && el[i]) {
                el[i].innerHTML = sub[i];
            }
        }
    }
    setTimeout(function () {
        parseObj(obj, elsIn);
    }, 0);
}
//convert dual direction slide into single value
function readObj(evt,sub, el, left, right, end) {
    var acceleration =end;
    var angle = 0;
    for (var i in sub) {
        if (typeof sub[i] === 'object' && el ) {
            for (var j in sub[i]) {
                if (j==='angle') {
                    angle = sub[j].degree;
                }
            }
        } else if (el) {
            if (i==='distance') {
                acceleration = sub[i];                  
            }
        }
    }
    if (angle === left){
        acceleration = Math.abs(acceleration-100);
    }
    if (angle === right){
        acceleration = acceleration+100;
    }
    if(evt === "end") acceleration = end;
    return acceleration;
}
// Print data into dash
function readJoystickR (event , obj, ctrlIn) {
    setTimeout(function () {
        var acc = readObj(event,obj,ctrlIn, 270, 90, 0);
        ctrlIn.acc.setValue(acc/20);
    }, 100);
}
function readJoystick (event , obj, ctrlIn) {
    setTimeout(function () {
        var acc = readObj(event,obj,ctrlIn, 0, 180, 100);
        ctrlIn.speed.setValue(acc);
    }, 100);
}

var nbEvents = 0;

// Dump data
function dump (evt,elDumpIn) {
    setTimeout(function () {
        if (elDumpIn.children.length > 4) {
            elDumpIn.removeChild(elDumpIn.firstChild);
        }
        var newEvent = document.createElement('div');
        newEvent.innerHTML = '#' + nbEvents + ' : <span class="data">' +
            evt + '</span>';
        elDumpIn.appendChild(newEvent);
        nbEvents += 1;
    }, 0);
}

//console.log(JSON.stringify(joystickR.get(1)));

//bottomControls.log.log("Hello");

for (var i in bottomControls) bottom_zone.appendChild(bottomControls[i]);
for (var i in middleControls) middle_zone.appendChild(middleControls[i]);
for (var i in gearControls) gear_zone.appendChild(gearControls[i]);




function toggleFullScreen() {
    var doc = window.document;
    var docEl = doc.documentElement;
  
    var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
  
    if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
      requestFullScreen.call(docEl);
    }
    else {
      cancelFullScreen.call(doc);
    }
  }