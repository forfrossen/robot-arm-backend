const { Server } = require("socket.io");
const io = new Server(3001, {
  cors: {
    origin: "*",
  },
});

const { Board, Servo } = require("johnny-five");

const board = new Board();

const controller = "PCA9685";

var Servos = {
  baseTurner: {},
  shoulder: {},
  elbow: {},
  wrist: {},
  wristTurner: {},
  gripper: {},
};

board.on("ready", () => {
  console.log("Connected");

  Servos.baseTurner = new Servo({
    controller,
    //fps: 1,
    range: [0, 180],
    pin: 0,
    startAt: 180,
  });

  Servos.shoulder = new Servo({
    controller,
    inverted: true,
    //fps: 1,
    range: [30, 180],
    startAt: 135,
    pin: 1,
  });

  Servos.elbow = new Servo({
    controller,
    //fps: 1,
    range: [180, 0],
    inverted: true,
    startAt: 130,
    pin: 2,
  });

  Servos.wrist = new Servo({
    controller,
    //fps: 1,
    range: [0, 180],
    inverted: true,
    startAt: 90,
    pin: 3,
  });

  Servos.wristTurner = new Servo({
    controller,
    //fps: 1,
    range: [0, 180],
    startAt: 150,
    pin: 4,
    pin: 4,
  });

  Servos.gripper = new Servo({
    controller,
    //fps: 1,
    range: [115, 180],
    startAt: 115,
    pin: 5,
    inverted: true,
  });

  setupSocket();
  /*
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
  */
});

// on a socket connection
const setupSocket = () =>
  io.on("connection", (socket) => {
    // new or unrecoverable session
    console.log("New Socket Session created");
    socket.emit("news", { hello: "world" });

    socket.on("servo", function (data) {
      console.log(`Incoming socket data for ${data.name} - ${data.pos}`);
      if (board.isReady) {
        if (Servos[data.name]) {
          Servos[data.name].to(data.pos);
        }
      }
    });

    /*
      socket.on("shoulder", function (data) {
        console.log(`Incoming socket data for baseTurner - ${data.pos}`);
        if (board.isReady) {
          Servos[1].servo.to(data.pos);
        }
      });
*/
  });
