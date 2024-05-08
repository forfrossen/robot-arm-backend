const { Server } = require("socket.io");

const io = new Server(3001, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  // new or unrecoverable session
  console.log("New Socket Session created");
  socket.emit("news", { hello: "world" });

  socket.on("disconnect", () => socket.disconnect());

  socket.on("servo", function (data) {
    console.log(
      `Incoming socket data for Servo "${data.name}". Move to Position: ${data.pos}`
    );
  });
});
