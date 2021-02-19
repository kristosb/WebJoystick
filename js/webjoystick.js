const JOYSTICK_SERVICE_UUID = 0xBCDE;
 const JOYSTICK_TX = 0xABCD;
 const JOYSTICK_RX = 0xABCE;
 class WebJoysitck {
    constructor() {
      this.device = null;
      this._isEffectSet = false;
      this.joyData = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
      this.joyDataRd = new Uint8Array([0x00,0x00]);
    }
    connect() {
      let options = {filters:[
          { namePrefix: 'MDBT42Q' },
          {services:[ JOYSTICK_SERVICE_UUID ]}
        ]};
      return navigator.bluetooth.requestDevice(options)
      .then(device => {
        this.device = device;
        device.addEventListener('gattserverdisconnected', this.onDisconnected);
        return device.gatt.connect();
      });//.catch(error => console.error(error));
    }
    onDisconnected(event) {
        const device = event.target;
        console.log(`Device ${device.name} is disconnected.`);
      }
    disconnect(){
        this.device.gatt.disconnect();
    }
    sendFrame(){
        return this.device.gatt.getPrimaryService(JOYSTICK_SERVICE_UUID)
        .then(service => service.getCharacteristic(JOYSTICK_TX))
        .then(characteristic => characteristic.writeValue(this.joyData))
        .then(_ => {
          //console.log('write performed');
          //console.log(this.joyData);
        })
        .catch(error => { console.error(error); });     
    }
    readCardata() {
        //var data = new Int8Array([0x00]);
        return this.device.gatt.getPrimaryService(JOYSTICK_SERVICE_UUID)
        .then(service => service.getCharacteristic(JOYSTICK_RX))
        .then(characteristic => characteristic.readValue())
        .then(value => {this.joyDataRd = [value.getUint8(0),value.getUint8(1)];});
      }
    setFrontLights(r) {
            this.joyData[1] =  r ?  this.joyData[1] | 0x01 : this.joyData[1] & 0xFE;
            //console.log(this.joyData[1]);
        }
    Break(r) {
            this.joyData[1] =  r ?  this.joyData[1] | 0x02 : this.joyData[1] & 0xFD;
            //console.log(this.joyData[1]);
          }
    SteerOffset(x) {
            this.joyData[2] = x;
          }
    Gear(x) {
            this.joyData[3] = x;
          }   
    Acceleration(x) {
            this.joyData[4] = x;
          }
    Steering(x) {
            this.joyData[5] = x;
          }            
    HeartBeat(){
        this.joyData[0] = this.joyData[0] + 1;
        if (this.joyData[0]>=255) this.joyData[0] = 0;
    }
    frameLog(){
        console.log(this.joyData);
        console.log(this.joyDataRd);
    }
}