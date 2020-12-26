
/*var joystickL = nipplejs.create({
    zone: document.getElementById('left'),
    mode: 'static',
    position: { left: '50%', top: '50%' },
    color: 'green',
    size: 200
});*/

/*var joystickR = nipplejs.create({
    zone: document.getElementById('right'),
    mode: 'static',
    position: { left: '50%', top: '50%' },
    color: 'red',
    size: 200,
    shape: "square",
    lockY: true,
    restJoystick:false
});*/

const bottom_zone = document.getElementById('bottom');

var s = function (sel) { return document.querySelector(sel); };
var sId = function (sel) { return document.getElementById(sel); };
var removeClass = function (el, clss) {
    el.className = el.className.replace(new RegExp('\\b' + clss + ' ?\\b', 'g'), '');
}
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
    }).on('move', function (evt, data) {
        debug(data,elsR);
    }).on('dir:up plain:up dir:left plain:left dir:down ' +
        'plain:down dir:right plain:right',
        function (evt, data) {
            dump(evt.type, elDumpR);
        }
    ).on('pressure', function (evt, data) {
        debug({pressure: data},elsR);
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
        position: { left: '50%', top: '50%' },
        color: 'red',
        size: 200,
        shape: "square",
        lockY: true,
        restJoystick:true,
        restPosition: {x:0,y:80}
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


//joystickR.options.position = { left: '80%', top: '50%' };
//console.log(JSON.stringify(joystickR.get(0).options));
//joystickR.get(1).position = {"x":284.25,"y":354.390625}
//joystickR.get(1).setPosition(284.25,354.390625) 
//joystickR.get(1).frontPosition = {"x":0,"y":100}
//joystickR.get(1).frontPosition = {"x":0,"y":50};

//joystickR.get(1).trigger('move');

console.log(JSON.stringify(joystickR.get(1)));

//joystickR.frontPosition = {"x":284.25,"y":354.390625}
////console.log(JSON.stringify(joystickR));

//joystickR.setPosition({ x: 0, y: 80 });
const getPos = function(e){
    //console.log(JSON.stringify(joystickR.position));
    //joystickR.position = { x: '0', y: '100%' }
    //joystickR.setPosition({ x: 480.75, y: 300 });
    //var p = joystickR.position.x;
    //o.log.log(JSON.parse(JSON.stringify(joystickR.position.x)));
    //joystickR.get(1).frontPosition = {"x":0,"y":64};
    console.log(JSON.stringify(joystickR.get(1)));
    o.log.log("aaa");
}

var o = {
    t:TD.toggle({x:10,y:10,width:90,height:90,label:"Front",value:1,name:"toggle", onchange: getPos}),
    b:TD.button({x:110,y:10,width:90,height:90,label:"Start",value:0,name:"button",glyph: "&#xe200", onchange:function(e){o.log.log("Pressed!");}}),
    log:TD.log({x:210,y:10,width:190,height:90,label:"Log",text:"A\nB\nC"}),
    db:TD.button({x:410,y:10,width:90,height:90,label:"del",value:0,name:"delb",glyph: "&#xe200", onchange: getPos}),
    };
  o.log.log("Hello");
  for (var i in o) bottom_zone.appendChild(o[i]);
  
