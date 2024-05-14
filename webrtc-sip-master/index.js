/**
 * A basic JsSIP phone
 * Based on JsSIP 3.1 version https://jssip.net/documentation/3.1.x/api/session/
 */
$(function() { jQuery(function($) {
  //must fill these configurations
  //const socket = new JsSIP.WebSocketInterface('wss://inc247-ext-pbx.vpbank.com.vn:10433');
  //const socket = new JsSIP.WebSocketInterface('wss://inc247-ext.vpbank.com.vn:10443/ws');
  //const socket = new JsSIP.WebSocketInterface('wss://sbcp.3cproject.click:10422');
  //const socket = new JsSIP.WebSocketInterface('wss://sip-dev-v16.etelecom.vn:5065');
  const socket = new JsSIP.WebSocketInterface('wss://asterisk.3cl.xyz:8089/ws');
  //const socket = new JsSIP.WebSocketInterface('wss://test.3cproject.click:1033');
  var configuration = {
    'uri': 'sip:organization1.3111@asterisk.3cl.xyz',
    'password': 'gp*7KWVW', // FILL PASSWORD HERE
    sockets: [socket],
	connection_recovery_max_interval: 30
  };
  
  var incomingCallAudio = new window.Audio('https://code.bandwidth.com/media/incoming_alert.mp3');
  incomingCallAudio.loop = true;
  var remoteAudio = new window.Audio();
  remoteAudio.autoplay = true;

  var localView =   document.getElementById('localFeed');
  var remoteView =  document.getElementById('remoteFeed');

  window.oSipAudio = document.createElement("audio");
  var extraHeaders = [ 'X-Phone: 034417555', 'X-Bar: bar' ];
  
  var callOptions = {
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
			{ urls: ["stun:stun.counterpath.com:3478"] }
			//{ urls: ["stun:turn.3cproject.click"] }
		],
		iceTransportPolicy: "all"
	},
	extraHeaders: extraHeaders
  };
  
  var phone;
  var session;

  /**
   * This is added for JsJSP 3.x to listen to newRTCSession event directly.
   */
  function addStreams() {
    session.connection.addEventListener('addstream', function(streamEvent) {
      console.log('addstreams', streamEvent);
      incomingCallAudio.pause();

      //attach remote stream to remoteView
      remoteAudio.srcObject = streamEvent.stream;

      // Attach local stream to selfView
      const peerconnection = session.connection;
      console.log('addstream peerconnection local and remote stream counts ',
        peerconnection.getLocalStreams.length, peerconnection.getRemoteStreams.length);
      localView.srcObject = peerconnection.getLocalStreams()[0];
      remoteView.srcObject = peerconnection.getRemoteStreams()[0];
    });
  };

  if (configuration.uri && configuration.password) {
    $('#errorMessage').hide();

    console.log('connect to sip server ', configuration);
    JsSIP.debug.enable('JsSIP:*'); // more detailed debug output
    phone = new JsSIP.UA(configuration);

    // WebSocket connection events
    phone.on('connecting', function(ev) {
      console.log('socket is connecting', ev);
    });
    phone.on('connected', function(ev) {
      console.log('socket is connected', ev);
    });
    phone.on('disconnected', function(ev) {
      console.log('socket is disconnected', ev);
    });

    // SIP registration events
    phone.on('unregistered', function(ev) {
      console.log('device is unregistered now', ev);
    });
    phone.on('registered', function(ev) {
      console.log('device is registered now', ev);
    });
    phone.on('registrationFailed', function(ev) {
      alert('Registering on SIP server failed with error: ' + ev.cause);
      configuration.uri = null;
      configuration.password = null;
      updateUI();
    });
    phone.on('newMessage', function (ev) {
    })
    phone.on('newRTCSession', function(ev) {
      console.log('new session establishing ...', ev);
      //ev.request.call_id
      var newSession = ev.session;
      if (session) { // hangup any existing call
        session.terminate();
      }
      session = newSession;
      if (ev.originator === 'local') {
        console.trace(ev.request + ' outgoing session');
      } else {
        console.trace(ev.request + ' incoming session answering a call');
      }
      // session handlers/callbacks
      var completeSession = function() {
        session = null;
        updateUI();
      };
      session.on('peerconnection', (e) =>{
        console.log('peerconnection', e);
      });
      session.on('connecting', (e) =>{
        console.log('connecting', e);
      });
      session.on('process', (e) =>{
        console.log('process', e);
      });
      session.on('ended', (e) => {
        console.log('call ended');
        // need a way to show on UI
        completeSession();
      });
      session.on('failed', (e) => {
        console.log('session failed');
        completeSession();
      });
      session.on('accepted', (e) => { // when 2xx received
        console.log('session accepted by', e.originator);
        updateUI();
      });
      session.on('confirmed', function(e) { //when ACK received or sent
        console.log('confirmed by', e.originator);
        // count the local and remote streams
        const localStreams = session.connection.getLocalStreams();
        console.log('confirmed with a number of local streams', localStreams.length);

        const remoteStreams = session.connection.getRemoteStreams();
        console.log('confirmed with a number of remote streams', remoteStreams.length);

        var localStream = localStreams[0];
        var dtmfSender = session.connection.createDTMFSender(localStream.getAudioTracks()[0]);
        session.sendDTMF = function(tone) {
          dtmfSender.insertDTMF(tone);
        };

        updateUI();
      });
      if (session.direction === 'incoming') {
        console.log('incoming session direction');
        incomingCallAudio.play();
      }
      updateUI();
    });
    phone.start();
  }
  
  updateUI();
  
  $('#connectCall').click(function() {
    var dest = $('#toField').val();
    phone.call(dest, callOptions);
    updateUI();
    addStreams();
  });
  
  $('#initVideo').click((e) => {
   // uncomment to test the local camera
   // init(e);
  });

  async function init(e) {
    const constraints = window.constraints = {
      audio: false,
      video: true
    };
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      //const video = document.querySelector('video');
      const video = localView;
      const videoTracks = stream.getVideoTracks();
      console.log('Got stream with constraints:', constraints);
      console.log(`Using video device: ${videoTracks[0].label}`);
      window.stream = stream; // make variable available to browser console
      video.srcObject = stream;

      e.target.disabled = true;
    } catch (ex) {
      console.log("getUserMedia exception", ex);
      alert("getUserMedia exception");
    }
  }

  
  $('#answer').click(function() {
    session.answer(callOptions);
    addStreams();
  });
  
  var hangup = function() {
    session.terminate();
  };
  
  $('#hangUp').click(hangup);
  $('#reject').click(hangup);
  
  $('#mute').click(function() {
    console.log('MUTE CLICKED');
    if (session.isMuted().audio) {
      session.unmute({
        audio: true
      });
    } else {
      session.mute({
        audio: true
      });
    }
    updateUI();
  });
  $('#toField').keypress(function(e) {
    if (e.which === 13) { //enter
      $('#connectCall').click();
    }
  });
  $('#inCallButtons').on('click', '.dialpad-char', function(e) {
    var $target = $(e.target);
    var value = $target.data('value');
    session.sendDTMF(value.toString());
  });
  
  function updateUI() {
    if (configuration.uri && configuration.password) {
      $('#errorMessage').hide();
      $('#wrapper').show();
      if (session) {
        console.log('valid session');
        if (session.isInProgress()) {
          if (session.direction === 'incoming') {
            console.log('inbound call');
            $('#incomingCallNumber').html(session.remote_identity.uri);
            $('#incomingCall').show();
            $('#callControl').hide();
            $('#incomingCall').show();
          } else {
            $('#callInfoText').html('Ringing...');
            $('#callInfoNumber').html(session.remote_identity.uri.user);
            $('#callStatus').show();
          }
  
        } else if (session.isEstablished()) {
          console.log('session is established.');
          $('#callStatus').show();
          $('#incomingCall').hide();
          $('#callInfoText').html('In Call');
          $('#callInfoNumber').html(session.remote_identity.uri.user);
          $('#inCallButtons').show();
          incomingCallAudio.pause();
        }
        $('#callControl').hide();
      } else {
        $('#incomingCall').hide();
        $('#callControl').show();
        $('#callStatus').hide();
        $('#inCallButtons').hide();
        incomingCallAudio.pause();
      }
      //microphone mute icon
      if (session && session.isMuted().audio) {
        $('#muteIcon').addClass('fa-microphone-slash');
        $('#muteIcon').removeClass('fa-microphone');
      } else {
        $('#muteIcon').removeClass('fa-microphone-slash');
        $('#muteIcon').addClass('fa-microphone');
      }
    } else {
      $('#wrapper').hide();
      $('#errorMessage').show();
    }
  }
 }) }) ; //document ready
