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
      notLoggedin();
    }else{
      loggedin();
    }
  }); 
}

function logout(){
  localStorage.removeItem('auth_token');
  localStorage.removeItem('username');
  loadPage('login.html');   
}

// load html template content
function loadPage(wantedPage){
  window.location.href = "/" + wantedPage;
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
