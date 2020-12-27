const bottom_zone = document.getElementById('bottom');
const middle_zone = document.getElementById('middle');
var elem = document.documentElement;

var s = function (sel) { return document.querySelector(sel); };
var sId = function (sel) { return document.getElementById(sel); };
var removeClass = function (el, clss) {
    el.className = el.className.replace(new RegExp('\\b' + clss + ' ?\\b', 'g'), '');
}

var fullScreenState = true;
var bottomControls = {
    t:TD.toggle({x:10,y:10,width:90,height:90,label:"Front",value:1,name:"toggle"}),
    b:TD.button({x:110,y:10,width:90,height:90,label:"FullScreen",value:0,name:"button",glyph: "&#xe200", onchange:function(e){bottomControls.log.log(fullScreenState); fullScreenState? openFullscreen():closeFullscreen(); fullScreenState=!fullScreenState;}}),
    log:TD.log({x:210,y:10,width:190,height:90,label:"Log",text:"A\nB\nC"}),
    //db:TD.button({x:410,y:10,width:90,height:90,label:"del",value:0,name:"delb",glyph: "&#xe200"}),
    };
var middleControls = {
    acc:TD.gauge({x:0,y:0,width:200,height:180,label:"RPMx1000",value:0,min:0,max:10,name:"acc"}),
    speed:TD.gauge({x:0,y:180,width:200,height:180,label:"km/h",value:0,min:0,max:200,name:"speed"}),
    fuel:TD.gauge({x:0,y:360,width:110,height:100,label:"Fuel",value:5,min:0,max:9,name:"speed"}),
    gear:TD.label({x:110,y:360,width:90,height:100,label:"gear",text:"N"})
    };
var gearControls = {
    drive:TD.button({x:210,y:10,width:100,height:100,label:"Drive",value:0,name:"drive",onchange:function(e){bottomControls.log.log("Drive!");middleControls.gear.setValue("D");}}),
    neutral:TD.button({x:210,y:160,width:100,height:100,label:"Neutral",value:0,name:"neutral",onchange:function(e){bottomControls.log.log("Neutral!");middleControls.gear.setValue("N");}}),
    reverse:TD.button({x:210,y:310,width:100,height:100,label:"Reverse",value:0,name:"revers",onchange:function(e){bottomControls.log.log("Reverse!");middleControls.gear.setValue("R");}}),
    //break:TD.button({x:410,y:380,width:100,height:100,label:"Break",value:0,name:"break",onchange:function(e){bottomControls.log.log("Break!");}})
    };

var joystick, joystickR;
var elDebug = sId('debug');
var elDebugR = sId('debugR');
var elDump = elDebug.querySelector('.dump');
var elDumpR = elDebugR.querySelector('.dump');

var els = {
    position: {
        x: elDebug.querySelector('.position .x .data'),
        y: elDebug.querySelector('.position .y .data')
    },
    force: elDebug.querySelector('.force .data'),
    pressure: elDebug.querySelector('.pressure .data'),
    distance: elDebug.querySelector('.distance .data'),
    angle: {
        radian: elDebug.querySelector('.angle .radian .data'),
        degree: elDebug.querySelector('.angle .degree .data')
    },
    direction: {
        x: elDebug.querySelector('.direction .x .data'),
        y: elDebug.querySelector('.direction .y .data'),
        angle: elDebug.querySelector('.direction .angle .data')
    }
};
var elsR = {
    position: {
        x: elDebugR.querySelector('.position .x .data'),
        y: elDebugR.querySelector('.position .y .data')
    },
    force: elDebugR.querySelector('.force .data'),
    pressure: elDebugR.querySelector('.pressure .data'),
    distance: elDebugR.querySelector('.distance .data'),
    angle: {
        radian: elDebugR.querySelector('.angle .radian .data'),
        degree: elDebugR.querySelector('.angle .degree .data')
    },
    direction: {
        x: elDebugR.querySelector('.direction .x .data'),
        y: elDebugR.querySelector('.direction .y .data'),
        angle: elDebugR.querySelector('.direction .angle .data')
    }
};

createNipple();

function bindNipple () {
    joystick.on('start end', function (evt, data) {
        dump(evt.type,elDump);
        debug(data, els);
    }).on('move', function (evt, data) {
        debug(data,els);
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
        readJoystick(evt.type,data,middleControls);
    }).on('move', function (evt, data) {
        debug(data,elsR);
        readJoystick(evt.type,data,middleControls);
    }).on('dir:up plain:up dir:left plain:left dir:down ' +
        'plain:down dir:right plain:right',
        function (evt, data) {
            dump(evt.type, elDumpR);
            readJoystick(evt.type,data,middleControls);
        }
    ).on('pressure', function (evt, data) {
        debug({pressure: data},elsR);
        readJoystick(evt.type,data,middleControls);
    });
}

function createNipple () {
    joystick = nipplejs.create({
        zone: document.getElementById('left'),
        mode: 'static',
        position: { left: '50%', top: '50%' },
        color: 'green',
        size: 200,
        lockX: true,
        restPosition: {x:0,y:0}
    });
    joystickR = nipplejs.create({
        zone: document.getElementById('right'),
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
// Print data into dash
function readJoystick (event , obj, ctrlIn) {
    function readObj(evt,sub, el) {
        var acceleration =0;
        var angle = 0;
        for (var i in sub) {
            if (typeof sub[i] === 'object' && el ) {
                //var x = sub[i];
                //readObj(sub[i],el);
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
        if (angle === 270){
            acceleration = Math.abs(acceleration-100);
            el.acc.setValue(acceleration/20);
        }
        if (angle === 90){
            acceleration = acceleration+100;
            el.acc.setValue(acceleration/20);
        }
        if(evt === "end") el.acc.setValue(0);
    }
    setTimeout(function () {
        readObj(event,obj,ctrlIn)
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
function readJoystickEvents (evt,ctrlIn) {
    setTimeout(function () {
        if(evt === "end") ctrlIn.speed.setValue(0);
    }, 200);
}

//console.log(JSON.stringify(joystickR.get(1)));

bottomControls.log.log("Hello");

for (var i in gearControls) middle_zone.appendChild(gearControls[i]);
for (var i in bottomControls) bottom_zone.appendChild(bottomControls[i]);
for (var i in middleControls) middle_zone.appendChild(middleControls[i]);

/* View in fullscreen */
function openFullscreen() {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
      elem.msRequestFullscreen();
    }
  }
  
  /* Close fullscreen */
  function closeFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
      document.msExitFullscreen();
    }
  }
