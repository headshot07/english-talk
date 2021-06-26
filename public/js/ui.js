const micOnImgSrc = "./utils/images/mic.png";
const micOffImgSrc = "./utils/images/micOff.png";

export const updateMicButton = (micActive) => {
  const micButtonImage = document.getElementById("mic_button_image");
  micButtonImage.src = micActive ? micOffImgSrc : micOnImgSrc;
};

const cameraOnImgSrc = "./utils/images/camera.png";
const cameraOffImgSrc = "./utils/images/cameraOff.png";

export const updateCameraButton = (cameraActive) => {
  const cameraButtonImage = document.getElementById("camera_button_image");
  cameraButtonImage.src = cameraActive ? cameraOffImgSrc : cameraOnImgSrc;
};

export const removeLoader = () =>{
  const loader = document.getElementById('loader');
  loader.classList.add('display_none');
}

export const addCallButtons = () =>{
    const call_buttons = document.getElementById('call_buttons');
    call_buttons.classList.remove('display_none');
}