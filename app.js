const express = require("express");
//const fs = require('fs');
const http = require("http");
const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/callpage",(req,res)=>{
    res.sendFile(__dirname + "/public/callpage.html");
})

let connectedPeers = [];
let availableForCall = [];

io.on("connection", (socket) => {
  console.log(availableForCall)
    connectedPeers.push(socket.id);
    availableForCall.push(socket.id);
    socket.on("PreOffer", (data) => {
      const { strangerSocketId, calltype } = data;
      const connectedPeer = connectedPeers.find(
        (peerSocketId) => peerSocketId === strangerSocketId
      );
  
      if (connectedPeer) {
        const data = {
          callerSocketId: socket.id,
          calltype,
        };
        io.to(strangerSocketId).emit("PreOffer", data);
      } else {
          const data = {
            preOfferAnswer: "CALLEE_NOT_FOUND",
          };
          io.to(socket.id).emit("Pre-Offer-Answer",data)
      }
    });
    socket.on("Pre-Offer-Answer", (data) => {
      const { callerSocketId } = data;
      const connectedPeer = connectedPeers.find(
        (peerSocketId) => peerSocketId === callerSocketId
      );
  
      if (connectedPeer) {
        io.to(data.callerSocketId).emit("Pre-Offer-Answer", data);
      }
    });
    socket.on("WebRTC-Signaling", (data) => {
        const { connectedUserSocketId } = data;
        const connectedPeer = connectedPeers.find(
          (peerSocketId) => peerSocketId === connectedUserSocketId
        );
    
        if (connectedPeer) {
          io.to(connectedUserSocketId).emit("WebRTC-Signaling", data);
        }
      });

    socket.on("Get-Stranger-Socket-Id", () => {
        let randomStrangerSocketId;
        const filteredAvailableForCall = availableForCall.filter(
          (peerSocketId) => peerSocketId !== socket.id
        );
    
        if (filteredAvailableForCall.length > 0) {
          randomStrangerSocketId =
          filteredAvailableForCall[
              Math.floor(Math.random() * filteredAvailableForCall.length)
            ];
          
          const newAvailableForCall = availableForCall.filter(
            (peerSocketId) => peerSocketId !== socket.id && peerSocketId !== randomStrangerSocketId
          )
          
          availableForCall = newAvailableForCall;
          console.log('Available Peers'+availableForCall);
        } else {
          randomStrangerSocketId = null;
        }
        const data = {
          randomStrangerSocketId,
        };
        //console.log("Server Stranger Socket Id "+ randomStrangerSocketId);
        io.to(socket.id).emit("Stranger-Socket-Id", data);
    });
    socket.on("User-Hanged-Up", (data) => {
      const { connectedUserSocketId } = data;
  
      const connectedPeer = connectedPeers.find(
        (peerSocketId) => peerSocketId === connectedUserSocketId
      );
  
      if (connectedPeer) {
        io.to(connectedUserSocketId).emit("User-Hanged-Up");
      }
    });

    socket.on("disconnect", () => {
      console.log("User Disconnected");
      const newConnectedPeers = connectedPeers.filter(
        (peerSocketId) => peerSocketId !== socket.id
      );
      const newAvailableForCall = availableForCall.filter(
        (peerSocketId) => peerSocketId !== socket.id
      );
      connectedPeers = newConnectedPeers;
      availableForCall = newAvailableForCall;
  });
});

server.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
});