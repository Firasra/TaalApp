$("#loader_container").show();
$(document).ready(function(){

  changeLanguage();
  isLoggedin();

});

function loggedin(){
    loadPage('home.html');
}

function notLoggedin(){
    $("#loader_container").fadeOut('slow');
}
