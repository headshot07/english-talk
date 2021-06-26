import * as wss from './wss.js';
import * as strangerUtils from './strangerUtils.js';
import * as webRTCHandler from './webRTCHandler.js';
import * as ui from './ui.js';
import * as store from './store.js';


webRTCHandler.getLocalPreview().then(()=>{
  let call_animation = document.getElementById("animation_container");
  call_animation.addEventListener('click', ()=> {
  const socket = io("/");
  wss.registerSocketEvents(socket);
  let loader = document.getElementById('loader');
  loader.classList.remove('display_none');
  strangerUtils.getStrangerSocketIdAndConnect();
  call_animation.classList.add('display_none');
})
},()=>{
  console.log('Cannot Load Media')
})

//Promise
// const socketFunction = () => {
//   return new Promise((res,rej)=>{
    
//     res();
//   })
// }
// const localPreview = () => {
//   return new Promise((res,rej)=>{
    
//     res();
//   })
// }

// socketFunction().then(()=>{
//   localPreview().then(()=>{
    
//   })
// })


//Video Buttons
const micButton = document.getElementById("mic_button");
micButton.addEventListener("click", () => {
  const localStream = store.getState().localStream;
  const micEnabled = localStream.getAudioTracks()[0].enabled;
  localStream.getAudioTracks()[0].enabled = !micEnabled;
  ui.updateMicButton(micEnabled);
});

const cameraButton = document.getElementById("camera_button");
cameraButton.addEventListener("click", () => {
  const localStream = store.getState().localStream;
  if(localStream){
    const cameraEnabled = localStream.getVideoTracks()[0].enabled;
    localStream.getVideoTracks()[0].enabled = !cameraEnabled;
    ui.updateCameraButton(cameraEnabled);
  }
  else{

  }
});

const hangUpButton = document.getElementById("hang_up_button");
hangUpButton.addEventListener("click", () => {
  window.location.href = "/";
  webRTCHandler.handleHangUp();
});


var minutes = 0;
var seconds = 0;
var displaySeconds =0;
var displayMinutes = 0;
export const setTimer = () => {
  var xyz = setInterval(function() {
    seconds++;

    //Logic to determine when to increment next value.
    if(seconds / 60 === 1){
        seconds = 0;
        minutes++;

        if(minutes / 60 === 1){
            minutes = 0;
            hours++;
        }

    }

    //If seconds/minutes/hours are only one digit, add a leading 0 to the value.
    if(seconds < 10){
        displaySeconds = "0" + seconds.toString();
    }
    else{
        displaySeconds = seconds;
    }

    if(minutes < 10){
        displayMinutes = "0" + minutes.toString();
    }
    else{
        displayMinutes = minutes;
    }
    document.getElementById("timer").innerHTML =  displayMinutes + " : " + displaySeconds;
}, 1000);
}