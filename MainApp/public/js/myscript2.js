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

  function generateLI(item) {
    return $("<li><label class='nav-toggle nav-header'><span class='nav-toggle-icon glyphicon glyphicon-chevron-right'></span><a href='#'>" + item + "</a></label></li>");
  }

  function generateUL() {
    return $("<ul class='nav nav-list nav-left-ml'></ul>");
  }

  $('#url').on('keyup', function(e){
   if(e.keyCode === 13) {
     var parameters = { xmlaServer: $(this).val(), pathName: "/" };
       $.get( '/get_children',parameters, function(data) {
         console.log(data);
         $('#myModal #dataSource').children().remove();
         $('#myModal select.dataSourceNameList').append($("<option>select</option>"));
         data.values.forEach(function(item){
          console.log(item.caption_name);
          var option = $("<option value=" +  item.caption_name + ">" + item.caption_name + "</option>");
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
      $('#myModal #catalog').append($("<option>select</option>"));
      data.values.forEach(function(item){
       console.log(item.caption_name);
       var option = $("<option value=" +  item.caption_name + ">" + item.caption_name + "</option>");
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
      $('#myModal #cube').append($("<option>select</option>"));
      data.values.forEach(function(item){
       console.log(item.caption_name);
       var option = $("<option value=" +  item.caption_name + ">" + item.caption_name + "</option>");
       $('#myModal select.cubeNameList').append(option);
      });
    }, 'json');
  });

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
      data.values.forEach(function(item){
       var li = generateLI(item.caption_name);
       li.data('unique-name', item.unique_name);
       li.data('path-name', parameters.pathName + "/" + item.unique_name);
       if(item.caption_name == "Measures") {
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
        var level = data.key;
        data.values.forEach(function(item){
         if(level == "MEMBER") {
           var li = $("<li><a href='#'>" + item.caption_name + "</a></li>");
         } else {
           var li = generateLI(item.caption_name);
         }
         li.data('unique-name', item.unique_name);
         li.data('path-name', parameters.pathName + "/" + item.unique_name);
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
