const { Server } = require("socket.io");
const io = new Server(3001, {
  cors: {
    origin: "*",
  },
});

const { Board, Servo, Servos, Animation } = require("johnny-five");

const board = new Board();

const controller = "PCA9685";
const ServoArray = [
  "baseTurner",
  "shoulder",
  "elbow",
  "wrist",
  "wristTurner",
  "gripper",
];

var MyServos = {
  baseTurner: {},
  shoulder: {},
  elbow: {},
  wrist: {},
  wristTurner: {},
  gripper: {},
};

board.on("ready", () => {
  console.log("Board connected");

  MyServos.baseTurner = new Servo({
    controller,
    range: [0, 180],
    pin: 0,
    startAt: 180,
  });

  MyServos.shoulder = new Servo({
    controller,
    range: [30, 180],
    isInverted: false,
    startAt: 135,
    pin: 1,
  });

  MyServos.elbow = new Servo({
    controller,
    range: [0, 180],
    isInverted: true,
    startAt: 50,
    pin: 2,
  });

  MyServos.wrist = new Servo({
    controller,
    range: [0, 180],
    inverted: true,
    startAt: 110,
    pin: 3,
  });

  MyServos.wristTurner = new Servo({
    controller,
    range: [0, 180],
    startAt: 150,
    pin: 4,
    pin: 4,
  });

  MyServos.gripper = new Servo({
    controller,
    //range: [0, 180],
    startAt: 143,
    pin: 5,
    inverted: false,
  });

  const joints = new Servos([
    MyServos.shoulder,
    MyServos.elbow,
    MyServos.wrist,
  ]);
  var animation = new Animation(joints);
  const animationMoveStep = 60;
  // Create an animation segment object
  animation
    .enqueue({
      duration: 1500,
      cuePoints: [0, 0.5, 1.0],
      keyFrames: [
        [
          { degrees: MyServos.shoulder.startAt },
          { degrees: MyServos.shoulder.startAt - animationMoveStep },
          { degrees: MyServos.shoulder.startAt },
        ],
        [
          { degrees: MyServos.elbow.startAt },
          { degrees: MyServos.elbow.startAt + animationMoveStep },
          { degrees: MyServos.elbow.startAt },
        ],
        [
          { degrees: MyServos.wrist.startAt },
          { degrees: MyServos.wrist.startAt + animationMoveStep },
          { degrees: MyServos.wrist.startAt },
        ],
      ],
    })
    .enqueue({
      duration: 1000,
      cuePoints: [0, 0.5, 1.0],
      keyFrames: [
        [
          { degrees: MyServos.shoulder.startAt },
          { degrees: MyServos.shoulder.startAt + animationMoveStep },
          { degrees: MyServos.shoulder.startAt },
        ],
        [
          { degrees: MyServos.elbow.startAt },
          { degrees: MyServos.elbow.startAt - animationMoveStep },
          { degrees: MyServos.elbow.startAt },
        ],
        [
          { degrees: MyServos.wrist.startAt },
          { degrees: MyServos.wrist.startAt - animationMoveStep },
          { degrees: MyServos.wrist.startAt },
        ],
      ],
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

const sendServoPosition = (socket, servoName) => {
  console.log(`sending for ${servoName} - ${MyServos[servoName].position}`);
  socket.emit("servoPosition", {
    servoName: servoName,
    pos: MyServos[servoName].position,
  });
};

// on a socket connection
const setupSocket = () =>
  io.on("connection", (socket) => {
    // new or unrecoverable session
    console.log("New Socket Session created");

    socket.on("disconnect", () => socket.disconnect());

    ServoArray.forEach((servoName) => {
      sendServoPosition(socket, servoName);
    });

    socket.on("servo", function (data) {
      console.log(`Incoming socket data for ${data.servoName} - ${data.pos}`);
      if (board.isReady) {
        if (MyServos[data.servoName]) {
          console.log(
            `Moving Servo ${data.servoName} from ${
              MyServos[data.servoName].position
            } to Position ${data.pos}`
          );
          MyServos[data.servoName].to(data.pos, 1000);
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
