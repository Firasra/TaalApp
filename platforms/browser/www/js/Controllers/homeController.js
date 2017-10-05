$("#loader_container").show();
var site_data = {};

$(document).ready(function(){

  isLoggedin();
  changeLanguage();
  startScanning();
  //$('button#startScanning').click();
  localStorage.removeItem('site_start');
  goToStart();

  // prevent swiping left
  $('.site_data').on('swipe', function(event, slick, direction){
    if( direction === 'right' ){
      $('.site_data').slick('slickNext');
    }
    setTitle();
  });

  $(".site_data").on('beforeChange', function(event, slick, currentSlide, nextSlide){
    turnOffAudio();
  });

  $(".site_data").on('afterChange', function(event, slick, currentSlide){
    $("div.site_data .slick-active audio")[0].loop = true;;
    $("div.site_data .slick-active audio")[0].play();  
    $("div.site_data .slick-active img.audio_play").attr('src', 'images/icons/mute.png');
  });

  // when slider get to the end
  $('.site_data').on('edge', function(event, slick, direction){
    if( direction === 'left' ){
      goToFaqs();
    }
  });

  // go to previous slide
  $('.previous_station').on('click', function(event){
    $('.site_data').slick('slickPrev');
    setTitle();
  });

  $('div.site_data').on('click', 'img.audio_play', function(event) {
    var audio_el = $(this).parent().find('audio');
    if(audio_el[0].paused == false) {
        $(this).attr('src', 'images/icons/audio.png');
        audio_el[0].pause();
    }else {
        $(this).attr('src', 'images/icons/mute.png');
        audio_el[0].play();
    }
    event.preventDefault();
  });

});

function turnOffAudio(){
  $("audio").each(function(){
    $(this).parent().find('img.audio_play').attr('src', 'images/icons/audio.png');
    this.pause(); // Stop playing
    this.currentTime = 0; // Reset time
  })
}

function setTitle(){
  var title = $('.site_data .slick-active .object_data').data('name');
  $("h1#page_title").html(title);
}

function activeSlick(selector, options){
  $(selector).slick(options);
}

function loggedin(){

}

function notLoggedin(){
    logout();
}

function goToStart(){
  $("#loader_container").show();
  $("button#startScanning").removeClass("hidden");
  $("div.site_data, div.site_current_station, div.site_stations").addClass("hidden");
  $("#loader_container").fadeOut("slow");
}

function goToFaqs(){
  turnOffAudio();
  var site_start = localStorage.site_start;
  var current_time = Math.floor(Date.now() / 1000);
  var time_diff = current_time - site_start;
  var minutes = Math.round(Number(time_diff/60));
  var seconds = time_diff - (minutes*60);
  var text = translation[choosedLanguage]['SITE_TIME'] + ' ' + minutes + ' ' + 
             translation[choosedLanguage]['MINUTES'] + ' ' + translation[choosedLanguage]['AND'] + ' ' +
             seconds + ' ' + translation[choosedLanguage]['SECONDS'];

  swal({
    title: translation[choosedLanguage]['GOOD_WORK'],
    text: text,
    icon: "success",
    button: translation[choosedLanguage]['GO_TO_FAQS'],
    closeOnClickOutside: false
  }).then(() => {
    loadPage('faq.html');
  });
}

function startScanning() {
    $('button#startScanning').click( function() {
      $("div#user_profile_description.collapse").removeClass('in');
      $("#loader_container").show();
      cordova.plugins.barcodeScanner.scan(
      function (result) {
        // alert("We got a barcode\n" +
        //     "Result: " + result.text + "\n" +
        //     "Format: " + result.format + "\n" +
        //     "Cancelled: " + result.cancelled);
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
            if(typeof response.success !== 'undefined' && response.success &&
               typeof response.data !== 'undefined'){     
                site_data = response.data.site;
                localStorage.site_id = site_data.id;
                var stations = site_data.stations;

                 // insert site data
                if(typeof site_data.name !== 'undefined' && site_data.name !== ''){
                  $("h1#page_title").html(site_data.name);
                }

                var site_sound =  '<audio id="site_sound" controls>' +
                                    '<source src="' + serverSite + 'uploads/sounds/' + site_data.sound + '" type="audio/ogg">' +
                                    '<source src="' + serverSite + 'uploads/sounds/' + site_data.sound + '" type="audio/mpeg">' +
                                  '</audio>';
                site_sound += '<img class="audio_play" src="images/icons/mute.png" />';

                element = '<div>' +
                            '<div class="col-md-4 object_data" data-name="' + site_data.name + '">' +
                              '<div>' + site_data.description + '</div>' +
                              '<div>' + site_sound + '</div>' +
                            '</div>' +
                            '<div id="site_img_wrapper" class="col-md-8">' +
                              '<img id="site_image" src="' + serverSite+'uploads/images/' + site_data.picture + '" />' +
                            '</div>' +
                          '</div>';
                $("div.site_data").append(element);

                var options = {
                  rtl: true,
                  slidesToShow: 1,
                  slidesToScroll: 1,
                  arrows: false,
                  fade: false,
                  initialSlide: 0,
                  waitForAnimate: false,
                  edgeFriction: 0,
                  infinite: false
                }

                for(var i in stations){
                  var station = stations[i];
                  var tasks = station.tasks;
                  for(var j in tasks){
                    var task = tasks[j];
                    var task_sound =  '<audio id="site_sound" controls>' +
                                            '<source src="' + serverSite + 'uploads/sounds/' + task.sound + '" type="audio/ogg">' +
                                            '<source src="' + serverSite + 'uploads/sounds/' + task.sound + '" type="audio/mpeg">' +
                                          '</audio>';
                    task_sound += '<img class="audio_play" src="images/icons/mute.png" />';
                    element = '<div>' +
                                '<div class="col-md-4 object_data" data-name="' + station.name + '">' +
                                  '<div>' + task.description + '</div>' +
                                  '<div>' + task_sound + '</div>' +
                                '</div>' +
                                '<div id="site_img_wrapper" class="col-md-8">' +
                                  '<img id="site_image" src="' + serverSite+'uploads/images/' + task.picture + '" />' +
                                '</div>' +
                              '</div>';
                    $("div.site_data").append(element);
                  }
                }

                $("button#startScanning").addClass("hidden");
                $("div.site_data").removeClass("hidden");
                $("img.previous_station").removeClass("hidden");
                $("img#home_icon").removeClass("hidden");
                $("#loader_container").fadeOut("slow");
                activeSlick("div.site_data", options);
                $("div.site_data .slick-active audio")[0].loop = true;;
                $("div.site_data .slick-active audio")[0].play();  
                localStorage.site_start = Math.floor(Date.now() / 1000);

            }else{
              $("#loader_container").fadeOut("slow");
              return;
            }
          });
      },
      function (error) {
          $("#loader_container").fadeOut("slow");
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