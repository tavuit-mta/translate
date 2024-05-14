export enum ERecordsState {
  Start,
  Stop,
}

export enum ERecorsSteam {
  SampleRate = 16000,
  BufferSize = 4096,
  NumberOfInputChannels = 1,
  NumberOfOutputChannels = 1,
}

export enum EWS {
  UrlInput = 'ws://0.tcp.ap.ngrok.io:18351/api/audio/input',
  // UrlInput = 'wss://echo.websocket.org',
  UrlOutput = 'ws://0.tcp.ap.ngrok.io:18351/api/audio/output',
  // UrlOutput = 'wss://echo.websocket.org',
}


export const constraints = {
  audio: {
    channels: ERecorsSteam.NumberOfInputChannels
  },
} as MediaStreamConstraints;
