let state = {
  socketId: null,
  localStream: null,
  remoteStream: null,
  // callAvailable: false
};

export const setSocketId = (socketId) => {
  state = {
    ...state,
    socketId,
  };
};

export const setLocalStream = (stream) => {
  state = {
    ...state,
    localStream: stream,
  };
};

export const setRemoteStream = (stream) => {
  state = {
    ...state,
    remoteStream: stream,
  };
};

// export const setCallAvailable = (callAvailableState) => {
//   state = {
//     ...state,
//     callAvailable: callAvailableState,
//   };
// };

export const getState = () => {
  return state;
};
