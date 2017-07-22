checkLogin();

$(document).ready(function(){
  loadPage('home.html');

  changeLanguage();

  loginAjax();

  document.addEventListener("deviceready", onDeviceReady, false);
});

function loginAjax(){

  $.ajax({
  type: "POST", 
  crossDomain: true, 
  url: serverSite+"api/login", 
  dataType: 'json', 
  cache: false, 
  headers:{ "username" : "student", "password": "qwe123" } });
}

function koko(){
  
}

// load html template content
function loadPage(wantedPage){
  $("#page_content").load(wantedPage, function(){
    changeLanguage();
    startScanning();
  });
}

function checkLogin(){
  // if its the first time user enter the app
  if(typeof localStorage.logged_in === 'undefined'){
    localStorage.logged_in = false;
  }

  // check if user has not logged in yet, redirect to login page
  if(localStorage.logged_in === false || localStorage.logged_in === 'false'){
    var path = window.location.pathname;
    var page = path.split("/").pop();
    if(page !== 'login.html' && page !== 'signup.html'){
      loadPage('login.html');
    }
  }

  // logged in user cant insert login or signup page
  // redirect them to homepage
  if(localStorage.logged_in === true || localStorage.logged_in === 'true'){
    var path = window.location.pathname;
    var page = path.split("/").pop();
    if(page === 'login.html' || page === 'signup.html'){
      loadPage('home.html');
    }
  }
}

// logout from account, and redirect to homepage
function logout(){
  localStorage.logged_in = false;
  loadPage('login.html');
}

// login function
function login(){
  localStorage.logged_in = true;
  loadPage('home.html');
}

// change displayed language
function changeLanguage(language){
  if(typeof language === 'undefined'){
    language = choosedLanguage;
  }
  // if its the same language, return and don't do anything
  //if(choosedLanguage == language) return;
  choosedLanguage = language
  $("[translate]").each(function(){
    el = $(this);
    trans_key = el.attr('translate');
    if(el.attr('type') === 'submit'){
      el.val(translation[choosedLanguage][trans_key]);
    }else{
      el.html(translation[choosedLanguage][trans_key]);
    }
    
  })
}

function startScanning() {     

    $('#scan').click( function() {
          cordova.plugins.barcodeScanner.scan(
          function (result) {
             alert("We got a barcode\n" +
                "Result: " + result.text + "\n" +
                "Format: " + result.format + "\n" +
                "Cancelled: " + result.cancelled);

              $.ajax({
                url: serverSite+"/get/"+result.text,
                context: document.body
              }).done(function() {
               //
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


