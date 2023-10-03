const express = require("express");
const path = require("path");
const http = require("http");

const socketio = require("socket.io");
const format = require("./utils/formatMessage");

const {
  userJoin,
  getUserById,
  getRoomUsers,
  userLeave,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const botname = "chat Bot";
//static folder
app.use(express.static(path.join(__dirname, "_html_css")));

//initiate when client connects
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    //welcome msg
    socket.emit("message", format(botname, "welcome to chat app"));

    //user joined broadcast
    socket.broadcast
      .to(user.room)

      .emit("message", format(botname, `${user.username} has joined!`));

    //send user and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });
  //user left broadcast
  //listen to chat msg
  socket.on("chatMessage", (msg) => {
    // console.log(msg);
    const user = getUserById(socket.id);
    io.to(user.room).emit("message", format(user.username, msg));
  });
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        format(botname, `${user.username} left`)
      );

      //send user and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
});
