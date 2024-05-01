const io = require("socket.io-client");

const socket = io("ws://localhost:3000");

var five = require("johnny-five"),
  board,
  led;

board = new five.Board();

board.on("ready", function () {
  led = new five.Led(13);
  led.strobe(1000); // on off every second
});

socket.emit("message", { hello: "world" });

socket.on("incoming", function (data) {
  console.log(data);
});
