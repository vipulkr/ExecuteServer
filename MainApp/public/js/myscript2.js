(function(){
  //$('ul.nav-left-ml').toggle();
  $('.columns').droppable({
    drop: function(event, ui) {
      $this = $(this).children('ul');
      $this.find(".placeholder").remove();
      //$("<li></li>").text(ui.draggable.text()).appendTo($this);
      $("<li>" + ui.draggable.text() + "<button type='button' class='close'>&times;</button></li>").appendTo($this);
      var ht = parseInt($this.parent().outerHeight());
      console.log(ht);
      ht = (ht-39)/2;
      $this.parent().parent().children('.col-xs-2').animate({
         'padding-top' : ht+'px',
         'padding-bottom' : ht+'px'
      });

    }
  });

  $('.columns').on('click', 'button' , function () {
    var pt = $(this).parent().parent().parent();
    $(this).parent().remove();
    var len = pt.find('ul li').length;
    console.log(len);
    if(len == 0) {
      $("<li class='placeholder'>Drag measures/dimensions here</li>").appendTo(pt.children('ul'));
    }
    var ht = parseInt(pt.outerHeight());
    console.log(ht);
    ht = (ht-39)/2;
    pt.parent().children('.col-xs-2').animate({
       'padding-top' : ht+'px',
       'padding-bottom' : ht+'px'
    });
  });

  $('#url').on('keyup', function(e){
   if(e.keyCode === 13) {
     var parameters = { xmlaServer: $(this).val(), pathName: "/" };
       $.get( '/get_children',parameters, function(data) {
         console.log(data);
         $('#myModal #dataSource').children().remove();
         $('#myModal select.dataSourceNameList').append($("<option>Select</option>"));
         data.forEach(function(item){
          console.log(item.DataSourceName);
          var option = $("<option value=" +  item.DataSourceName + ">" + item.DataSourceName + "</option>");
          $('#myModal select.dataSourceNameList').append(option);
       });
     },'json');
    };
  });

  $('#myModal #dataSource').on('change', function() {
    var parameters = {xmlaServer: $('#url').val(), pathName: "/"+$(this).val()};
    console.log(parameters);
    $.get('/get_children', parameters, function(data) {
      console.log(data);
      $('#myModal #catalog').children().remove();
      $('#myModal #catalog').append($("<option>Select</option>"));
      data.forEach(function(item){
       console.log(item.CATALOG_NAME);
       var option = $("<option value=" +  item.CATALOG_NAME + ">" + item.CATALOG_NAME + "</option>");
       $('#myModal select.catalogNameList').append(option);
      });
    }, 'json');
  });

  $('#myModal #catalog').on('change', function() {
    var parameters = {xmlaServer: $('#url').val(), pathName: "/"+ $('#dataSource').val() + "/" + $(this).val()};
    console.log(parameters);
    $.get('/get_children', parameters, function(data) {
      console.log(data);
      $('#myModal #cube').children().remove();
      $('#myModal #cube').append($("<option>Select</option>"));
      data.forEach(function(item){
       console.log(item.CUBE_NAME);
       var option = $("<option value=" +  item.CUBE_NAME + ">" + item.CUBE_NAME + "</option>");
       $('#myModal select.cubeNameList').append(option);
      });
    }, 'json');
  });

  function generateLI(item) {
    return $("<li><label class='nav-toggle nav-header'><span class='nav-toggle-icon glyphicon glyphicon-chevron-right'></span><a href='#'>" + item + "</a></label></li>");
  }

  function generateUL() {
    return $("<ul class='nav nav-list nav-left-ml'></ul>");
  }

  $('.modal-footer #save').on('click', function(){
    // console.log($('#cube option:selected').text());
    var parameters = {
                      xmlaServer: $('#url').val(),
                      pathName: "/"+ $('#dataSource').val() + "/" + $('#catalog').val() + "/" + $('#cube option:selected').text()
                    };
    // console.log(parameters);
    $('#left-menu-wrapper #cubeName').text($('#cube option:selected').text());
    $.get('/get_children', parameters, function(data) {
      $('div#dim-div ul').children().remove();
      $('div#measures-div ul').children().remove();
      data.forEach(function(item){
       var li = generateLI(item.DIMENSION_NAME);
       li.data('unique-name', item.DIMENSION_UNIQUE_NAME);
       li.data('path-name', parameters.pathName + "/" + item.DIMENSION_UNIQUE_NAME);
       if(item.DIMENSION_NAME == "Measures") {
         li.appendTo('div#measures-div ul');
       } else {
         li.appendTo('div#dim-div ul');
       }
      });
    }, 'json');
  });

  $('#dim-div, #measures-div').on('click', 'label', function() {
    if($(this).parent().children('ul').length == 0) {
      var parameters = {xmlaServer: $('#url').val(), pathName: $(this).parent().data('path-name')};
      console.log(parameters.pathName);
      var childUL = generateUL();
      childUL.appendTo($(this).parent()).toggle();
      $.get('/get_children', parameters, function(data) {
        data.forEach(function(item){
         if(item.DESCRIPTION == undefined) {
           var key = "MEMBER";
         } else {
           var keys = item.DESCRIPTION.split(" ");
           var key = keys[keys.length - 1].toUpperCase();
         }
         var jname = key + "_NAME";
         var unique_name = key + "_UNIQUE_NAME";
         if(key == "MEMBER") {
           var li = $("<li><a href='#'>" + item[jname] + "</a></li>");
         } else {
           var li = generateLI(item[jname]);
         }
         li.data('unique-name', item[unique_name]);
         li.data('path-name', parameters.pathName + "/" + item[unique_name]);
         li.appendTo(childUL);
        });
      }, 'json');
    }
  });

  $('#dim-div,#measures-div').on('click', 'label' , function () {
    $this = $(this).children('span');
    $this.parent().parent().children('ul.nav-left-ml').toggle(300);
    var cs = $this.attr("class");
    if(cs == 'nav-toggle-icon glyphicon glyphicon-chevron-right') {
      $this.removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
    }
    if(cs == 'nav-toggle-icon glyphicon glyphicon-chevron-down') {
      $this.removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-right');
    }
  });

  $('#executeButton').on('click', jsondata);
}());
