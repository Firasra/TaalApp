var site_data = {};
var user_data = {};
function getFormParams(form){
  var data = form.serializeArray().reduce(function(obj, item) {
                  obj[item.name] = item.value;
                  return obj;
              }, {});
  return data;
}

function loginAction(form){
  $("#loader_container").show();
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
        }else{
          $("#loader_container").hide();
          $("#loginError").html(translation[choosedLanguage]['LOGIN_ERROR']);
        } 
      }else{
        $("#loader_container").hide();
        $("#loginError").html(translation[choosedLanguage]['LOGIN_ERROR']);
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
      headers:{ "token": token },
      data: { "username": username }
    }).done(function(response) {
      if (typeof response.success !== 'undefined' && response.success ) {
        logout();   
      }
    }); 
  }
}

function isLoggedin(){
  
  $("#loader_container").show();
  var token    = typeof localStorage.auth_token !== 'undefined' ? localStorage.auth_token : '';
  var username = typeof localStorage.username !== 'undefined' ? localStorage.username : '';
  
  $.ajax({
    type: "POST", 
    crossDomain: true, 
    url: serverSite+"api/isLoggedin", 
    dataType: 'json', 
    cache: false, 
    headers: { "token": token },
    data: { "username": username }
  }).done(function(response) {
    if (! (typeof response.success !== 'undefined' && response.success) ) {
      notLoggedin();
    }else{
      user_data = response.data;
      $("div.user_profile_info h2").html(user_data.name);
      $("div.user_profile_description_text").html(user_data.biography);
      if( user_data.picture !== '' ){
        $("img.user_profile_image").attr('src', serverSite + 'uploads/images/' + user_data.picture);
      }
      loggedin();
    }
  }); 
}

function logout(){
  $("#loader_container").show();
  localStorage.removeItem('auth_token');
  localStorage.removeItem('username');
  loadPage('index.html');   
}

// load html template content
function loadPage(wantedPage){
  window.location.href =  wantedPage;
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

$(document).ready(function(){
  $("#logoutButton").click(function(){
    swal({
      text: "لتسجيل الخروج يجب إدخال اسم المستخدم",
      content: "input",
      icon: "warning",
      buttons: ['إلغاء', 'تسجيل خروج'],
      inputPlaceholder: "أدخل اسم المستخدم",
      dangerMode: true,
    })
    .then((inputValue) => {
      if (inputValue) {
        if (inputValue === false || inputValue === "") {
          alert('qwe');
          swal({
            text: "اسم المستخدم غير متطابق",
            button: "حسنا"
          });
         // swal.showInputError("يجب أن تقوم بإدخال اسم المستخدم");
          return false
        }
        var loggedin_username = localStorage.username;
        if(loggedin_username == inputValue){
          logoutAction();
        }else{
          swal({
            text: "اسم المستخدم " + inputValue + " غير صحيح",
            button: "حسنا"
          });
          return false
        }
      }else{
        swal({
          text: "يجب أن تقوم بإدخال اسم المستخدم",
          button: "حسنا"
        });
      }
    });

  });

  $('img#danger, img#help').on('click', function(event) {
    swal({
      title: 'قريبا! في النسخة القادمة',
      timer: 2000,
      button: false
    });
  });

})