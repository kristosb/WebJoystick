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
var bolidConn = new WebJoysitck();
const joyMaxVal = 255;
const botCtrlWidth = 90;
const accDivMax = 25;
const fuelDivMax = 28;
var start;
var updateRate = 300; //ms
var bottomControls = {
    btConnect:TD.toggle({x:10,y:10,width:botCtrlWidth,height:90,label:"Conect",value:0,name:"Connection",onchange:handleConnection}),
    frontLights:TD.toggle({x:10+botCtrlWidth,y:10,width:botCtrlWidth,height:90,label:"HeadLights",value:0,name:"toggleFront",onchange:toggleHeadLights}),
    b:TD.button({x:10+2*botCtrlWidth,y:10,width:botCtrlWidth,height:90,label:"FullScreen",value:0,name:"button",glyph: "&#x1f501;", onchange:function(e){bottomControls.log.log("fs"); toggleFullScreen();}}),
    steeroffset:TD.value({x:10+3*botCtrlWidth,y:10,width:2*botCtrlWidth,height:90,label:"SteeringOffset",value:"0",min:-100,step:1,max:100}),
    log:TD.log({x:10+5*botCtrlWidth,y:10,width:190,height:90,label:"Log",text:""})
    //db:TD.button({x:410,y:10,width:90,height:90,label:"del",value:0,name:"delb",glyph: "&#xe200",onchange:function(e){toggleFullScreen();}}),
    };
var midSize = {h:160, w: 170 };
var middleControls = {
    acc:TD.gauge({x:0,y:0,width:midSize.w,height:midSize.h,label:"RPMx1000",value:0,min:0,max:Math.floor(joyMaxVal/accDivMax),name:"acc"}),
    speed:TD.gauge({x:0,y:midSize.h,width:midSize.w,height:midSize.h,label:"km/h",value:Math.floor(joyMaxVal/2),min:0,max:joyMaxVal,name:"speed"}),
    fuel:TD.gauge({x:0,y:2*midSize.h,width:midSize.w*0.6,height:midSize.h*0.7,label:"Fuel",value:0,min:0,max:Math.floor(joyMaxVal/fuelDivMax),name:"fuel"}),
    gear:TD.label({x:midSize.w*0.6,y:midSize.h*2,width:midSize.w*0.4,height:midSize.h*0.7,label:"gear",text:"N"})
    };
var gearControls = {
    drive:TD.button({x:0,y:10,width:100,height:100,label:"Drive",value:0,name:"drive",glyph:"&#x44;", onchange:function(e){switchGear(1);}}),
    neutral:TD.button({x:0,y:160,width:100,height:100,label:"Neutral",value:0,name:"neutral",glyph:"&#x4e;",onchange:function(e){switchGear(0);}}),
    reverse:TD.button({x:0,y:310,width:100,height:100,label:"Reverse",value:0,name:"revers",glyph:"&#x52;",onchange:function(e){switchGear(2);}}),
    //break:TD.button({x:410,y:380,width:100,height:100,label:"Break",value:0,name:"break",onchange:function(e){bottomControls.log.log("Break!");}})
    };

