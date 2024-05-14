export enum EJssip {
  ConnectString = 'wss://asterisk.3cl.xyz:8089/ws',
  Uri = 'sip:organization1.3111@asterisk.3cl.xyz',
  Password = 'gp*7KWVW'
}

export const CJssipOption = {
  mediaConstraints: {
    audio: true,
    video: false
  },
  rtcOfferConstraints: {
    'offerToReceiveAudio': true,
    'offerToReceiveVideo': false
  },
  pcConfig: {
    iceServers: [
      {urls: ["stun:stun.counterpath.com:3478"]}
    ],
    iceTransportPolicy: "all" as RTCIceTransportPolicy
  }
}
