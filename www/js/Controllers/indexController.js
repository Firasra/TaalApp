$(document).ready(function(){

  changeLanguage();
  isLoggedin();

});

function loggedin(){
    loadPage('home.html');
}

function notLoggedin(){
    logout();
}