var joystick, joystickR;
var elDebug = sId('debug');
var elDebugR = sId('debugR');
var elDump = elDebug.querySelector('.dump');
var elDumpR = elDebugR.querySelector('.dump');
//var headLightButton = sId('ToggleHeadLights');
bolidConn.Steering(Math.floor(joyMaxVal/2));

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
        size: joyMaxVal,
        lockX: true,
        restPosition: {x:0,y:0},
        threshold : 0
    });
    joystickR = nipplejs.create({
        zone: right_zone,
        mode: 'static',
        position: { left: '70%', top: '40%' },
        color: 'red',
        size: joyMaxVal,
        shape: "square",
        lockY: true,
        restJoystick:true,
        restPosition: {x:0,y:Math.floor(joyMaxVal/2)},
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
        acceleration = Math.abs(acceleration-Math.floor(joyMaxVal/2));
    }
    if (angle === right){
        acceleration = acceleration+Math.floor(joyMaxVal/2);
    }
    if(evt === "end") acceleration = end;
    return acceleration;
}
// Print data into dash
function readJoystickR (event , obj, ctrlIn) {
   /* var timestamp = Date.now();
    if (start === undefined)
        start = timestamp;
    const elapsed = timestamp - start;
    if (elapsed >= updateRate) { // execute after 
        var acc = readObj(event,obj,ctrlIn, 270, 90, 0);
        ctrlIn.acc.setValue(acc/accDivMax);
        start = timestamp;
    }*/
    

    //setTimeout(function () {
        var acc = readObj(event,obj,ctrlIn, 270, 90, 0);
        if(acc == 0.5){
            //break    
            ctrlIn.acc.setValue(0);
            bolidConn.Acceleration(0);
            bolidConn.Break(1);
            bottomControls.log.log('break');
        }else{
            ctrlIn.acc.setValue(acc/accDivMax);
            bolidConn.Acceleration(acc);
            bolidConn.Break(0);
        }
    //}, 100);
}
function readJoystick (event , obj, ctrlIn) {
    //setTimeout(function () {
        var acc = readObj(event,obj,ctrlIn, 0, 180, Math.floor(joyMaxVal/2));
        ctrlIn.speed.setValue(acc);
        bolidConn.Steering(acc);
    //}, 100);
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
//var bolidConn = new WebJoysitck();



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

/*
 function toggleHeadLights(){
    if (bottomControls.frontLights.pressed){
    console.log('headlights');
    bottomControls.log.log('1');
    UART.write('toggle_front = 1;\n');
    }else{
        bottomControls.log.log('0');
        UART.write('toggle_front = 0;\n');
    }
 }
 */


 /*function handleDevice(){
      navigator.bluetooth.requestDevice({ filters: [
          { namePrefix: 'MDBT42Q' },
          { services: [0xBCDE] }
        ] })
      .then(device => device.gatt.connect())
      .then(server => server.getPrimaryService(0xBCDE))
      .then(service => service.getCharacteristic(0xABCD))
      .then(characteristic => {
        // Writing 1 is the signal to reset energy expended.
        const resetEnergyExpended = Uint8Array.of(1);
        return characteristic.writeValue(resetEnergyExpended);
      })
      .then(_ => {
        console.log('write performed');
      })
      .catch(error => { console.error(error); });

 }*/

 var hbInterval;
 var frameInterval;

function handleConnection(){
    console.log('connection');
    if (bottomControls.btConnect.pressed){
    bottomControls.log.log('1');
    bolidConn.connect().then(function(){
        hbInterval = setInterval(function(){bolidConn.HeartBeat()},100);
        frameInterval = setInterval(function(){bolidConn.SteerOffset(bottomControls.steeroffset.opts.value+127); bolidConn.sendFrame();},100);
        rdFrameInterval = setInterval(function(){bolidConn.readCardata();middleControls.fuel.setValue(Math.floor(bolidConn.joyDataRd[0]/fuelDivMax));},1000);
        logInterval = setInterval(function(){bolidConn.frameLog();},800);
    }).catch(error => console.error(error));
    }else{
        bottomControls.log.log('0');
        clearInterval(hbInterval);
        clearInterval(frameInterval);
        clearInterval(rdFrameInterval);
        clearInterval(logInterval);
        bolidConn.disconnect();
    }
 }

function toggleHeadLights(){
    console.log('headlights');
    if (bottomControls.frontLights.pressed){
    bottomControls.log.log('1');
    bolidConn.setFrontLights(1);
    }else{
        bottomControls.log.log('0');
        bolidConn.setFrontLights(0);
    }
    //bolidConn.sendFrame();
 }
function switchGear(gear){
    
    //var gear =1;
    switch(gear) {
        case 1:
            bottomControls.log.log("Drive!");
            middleControls.gear.setValue("D");
            break;
        case 2:
            bottomControls.log.log("Reverse!");
            middleControls.gear.setValue("R");
            break;
        case 0:
            bottomControls.log.log("Neutral!");
            middleControls.gear.setValue("N");
            break;
        default:
          // code block
      }
      bolidConn.Gear(gear);
}
 //console.log(bottomControls.steeroffset.opts.value);
 //if (bolidConn.device != null){


 //}
//setInterval(function(){bolidConn.HeartBeat()},100);
//setInterval(function(){bolidConn.frameLog();bolidConn.sendFrame();},300);