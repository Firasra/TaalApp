$("#loader_container").show();
var site_data = {};

$(document).ready(function(){

  isLoggedin();
  changeLanguage();
  startScanning();
  //$('button#startScanning').click();

  localStorage.removeItem('site_start');

  goToStart();

  $("#site_title").hide();
  $("#site_data_wrapper").hide();
  $("#startScanning").show();

  $("#go_to_stations").click(function(){
    goToStations();
  });

  $("div#stations").on("click", "button#go_to_tasks", function(){
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

  $("div").on('click', "button#next_station", function(){
    var next_station = $("div#stations").attr('next_station');
    goToSpecificStationTasks( next_station );
    activeSlick();
    $("button#next_station").addClass('hide');
  });

  $("div").on('click', "button#finish_site",function(){
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

  $("#loader_container").show();

  $('#tasks_wrapper').slick({
    rtl: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: false,
    asNavFor: '#tasks_nav',
    infinite: false
  });

  var tasks_number = $('#tasks_nav .task_nav').length;

  $('#tasks_nav').slick({
    rtl: true,
    slidesToShow: tasks_number,
    slidesToScroll: 1,
    asNavFor: '#tasks_wrapper',
    dots: true,
    centerMode: false,
    focusOnSelect: true,
    infinite: false
  });
  
  $("#loader_container").fadeOut("slow");
  $("#myAudioElement0")[0].play();
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
  $("#loader_container").show();
  $("button#go_to_stations").addClass('hide');
  $("div#stations_wrapper").hide();
  $("div#tasks_wrapper").hide();
  $("div#tasks_nav").hide();
  $("button#next_station").addClass('hide');
  $("button#finish_site").addClass('hide');
  $("#loader_container").fadeOut("slow");
}

function goToStations(){
  $("#loader_container").show();
  $("#site_wrapper").hide();
  $("div#stations_wrapper").show();
  $("#loader_container").fadeOut("slow");
}

function startTasks(){
  $("#loader_container").show();
  $("div#stations_wrapper").hide();
  $("div#tasks_wrapper").show();
  $("div#tasks_nav").show();
  $("div#current_station").removeClass('hide'); 
  activeSlick();
  $("#loader_container").fadeOut("slow");
}

function goToSpecificStationTasks(station_number){
  $("#loader_container").show();
  $("div#tasks_wrapper").html('');
  $("div#tasks_nav").html('');
  var station = site_data.stations[station_number];
  $("div#current_station").empty();
  $("div#current_station").append('<h2>' + station.name +'</h2>');
  $("div#current_station").removeClass('hide');
  for(var j in station.tasks){
    var task = station.tasks[j];
    var task_nav_html = '<div class="task_nav">' + task.name + '</div>';
    var task_html = '<div class="task">';

    if(typeof task.name !== 'undefined' && task.name !== ''){
      task_html += '<div>' + task.name + '</div>';
    }

    if(typeof task.picture !== 'undefined' && task.picture !== ''){
      task_html += '<img src="' + serverSite + 'uploads/images/' + task.picture + '" class="task_img" />';
    }

    if(typeof task.description !== 'undefined' && task.description !== ''){
      task_html += '<div class="task_description" >' + task.description + '</div>';
    }
    
    if(typeof task.sound !== 'undefined' && task.sound !== ''){
      task_html +=  '<audio id="myAudioElement' + j + '" controls>' +
                      '<source src="' + serverSite + 'uploads/sounds/' + task.sound + '" type="audio/ogg">' +
                      '<source src="' + serverSite + 'uploads/sounds/' + task.sound + '" type="audio/mpeg">' +    
                    '</audio>';
    }
    
    task_html += '</div>';

    $("div#tasks_wrapper").append(task_html);
    $("div#tasks_nav").append(task_nav_html);
  }
    
  $("div#stations").attr('next_station', Number(station_number)+1);
  $("div#tasks_wrapper").attr('class', '');
  $("div#tasks_nav").attr('class', '');

  var task_html = '<div class="task">';
  var next_station = $("div#stations").attr('next_station');
  if( next_station < site_data.stations.length ){
    task_html += '<button id="next_station" class="btn btn-success" translate="NEXT_STATION">' + translation[choosedLanguage]['NEXT_STATION'] + '</button>';
  }else{
    task_html += '<button id="finish_site" class="btn btn-success" translate="FINISH">' + translation[choosedLanguage]['FINISH'] + '</button>'
  }
  task_html += '</div>';
  $("div#tasks_wrapper").append(task_html);

  $("#loader_container").fadeOut("slow");
}

function goToFaqs(){
  loadPage('faq.html');
}

function startScanning() {     
    $('button#startScanning').click( function() {
    
      $("#loader_container").show();
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
                localStorage.site_id = site_data.id;
                var stations = site_data.stations;
                $("#site_title").show();
                $("#site_data_wrapper").show();   
                $("#startScanning").hide();
                
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
                  for(var i in stations){
                    var station = stations[i];
                    var id = i == 0 ? 'id="go_to_tasks"' : '';
                    var buttonClass = i == 0 ? 'btn-success' : 'btn-default';
                    $("div#stations").append('<button type="button" ' + id + ' class="btn ' + buttonClass + ' station">'+station.name+'</button>');
                    if( i < stations.length -1){
                      $("div#stations").append('<div class="vertical_line"></div>');
                    }
                    // insert tasks data of first station            
                    $("div#stations").attr('next_station', 1);
                  }
                  goToSpecificStationTasks(0);
                }
                
            }
            $("div#current_station").addClass('hide');
            $("button#go_to_stations").removeClass('hide');
            $("#loader_container").fadeOut("slow");
            localStorage.site_start = Math.floor(Date.now() / 1000);
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