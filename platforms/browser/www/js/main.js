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
        } 
      }
      $("#loader_container").hide();
      $("#loginError").html(translation[choosedLanguage]['LOGIN_ERROR']);

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
  $("#loader_container").show();
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

function toggle_sidebar(){
  var sidebar    = document.getElementById("sidebar");
  var toggle_img = document.getElementById("toggle_img");
  $("#toggle_img").toggleClass('flipped');

  if(sidebar.style.left == "-200px")
  {
      sidebar.style.left = "0px";
      toggle_img.style.left = "200px";
  }
  else
  {
      sidebar.style.left = "-200px";
      toggle_img.style.left = "0px";
  }
}

$(document).ready(function(){
  $("#logoutButton").click(function(){
    swal({
      title: "تحذير",
      text: "لتسجيل الخروج يجب إدخال اسم المستخدم",
      type: "input",
      showCancelButton: true,
      closeOnConfirm: false,
      animation: "slide-from-top",
      inputPlaceholder: "أدخل اسم المستخدم",
      confirmButtonText: "تسجيل خروج",
      cancelButtonText: "إلغاء",
    },
    function(inputValue){
      if (inputValue === false) return false;
      
      if (inputValue === "") {
        swal.showInputError("يجب أن تقوم بإدخال اسم المستخدم");
        return false
      }
      var loggedin_username = localStorage.username;
      if(loggedin_username == inputValue){
        logoutAction();
      }else{
        swal.showInputError("اسم المستخدم غير متطابق");
        return false
      }
      
    });

    // swal({
    //   title: "تحذير",
    //   text: "هل بالتأكيد تريد تسجيل الخروج؟",
    //   type: "warning",
    //   showCancelButton: true,
    //   confirmButtonColor: "#DD6B55",
    //   confirmButtonText: "نعم!",
    //   cancelButtonText: "لا",
    //   closeOnConfirm: false
    // },
    // function(){
    //   logoutAction();
    // });
    
  });

  $('img#danger, img#help').on('click', function(event) {
    swal({
      title: 'قريبا! في النسخة القادمة',
      timer: 2000,
      showConfirmButton: false
    });
  });
  // $("#selfHelp, #localHelp, #remoteHelp").click(function(){
  //   swal({
  //     title: 'قريبا! في النسخة القادمة',
  //     timer: 2000,
  //     showConfirmButton: false
  //   });
  // });
})