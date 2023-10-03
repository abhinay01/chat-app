const socket = io();
const chatForm = document.getElementById("chat-form");
const chatMessage = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

//join chatroom
socket.emit("joinRoom", { username, room });

//
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUserList(users);
});

socket.on("message", (message) => {
  console.log(message);
  outputMessage(message);

  //scroll to the end
  chatMessage.scrollTop = chatMessage.scrollHeight;
});

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const msg = e.target.elements.msg.value;
  // console.log(msg);

  socket.emit("chatMessage", msg);

  //clear the output

  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

function outputMessage(msg) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${msg.username} <span>${msg.time}</span></p>
    <p class="text">
        ${msg.text}
    </p> `;
  document.querySelector(".chat-messages").appendChild(div);
}

function outputRoomName(room) {
  roomName.innerText = room;
}

function outputUserList(users) {
  userList.innerHTML = `
    ${users.map((user) => `<li>${user.username}</li>`).join("")}
    `;
}
