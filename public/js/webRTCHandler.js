import * as wss from "./wss.js";
import * as store from "./store.js";
import * as ui from './ui.js';
import * as call from './call.js';
let connectedUserDetails;
let peerConection;

const defaultConstraints = {
  audio: true,
  video: true,
};

export const getLocalPreview = () => {
    return new Promise((res, rej)=>{
      navigator.mediaDevices
      .getUserMedia(defaultConstraints)
      .then((stream) => {
        stream.getVideoTracks()[0].enabled = false;
        const localVideo = document.getElementById("local_video");
        localVideo.srcObject = stream;
        store.setLocalStream(stream);
        localVideo.addEventListener("loadedmetadata", () => {
          localVideo.play();
        });
        res();
      })
      .catch((err) => {
        console.log("Cannot Connect To Camera");
        console.log(err);
      });
    })
};

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:13902' },
  ],
  };

  const createPeerConnection = async () => {
    peerConection = new RTCPeerConnection(configuration);
    peerConection.onicecandidate = (event) => {
      console.log('ICE Candidate');
      if (event.candidate) {
        wss.sendDataUsingWebRTCSignaling({
          connectedUserSocketId: connectedUserDetails.socketId,
          type: 'ICE_CANDIDATE',
          candidate: event.candidate,
        });
      }
    };
  
    peerConection.onconnectionstatechange = (event) => {
      if (peerConection.connectionState === "connected") {
        console.log('Connection Done');
      }
      if (peerConection.connectionState === "disconnected"){
        window.location.href = "/";
      }
    };
    ui.removeLoader();
    ui.addCallButtons();
    call.setTimer();
    // Receiving Tracks
    const remoteStream = new MediaStream();
    store.setRemoteStream(remoteStream);
    var remotevideo = document.getElementById("remote_video");
    remotevideo.srcObject = remoteStream;
  
    peerConection.ontrack = (event) => {
      remoteStream.addTrack(event.track);
    };
  
    //Local Tracks
    const localStream = store.getState().localStream;
    for (const track of localStream.getTracks()) {
      peerConection.addTrack(track, localStream);
    }
  };

  export const sendPreOffer = (callType, strangerSocketId) => {
    console.log("Send Pre Offer")
    connectedUserDetails = {
      callType,
      socketId: strangerSocketId,
    };
    const data = {
      callType,
      strangerSocketId,
    };
    wss.sendPreOffer(data);
  };



  export const handlePreOffer = (data) => {
    const{ callType, callerSocketId } = data;
    connectedUserDetails = {
      callType,
      socketId: callerSocketId,
    };
    createPeerConnection();
    sendPreOfferAnswer();
  };

  const sendPreOfferAnswer = (callerSocketId = null) => {
    const socketId = callerSocketId
      ? callerSocketId
      : connectedUserDetails.socketId;
    const data = {
      callerSocketId: socketId,
    };
    wss.sendPreOfferAnswer(data);
  };
  

  export const handlePreOfferAnswer = (data) => {
    const { callerSocketId } = data;
    createPeerConnection();
    sendWebRTCOffer();
  };

  const sendWebRTCOffer = async () => {
    const offer = await peerConection.createOffer();
    await peerConection.setLocalDescription(offer);
    wss.sendDataUsingWebRTCSignaling({
      connectedUserSocketId: connectedUserDetails.socketId,
      type: 'OFFER',
      offer: offer,
    });
  };

  export const handleWebRTCOffer = async (data) => {
    await peerConection.setRemoteDescription(data.offer);
    const answer = await peerConection.createAnswer();
    await peerConection.setLocalDescription(answer);
    wss.sendDataUsingWebRTCSignaling({
      connectedUserSocketId: connectedUserDetails.socketId,
      type: 'ANSWER',
      answer: answer,
    });
  };

  export const handleWebRTCAnswer = async (data) => {
    await peerConection.setRemoteDescription(data.answer);
  };
  
  export const handleWebRTCCandidate = async (data) => {
    try {
      await peerConection.addIceCandidate(data.candidate);
    } catch (err) {
      console.error(
        "Error In Ice Candidate",
        err
      );
    }
  };


//Hang-Up
export const handleHangUp = () => {
  const data = {
    connectedUserSocketId: connectedUserDetails.socketId,
  };

  wss.sendUserHangedUp(data);
  closePeerConnectionAndResetState();
};
  
export const handleConnectedUserHangedUp = () => {
  closePeerConnectionAndResetState();
};

const closePeerConnectionAndResetState = () => {
  if (peerConection) {
    peerConection.close();
    peerConection = null;
  }

  // Active Mic And Camera
  store.getState().localStream.getVideoTracks()[0].enabled = true;
  store.getState().localStream.getAudioTracks()[0].enabled = true;
  connectedUserDetails = null;

  //Redirect To Home Page
  window.location.href = '/';
};