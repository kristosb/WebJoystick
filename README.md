# WebJoystick
WebBluetooth joystick for use with BolidJS

Test it here: [WebJoystick](https://kristosb.github.io/WebJoystick/).

# setting up development environment 
$ npm init
$ npm i serve
$ node_modules/serve/bin/serve.js

Debugging in chrome:
- make sure vs code has the extension installed "Debugger for Chrome"
- (macos) In a terminal, execute:
$ /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
- optionally Chrome canary: 
$ /Applications/Google\ Chrome\ Canary.app/Contents/MacOS/Google\ Chrome\ Canary --remote-debugging-port=9222

-For TCP ports on hostname "localhost":
 $ serve -l 1234

