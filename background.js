chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('popup.html', {
    bounds: {
      width: 500,
      height: 400
    }
  });
});

  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        chrome.desktopCapture.chooseDesktopMedia(
            ["screen", "window"],
            function(id) {
              sendResponse({"id": id});
            });
  });


