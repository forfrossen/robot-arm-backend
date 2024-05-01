// initialize everything, web server, socket.io, filesystem, johnny-five
var app = require("http").createServer(handler);
const { Server } = require("socket.io");
const io = new Server(3001, {
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
  },
  cors: {
    origin: "*",
  },
});

//var io = require("socket.io").listen(app);
var fs = require("fs");

const { Animation, Board, Servo, Led, Stepper } = require("johnny-five");

const board = new Board();

const controller = "PCA9685";

var Servos = [
  { name: "baseTurner", servo: {} },
  { name: "shoulder", servo: {} },
  { name: "elbow", servo: {} },
  { name: "wrist", servo: {} },
  { name: "wristTurner", servo: {} },
  { name: "gripper", servo: {} },
];

board.on("ready", () => {
  console.log("Connected");

  Servos[0].servo = new Servo({
    controller,
    fps: 1,
    range: [0, 180],
    pin: 0,
    startAt: 180,
  });

  Servos[1].servo = new Servo({
    controller,
    fps: 1,
    range: [30, 180],
    startAt: 135,
    pin: 1,
  });

  Servos[2].servo = new Servo({
    controller,
    fps: 1,
    range: [0, 180],
    startAt: 130,
    pin: 2,
  });

  Servos[3].servo = new Servo({
    controller,
    fps: 1,
    range: [0, 180],
    inverted: true,
    startAt: 90,
    pin: 3,
  });

  Servos[4].servo = new Servo({
    controller,
    fps: 1,
    range: [0, 180],
    startAt: 150,
    pin: 4,
  });

  Servos[5].servo = new Servo({
    controller,
    fps: 1,
    range: [0, 300],
    startAt: 140,
    pin: 5,
  });

  var k = 0;
  var stepper = new Stepper({
    type: Stepper.TYPE.TWO_WIRE,
    stepsPerRev: 200,
    pins: [11, 12],
  });

  stepper
    .rpm(180)
    .ccw()
    .step(2000, function () {
      console.log("done");
    });

  const led = new Led(13);
  // poll this sensor every second

  //baseTurner.to(180);

  led.blink(500);

  setupSocket(Servos);

  // Create a new `animation` instance.
  const animation = new Animation(Servos[0].servo);

  // Enqueue an animation segment with options param
  // See Animation example and docs for details
  animation.enqueue({
    cuePoints: [0, 0.25, 0.75, 1],
    keyFrames: [
      90,
      { value: 180, easing: "inQuad" },
      { value: 0, easing: "outQuad" },
      90,
    ],
    duration: 2000,
  });

  // Inject the `servo` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    ...Servos[0].servo,
    animation,
  });
});

// make web server listen on port 80
app.listen(3000);
// handle web server
function handler(req, res) {
  const headers = {
    "Access-Control-Allow-Origin": "*" /* @dev First, read about security */,
    "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
    "Access-Control-Max-Age": 2592000, // 30 days
    /** add other headers as per requirement */
  };

  fs.readFile(__dirname + "/index.html", function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end("Error loading index.html");
    }

    res.writeHead(200);
    res.end(data);
  });
}

// on a socket connection
const setupSocket = (servos) =>
  io.on("connection", (socket) => {
    if (socket.recovered) {
      // recovery was successful: socket.id, socket.rooms and socket.data were restored
      console.log("Socket Session recovered!");
    } else {
      // new or unrecoverable session
      console.log("New Socket Session created");
      socket.emit("news", { hello: "world" });

      servos.forEach((item) => {
        console.log("Creating socket listener for: ", item.name);
        socket.on(item.name, function (data) {
          console.log(`Incoming socket data for ${item.name} - ${data.pos}`);
          if (board.isReady) {
            item.servo.to(data.pos);
          }
        });
      });
    }

    // if led message received
    socket.on("led", (data) => {
      console.log(data);
      if (board.isReady) {
        led.strobe(data.delay);
      }
    });
  });
