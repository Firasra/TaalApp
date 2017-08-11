$(document).ready(function(){
  isLoggedin();
  changeLanguage();

  $("#faq_wrapper").hide();
});

function loggedin(){
    $("#loader_container").fadeOut('slow');
}

function notLoggedin(){
    logout();
}

function faqAction(form){
  $("#loader_container").show();
  var form_data = {'site_faq_ids' : getFormParams(form)};
  var token    = typeof localStorage.auth_token !== 'undefined' ? localStorage.auth_token : '';
  var username = typeof localStorage.username !== 'undefined' ? localStorage.username : '';

  $.ajax({
    type: "POST", 
    crossDomain: true, 
    url: serverSite+"api/user_site_faq", 
    dataType: 'json', 
    cache: false, 
    headers:{ "username" : username, "token": token },
    data: form_data
  }).done(function(response) {
    loadPage('home.html');
  }); 
  return false;
}

function getFaq(){
  $("#loader_container").show();
  $("#faq_text_wrapper").hide();
  var token    = typeof localStorage.auth_token !== 'undefined' ? localStorage.auth_token : '';
  var username = typeof localStorage.username !== 'undefined' ? localStorage.username : '';
  var site_id = typeof localStorage.site_id !== 'undefined' ? localStorage.site_id : '';
  $.ajax({
    type: "GET", 
    crossDomain: true, 
    url: serverSite+"api/site_faq",
    dataType: 'json', 
    cache: false, 
    headers: {"username":username, "token":token},
    data: {"site": parseInt(site_id)}
  }).done(function(response) {
    if(typeof response.success !== 'undefined' && response.success &&
        typeof response.data !== 'undefined'){
          var site = response.data.site;
          var faqs = site.faq;
          for(var i in faqs){
            var element = '';
            var koko = '{"koko": "aaa", "bobo": "bbb"}';
            switch(faqs[i].type) {
              case 'text1':
                element = '<li><label for="'+ faqs[i].site_faq_id +'">' + faqs[i].text + '</label>' +
                          '<input type="text" name="' + faqs[i].site_faq_id + '"/> </li>';
                break;
              
              case 'textarea':
                element = '<li><label for="'+ faqs[i].site_faq_id +'">' + faqs[i].text + '</label>' +
                          '<textarea type="text" name="' + faqs[i].site_faq_id +'" /> </li>';
                break;

              case 'text':
                element = '<li><label for="'+ faqs[i].site_faq_id +'">' + faqs[i].text + '</label>';
                var attrs = JSON.parse(koko);// JSON.parse(faqs[i].attr)
                for(var j in attrs){
                  element += '<div class="task_koko" ><input type="radio" id="aaa_' + faqs[i].site_faq_id + '_' + j + '" name="' + faqs[i].site_faq_id + '" value="' + attrs[j] + '" /> <label for="aaa_' + faqs[i].site_faq_id + '_' + j + '"><span><span></span></span>' + attrs[j] + '</label></div>';
                }
                element += '</li>';
                break;
            }
            $("ul#faq").append(element);
          }

    }
        
    $("#loader_container").fadeOut("slow");
    $("#faq_wrapper").show();
  });
}