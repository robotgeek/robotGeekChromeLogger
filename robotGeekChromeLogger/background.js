// Runs this function when the application is opened
chrome.app.runtime.onLaunched.addListener(function() {

  // Create a new window using the file `./window.html`
  chrome.app.window.create('window.html', {
    // Make the window 900px by 800px
    'bounds': {
      'width': 900,
      'height': 800
    },
    resizable: true
  });

    //console.log('test insur');
});
