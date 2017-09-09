$("#loader_container").show();
var site_data = {};

$(document).ready(function(){

  isLoggedin();
  changeLanguage();
  startScanning();
  //$('button#startScanning').click();

  localStorage.removeItem('site_start');

  goToStart();

  $("div").on('click', ".station_slider.slick-active", function(){
    goToSpecificStationTasks( $(this).attr('id') );
  })

  $("div").on('click', 'img.next_station', function(){
    var next_station = parseInt($(".station_slider.selected").attr('id'));
    goToSpecificStationTasks(next_station+1);
  })

});

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

function goToSpecificStationTasks(station_number){
  if( station_number == -1 || $(".station_slider.selected").attr('id') == station_number || site_data.stations.length <= station_number )
    return;
  
  $("div.site_data").addClass('hidden');
  $("div.site_current_station").removeClass('hidden');
  var station = site_data.stations[station_number];

  $("div.site_current_station #station_title").html(station.name);
  $("div.site_current_station #station_description").html(station.description);

  $("img#station_image").attr('src', serverSite+'uploads/images/' + station.picture);
  
  if(typeof station.sound !== 'undefined' && station.sound !== ''){
    var site_sound =  '<audio id="site_sound" controls>' +
                        '<source src="' + serverSite + 'uploads/sounds/' + station.sound + '" type="audio/ogg">' +
                        '<source src="' + serverSite + 'uploads/sounds/' + station.sound + '" type="audio/mpeg">' +    
                      '</audio>';
    $("div#station_sound").html(site_sound);
  }

  $(".station_slider").each(function(){
    $(this).removeClass('selected');
  })

  $('.station_slider#'+station_number).addClass('selected');
}

function goToFaqs(){
  loadPage('faq.html');
}

function startScanning() {     
    $('button#startScanning').click( function() {
    
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
                  $("h1#site_title").html(site_data.name);    
                }
                if(typeof site_data.description !== 'undefined' && site_data.description !== ''){
                  $("div#site_description").html(site_data.description);
                }
                if(typeof site_data.picture !== 'undefined' && site_data.picture !== ''){
                  $("img#site_image").attr('src', serverSite+'uploads/images/' + site_data.picture);
                }
                if(typeof site_data.sound !== 'undefined' && site_data.sound !== ''){
                  var site_sound =  '<audio id="site_sound" controls>' +
                                      '<source src="' + serverSite + 'uploads/sounds/' + site_data.sound + '" type="audio/ogg">' +
                                      '<source src="' + serverSite + 'uploads/sounds/' + site_data.sound + '" type="audio/mpeg">' +    
                                    '</audio>';
                  $("div#site_sound").html(site_sound);
                }
                
                // insert stations data
                if(stations.length !== 0){   
                  $("div.site_container div.site_stations_wrapper").empty();             
                  for(var i in stations){
                    var station = stations[i];
                    var station_el = '<div id="'+ i +'" class="station_slider" ><img src="' + serverSite + 'uploads/images/' + station.picture + '" /></div>';
                    $("div.site_container div.site_stations_wrapper").append(station_el);             
                  }
                  goToSpecificStationTasks(-1);
                }
                
            }

            localStorage.site_start = Math.floor(Date.now() / 1000);

            var selector = "div.site_container div.site_stations_wrapper";
            var options = {
              rtl: true,
              slidesToShow: 4,
              slidesToScroll: 1,
              arrows: false,
              fade: false,
              infinite: false
            }
            $("button#startScanning").addClass("hidden");
            $("div.site_data, div.site_stations").removeClass("hidden");
            $("#loader_container").fadeOut("slow");
            activeSlick(selector, options)
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