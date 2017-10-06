$(document).ready(function(){
  isLoggedin();
  changeLanguage();
  getFaq();
  
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
  for(var i in form_data['site_faq_ids']){
    if(form_data['site_faq_ids'][i] == ''){
      $("div#faqError").show();
      $("div#faqError").html(translation[choosedLanguage]['FAQ_ERROR']);
      $("div#faqError").attr('translate', translation[choosedLanguage]['FAQ_ERROR']);
      $("#loader_container").hide();
      return false;
    }
  }
  var token    = typeof localStorage.auth_token !== 'undefined' ? localStorage.auth_token : '';
  var username = typeof localStorage.username !== 'undefined' ? localStorage.username : '';

  form_data['username'] = username;

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
    headers: {"token":token},
    data: {"username":username, "site": parseInt(site_id)}
  }).done(function(response) {
    if(typeof response.success !== 'undefined' && response.success &&
        typeof response.data !== 'undefined'){
          var site = response.data.site;
          var faqs = site.faq;
          for(var i in faqs){
            var element = '';
            // var koko = '{"koko": "aaa", "bobo": "bbb"}';
            switch(faqs[i].type) {
              case 'text':
                element = '<li><label for="'+ faqs[i].site_faq_id +'" class="col-md-3">' + faqs[i].text + '</label>' +
                          '<input type="text" name="' + faqs[i].site_faq_id + '" class="col-md-9" /> </li>';
                break;
              
              case 'textarea':
                element = '<li><label for="'+ faqs[i].site_faq_id +'" class="col-md-3">' + faqs[i].text + '</label>' +
                          '<textarea name="' + faqs[i].site_faq_id +'" rows="4" class="col-md-9" /> </li>';
                break;

              case 'radio':
                element = '<li><label for="'+ faqs[i].site_faq_id +'" class="col-md-3">' + faqs[i].text + '</label>';
                var attrs = JSON.parse(faqs[i].attr);
                for(var j in attrs){
                  element += '<div class="question_wrapper" class="col-md-9" ><input type="radio" id="question_' + faqs[i].site_faq_id + '_' + j + '" name="' + faqs[i].site_faq_id + '" value="' + attrs[j] + '" /> <label for="question_' + faqs[i].site_faq_id + '_' + j + '"><span><span></span></span>' + attrs[j] + '</label></div>';
                }
                element += '</li>';
                break;

              case 'select':
                element = '<li><label for="'+ faqs[i].site_faq_id +'" class="col-md-3">' + faqs[i].text + '</label>';
                var attrs = JSON.parse(faqs[i].attr);
                element += '<div class="question_wrapper" class="col-md-9" > <select name="' + faqs[i].site_faq_id + '">';
                for(var j in attrs){
                  element += '<option id="question_' + faqs[i].site_faq_id + '_' + j + '" value="' + attrs[j] + '" >' + attrs[j] + '</option>';
                }
                element += '</select></div></li>';
                break;
              // case 'checkbox':
              //   element = '<li><label for="'+ faqs[i].site_faq_id +'">' + faqs[i].text + '</label>';
              //   var attrs = JSON.parse(faqs[i].attr);
              //   for(var j in attrs){
              //     element += '<div class="question_wrapper" ><input type="checkbox" id="question_' + faqs[i].site_faq_id + '_' + j + '" name="' + faqs[i].site_faq_id + '" value="' + attrs[j] + '" /> <label for="question_' + faqs[i].site_faq_id + '_' + j + '"><span><span></span></span>' + attrs[j] + '</label></div>';
              //   }
              //   element += '</li>';
              //   break;
            }
            $("ul#faq").append(element);
          }

    }
        
    $("#loader_container").fadeOut("slow");
    $("#faq_wrapper").show();
  });
}