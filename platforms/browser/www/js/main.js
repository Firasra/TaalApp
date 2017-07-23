$(document).ready(function(){

 // startScanning();
  isLoggedin();
  changeLanguage();

  // document.addEventListener("deviceready", onDeviceReady, false);
});

function getFormParams(form){
  var data = form.serializeArray().reduce(function(obj, item) {
                  obj[item.name] = item.value;
                  return obj;
              }, {});
  return data;
}

function loginAction(form){
  var form_data = getFormParams(form);
  if ( typeof form_data.username !== 'undefined' && typeof form_data.password !== 'undefined' ) {
    $.ajax({
      type: "POST", 
      crossDomain: true, 
      url: serverSite+"api/login", 
      dataType: 'json', 
      cache: false, 
      data: form_data 
    }).done(function(response) {
      if (typeof response.success !== 'undefined' && response.success ) {
        if (typeof response.data !== 'undefined' &&
            typeof response.data.token !== 'undefined' && typeof response.data.username !== 'undefined' ) {
          var data = response.data;
          localStorage.auth_token = response.data.token;
          localStorage.username = response.data.username;
          loadPage('home.html');
          $('#scan').click();
        } 
      }
    }); 
  } 
  return false;
}

function logoutAction(){
  if (typeof localStorage.auth_token !== 'undefined' && typeof localStorage.username !== 'undefined') {
    var token    = localStorage.auth_token;
    var username = localStorage.username;
    $.ajax({
      type: "POST", 
      crossDomain: true, 
      url: serverSite+"api/logout", 
      dataType: 'json', 
      cache: false, 
      headers:{ "username" : username, "token": token } 
    }).done(function(response) {
      if (typeof response.success !== 'undefined' && response.success ) {
        logout();   
      }
    }); 
  }
}

function isLoggedin(){
  var path = window.location.pathname;
  var page = path.split("/").pop();
  if(page !== 'login.html' && page !== 'signup.html'){
    var token    = typeof localStorage.auth_token !== 'undefined' ? localStorage.auth_token : '';
    var username = typeof localStorage.username !== 'undefined' ? localStorage.username : '';
    $.ajax({
      type: "POST", 
      crossDomain: true, 
      url: serverSite+"api/isLoggedin", 
      dataType: 'json', 
      cache: false, 
      headers:{ "username" : username, "token": token } 
    }).done(function(response) {
      if (! (typeof response.success !== 'undefined' && response.success) ) {
        logout();
      }else{
        loadPage('home.html');
      }
    }); 
  }
}

function logout(){
  localStorage.removeItem('auth_token');
  localStorage.removeItem('username');
  loadPage('login.html');   
}

// load html template content
function loadPage(wantedPage){
  $("#page_content").load(wantedPage, function(){
    changeLanguage();
    startScanning();
  });
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
              var token    = typeof localStorage.auth_token !== 'undefined' ? localStorage.auth_token : '';
              var username = typeof localStorage.username !== 'undefined' ? localStorage.username : '';
              $.ajax({
                type: "GET", 
                crossDomain: true, 
                url: serverSite+"api/site?site="+parseInt(result.text),
                dataType: 'json', 
                cache: false, 
                headers: {"username":username, "token":token},
                data: {"site": 1}
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


