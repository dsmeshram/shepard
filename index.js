'use strict';
const DESKTOP_MEDIA = ['screen', 'window', 'tab', 'audio'];
var pending_request_id = null;
var pc1 = null;
var pc2 = null;
var desktop_sharing = false;
var local_stream = null;


function toggle() {
    if (!desktop_sharing) {
        chrome.desktopCapture.chooseDesktopMedia(DESKTOP_MEDIA, onAccessApproved);
    } else {
        desktop_sharing = false;

        if (local_stream)
            local_stream.stop();
        local_stream = null;

        document.querySelector('button').innerHTML = "Enable Capture";
        console.log('Desktop sharing stopped...');
    }
}

function onAccessApproved(id,options) {
    if (!id) {
        console.log('Access rejected.');
        return;
      }
      var audioConstraint = {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: id
          }
      };

      console.log(options.canRequestAudioTrack);
  if (!options.canRequestAudioTrack)
    audioConstraint = false;
  navigator.webkitGetUserMedia({
    audio: audioConstraint,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: id,
        maxWidth:screen.width,
        maxHeight:screen.height} }
  }, gotStream, getUserMediaError);
}

function getUserMediaError(error) {
    console.log('navigator.webkitGetUserMedia() errot: ', error);
}
  // Capture video/audio of media and initialize RTC communication.
function gotStream(stream) {
    console.log('Received local stream', stream);
    var video = document.querySelector('video');
    try {
      video.srcObject = stream;
    } catch (error) {
      video.src = URL.createObjectURL(stream);
    }
    stream.onended = function() { console.log('Ended'); };
    pc1 = new RTCPeerConnection();
    pc1.onicecandidate = function(event) {
      onIceCandidate(pc1, event);
    };
    pc2 = new RTCPeerConnection();
    pc2.onicecandidate = function(event) {
      onIceCandidate(pc2, event);
    };
    pc1.oniceconnectionstatechange = function(event) {
      onIceStateChange(pc1, event);
    };
    pc2.oniceconnectionstatechange = function(event) {
      onIceStateChange(pc2, event);
    };
    pc2.onaddstream = gotRemoteStream;
    pc1.addStream(stream);
    pc1.createOffer(onCreateOfferSuccess, function() {});
  }
  function onCreateOfferSuccess(desc) {
    pc1.setLocalDescription(desc);
    pc2.setRemoteDescription(desc);
    // Since the 'remote' side has no media stream we need
    // to pass in the right constraints in order for it to
    // accept the incoming offer of audio and video.
    var sdpConstraints = {
      'mandatory': {
        'OfferToReceiveAudio': true,
        'OfferToReceiveVideo': true
      }
    };
    pc2.createAnswer(onCreateAnswerSuccess, function(){}, sdpConstraints);
  }
  function gotRemoteStream(event) {
    // Call the polyfill wrapper to attach the media stream to this element.
    console.log('hitting this code');
    var remoteVideo = document.querySelector('video');
    try {
      remoteVideo.srcObject = event.stream;
    } catch (error) {
      remoteVideo.src = URL.createObjectURL(event.stream);
    }
  }
  function onCreateAnswerSuccess(desc) {
    pc2.setLocalDescription(desc);
    pc1.setRemoteDescription(desc);
  }
  function onIceCandidate(pc, event) {
    if (event.candidate) {
      var remotePC = (pc === pc1) ? pc2 : pc1;
      remotePC.addIceCandidate(new RTCIceCandidate(event.candidate));
    }
  }
  function onIceStateChange(pc, event) {
    if (pc) {
      console.log('ICE state change event: ', event);
    }
  }

/**
 * Click handler to init the desktop capture grab
 */
document.querySelector('button').addEventListener('click', function(e) {
    toggle();
});