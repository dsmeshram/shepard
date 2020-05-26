/**
 * Click handler to init the desktop capture grab
 */
document.querySelector('button').addEventListener('click', function(e) {
chrome.windows.create({'url': 'popup.html', 'type': 'popup'}, function(window) {
    });
});