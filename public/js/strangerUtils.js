import * as wss from "./wss.js";
import * as webRTCHandler from "./webRTCHandler.js";


// export const changeStrangerConnectionStatus = (status) => {
//   const data = { status };
//   wss.changeStrangerConnectionStatus(data);
// };

export const getStrangerSocketIdAndConnect = () => {
  wss.getStrangerSocketId();
};

export const connectWithStranger = (data) => {
  if (data.randomStrangerSocketId) {
    webRTCHandler.sendPreOffer('VIDEO_CALL',data.randomStrangerSocketId);
  } else {
    console.log("No User Available")
  }
};
