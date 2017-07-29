var site_data = {};

$(document).ready(function(){

  isLoggedin();
  changeLanguage();
  startScanning();
  //$('button#startScanning').click();

  goToStart();

  $("#go_to_stations").click(function(){
    goToStations();
  });

  $("#go_to_tasks").click(function(){
    startTasks();
  });

  // On before slide change
  $('#tasks_wrapper').on('beforeChange', function(event, slick, currentSlide, nextSlide){
    var tasks_number = $("#tasks_wrapper .task").length;
    // when slider gets to the end
    if( tasks_number-1 === nextSlide){
      var next_station = $("div#stations").attr('next_station');
      if( next_station < site_data.stations.length ){
        $("button#next_station").removeClass('hide');
      }else{
        $("button#finish_site").removeClass('hide');
      }
      
    }
  });

  $("button#next_station").click(function(){
    var next_station = $("div#stations").attr('next_station');
    goToSpecificStationTasks( next_station );
    activeSlick();
    $("button#next_station").addClass('hide');
  });

  $("button#finish_site").click(function(){
    goToFaqs();
  });

});

function activeSlick(){
  /* $('#site_wrapper').slick({
    rtl: false,
    dots: true,
    infinite: false,
    speed: 300,
    slidesToShow: 1,
    arrows: true,
    adaptiveHeight: true
  });*/


  $('#tasks_wrapper').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: false,
    asNavFor: '#tasks_nav',
    infinite: false
  });

  var tasks_number = $('#tasks_nav .task_nav').length;

  $('#tasks_nav').slick({
    slidesToShow: tasks_number,
    slidesToScroll: 1,
    asNavFor: '#tasks_wrapper',
    dots: true,
    centerMode: false,
    focusOnSelect: true,
    infinite: false
  });
}   

function loggedin(){
    
}

function notLoggedin(){
    logout();
}

function clearSiteData(){
  $("div#stations").html('');
  $("div#tasks_wrapper").html('');
  $("div#tasks_nav").html('');

  $("div#tasks_wrapper").attr('class', '');
  $("div#tasks_nav").attr('class', '');
}

function goToStart(){
  $("button#go_to_stations").addClass('hide');
  $("div#stations_wrapper").hide();
  $("div#tasks_wrapper").hide();
  $("div#tasks_nav").hide();
  $("button#next_station").addClass('hide');
  $("button#finish_site").addClass('hide');
}

function goToStations(){
  $("#site_wrapper").hide();
  $("div#stations_wrapper").show();
}

function startTasks(){
  $("div#stations_wrapper").hide();
  $("div#tasks_wrapper").show();
  $("div#tasks_nav").show();
  $("div#current_station").removeClass('hide'); 
  activeSlick();
}

function goToSpecificStationTasks(station_number){
  $("div#tasks_wrapper").html('');
  $("div#tasks_nav").html('');
  var station = site_data.stations[station_number];
  $("div#current_station").html(station.name);
  $("div#current_station").removeClass('hide');
  for(var j in station.tasks){
    var task = station.tasks[j];
    var task_nav_html = '<div class="task_nav">' + task.name + '</div>';
    var task_html = '<div class="task">' + task.name + '</div>';
    $("div#tasks_wrapper").append(task_html);
    $("div#tasks_nav").append(task_nav_html);
  }
  
  $("div#stations").attr('next_station', station_number+1);
  $("div#tasks_wrapper").attr('class', '');
  $("div#tasks_nav").attr('class', '');
}

function goToFaqs(){
  loadPage('faq.html');
}

function startScanning() {     
    $('button#startScanning').click( function() {
      
      clearSiteData();
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
                 var stations = site_data.stations;
                 // insert site data
                $("h1#site_title").html(site_data.name);    
                $("div#site_description").html(site_data.description);
                // insert stations data
                if(stations.length !== 0){   
                  for(var i in stations){
                    var station = stations[i];
                    $("div#stations").append('<div>'+station.name+'</div>');
                    // insert tasks data of first station            
                    $("div#stations").attr('next_station', 1);
                  }
                  goToSpecificStationTasks(0);
                }
                
            }
            $("div#current_station").addClass('hide');
            $("button#go_to_stations").removeClass('hide');
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