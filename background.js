chrome.runtime.onInstalled.addListener(function() {

  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        chrome.desktopCapture.chooseDesktopMedia(
            ["screen", "window"],
            function(id) {
              sendResponse({"id": id});
            });
  });
});

