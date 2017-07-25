$(document).ready(function(){

  isLoggedin();
  changeLanguage();
  startScanning();
  $('button#startScanning').click();
});

function loggedin(){
    
}

function notLoggedin(){
    logout();
}


function startScanning() {     

    $('button#startScanning').click( function() {
          cordova.plugins.barcodeScanner.scan(
          function (result) {
             alert("We got a barcode\n" +
                "Result: " + result.text + "\n" +
                "Format: " + result.format + "\n" +
                "Cancelled: " + result.cancelled);
              var token    = typeof localStorage.auth_token !== 'undefined' ? localStorage.auth_token : '';
              var username = typeof localStorage.username !== 'undefined' ? localStorage.username : '';
              $.ajax({
                type: "GET", 
                crossDomain: true, 
                url: serverSite+"api/site",
                dataType: 'json', 
                cache: false, 
                headers: {"username":username, "token":token},
                data: {"site": parseInt(result.text)}
              }).done(function(response) {
                $("#example").html(response.data.site.description);
              });           
          }, 
          function (error) {
              alert("Scanning failed: " + error);
          },
          {
              preferFrontCamera : false, // iOS and Android
              showFlipCameraButton : true, // iOS and Android
              showTorchButton : true, // iOS and Android
              torchOn: false, // Android, launch with the torch switched on (if available)
              prompt : translation[choosedLanguage]['PLACE_QRCODE'], // Android
              resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
              formats : "QR_CODE", // default: all but PDF_417 and RSS_EXPANDED
              orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
              disableAnimations : false, // iOS
              disableSuccessBeep: false // iOS
          });
        }
     );
}