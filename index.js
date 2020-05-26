'use strict';
const DESKTOP_MEDIA = ['screen', 'window', 'tab', 'audio'];
var pending_request_id = null;
var pc1 = null;
var pc2 = null;
var desktop_sharing = false;
var local_stream = null;
var recordedBlobs = [];

let message =document.querySelector('p');

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

function writeLog(newmsg){
    let oldmessage = message.innerText + "/n " + newmsg;
    message.innerText = oldmessage;
}
  // Capture video/audio of media and initialize RTC communication.
function gotStream(stream) {

  let options = {mimeType: 'video/webm'};

  let mediaRecorder = new MediaRecorder(stream,options);
  mediaRecorder.onstop = function(){

    writeLog("end");

    let blob = new Blob(recordedBlobs, {type: 'video/webm'});
    let url =  URL.createObjectURL(blob);


    writeLog("url :"+url);


    let linka = document.createElement('a');
        linka.href = url;
        linka.target = "_blank"

        document.body.appendChild(linka);

        linka.click();

        document.body.removeChild(linka);

  };
  mediaRecorder.ondataavailable = function(event){
    if (event.data && event.data.size > 0) {
      recordedBlobs.push(event.data)
      writeLog("ondataavailable :");
    }
  }
  mediaRecorder.start(100); // collect 100ms of data
   
  stream.onended = function() { 
    mediaRecorder.stop();
  };
}
 
/**
 * Click handler to init the desktop capture grab
 */
document.querySelector('button').addEventListener('click', function(e) {
    toggle();
});