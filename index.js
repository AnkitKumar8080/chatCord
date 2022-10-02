const express = require("express");
const http = require("http");
const { format } = require("path");
const path = require("path");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const PORT = 3000 || process.env.PORT;
const server = http.createServer(app);
const io = socketio(server);
const botName = "Bot ";

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Run when the client connects
io.on("connection", (socket) => {
  // join room
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    // welcome current user
    socket.emit("message", formatMessage(botName, "Welcome to chatCord"));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );
      // send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
  });


  // listen for the chat message (liste from emit by on )
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    // console.log(msg);
    //  emiting to all the user
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  // runs when client disconnects;
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, user.username + " has left the chat")
      );
      // send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

app.use("/", (req, res) => {
  res.send("/public/index.html");
});

server.listen(PORT, () => {
  console.log("Server started at port " + PORT);
});
