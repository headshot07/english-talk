import * as store from "./store.js";
import * as strangerUtils from './strangerUtils.js';
import * as webRTCHandler from './webRTCHandler.js';
let socketIO = null;

export const registerSocketEvents = (socket) => {
  socketIO = socket;
  socket.on("connect", () => {
    store.setSocketId(socket.id);
    console.log("Connected To Server");
  });

  socket.on("PreOffer", (data) => {
    console.log("Pre Offer From Server");
    webRTCHandler.handlePreOffer(data);
  });

  socket.on("Pre-Offer-Answer", (data) => {
    console.log('Pre offer Answer From server');
    webRTCHandler.handlePreOfferAnswer(data);
  });

  socket.on("User-Hanged-Up", () => {
    webRTCHandler.handleConnectedUserHangedUp();
  });

  socket.on("WebRTC-Signaling", (data) => {
    switch (data.type) {
      case 'OFFER':
        webRTCHandler.handleWebRTCOffer(data);
        break;
      case 'ANSWER':
        webRTCHandler.handleWebRTCAnswer(data);
        break;
      case 'ICE_CANDIDATE':
        webRTCHandler.handleWebRTCCandidate(data);
        break;
      default:
        return;
    }
  });

  socket.on("Stranger-Socket-Id", (data) => {
    strangerUtils.connectWithStranger(data);
  });
};

export const sendPreOffer = (data) => {
    socketIO.emit("PreOffer", data);
  };
  
  export const sendPreOfferAnswer = (data) => {
    socketIO.emit("Pre-Offer-Answer", data);
  };
  
  export const sendDataUsingWebRTCSignaling = (data) => {
    socketIO.emit("WebRTC-Signaling", data);
  };
  
export const getStrangerSocketId = () => {
  socketIO.emit("Get-Stranger-Socket-Id");
};

export const sendUserHangedUp = (data) => {
  socketIO.emit("User-Hanged-Up", data);
};