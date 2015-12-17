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
       $.get( '/dimension_details',parameters, function(data) {
         console.log(data);
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
    $.get('/dimension_details', parameters, function(data) {
      console.log(data);
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
    $.get('/dimension_details', parameters, function(data) {
      console.log(data);
      data.forEach(function(item){
       console.log(item.CUBE_NAME);
       var option = $("<option value=" +  item.CUBE_NAME + ">" + item.CUBE_NAME + "</option>");
       $('#myModal select.cubeNameList').append(option);
      });
    }, 'json');
  });

  $('.modal-footer #save').on('click', function(){
    // console.log($('#cube option:selected').text());
    var parameters = {xmlaServer: $('#url').val(), pathName: "/"+ $('#dataSource').val() + "/" + $('#catalog').val() + "/" + $('#cube option:selected').text()};
    // console.log(parameters);
    $('#left-menu-wrapper #cubeName').text($('#cube option:selected').text());
    $.get('/dimension_details', parameters, function(data) {
      var parentUL = $("<ul class='nav nav-list-main dimensions'></ul>");
      parentUL.appendTo("div#dim-div");
      data.forEach(function(item){
       console.log(item.DIMENSION_NAME);
       var li = $("<li><label class='nav-toggle nav-header dimension-unique-name'><span class='nav-toggle-icon glyphicon glyphicon-chevron-right'></span><a href='#'>" + item.DIMENSION_NAME + "</a></label></li>");
       li.data('unique-name', item.DIMENSION_UNIQUE_NAME);
       li.appendTo(parentUL);
      });
    }, 'json');
  });

  $('#dim-div').on('click', '.dimension-unique-name', function() {
    if($(this).parent().children('ul').length == 0) {
      var parameters = {xmlaServer: $('#url').val(), pathName: "/"+ $('#dataSource').val() + "/" + $('#catalog').val() + "/" + $('#cube option:selected').text() + "/" + $(this).parent().data('unique-name')};
      // console.log(parameters);
      var childUL = $("<ul class='nav nav-list nav-left-ml'></ul>");
      childUL.appendTo($(this).parent()).toggle();
      $.get('/hierarchy_details', parameters, function(data) {
        data.forEach(function(item){
         console.log(item.HIERARCHY_NAME);
         var li = $("<li><label class='nav-toggle nav-header hierarchy-unique-name'><span class='nav-toggle-icon glyphicon glyphicon-chevron-right'></span><a href='#'>" + item.HIERARCHY_NAME + "</a></label></li>");
         li.data('unique-name', item.HIERARCHY_UNIQUE_NAME);
         li.appendTo(childUL);
        });
      }, 'json');
    }
  });

  $('#dim-div').on('click', '.hierarchy-unique-name', function() {
    if($(this).parent().children('ul').length == 0) {
      var parameters = {xmlaServer: $('#url').val(), pathName: "/"+ $('#dataSource').val() + "/" + $('#catalog').val() + "/" + $('#cube option:selected').text() + "/" + $(this).parent().parent().parent().children('.dimension-unique-name').parent().data('unique-name') + "/" + $(this).parent().data('unique-name')};
      // console.log(parameters);
      var childUL = $("<ul class='nav nav-list nav-left-ml'></ul>");
      childUL.appendTo($(this).parent()).toggle();
      $.get('/level_details', parameters, function(data) {
        data.forEach(function(item){
         console.log(item.LEVEL_NAME);
         var li = $("<li><label class='nav-toggle nav-header level-unique-name'><span class='nav-toggle-icon glyphicon glyphicon-chevron-right'></span><a href='#'>" + item.LEVEL_NAME + "</a></label></li>");
         li.data('unique-name', item.LEVEL_UNIQUE_NAME);
         li.appendTo(childUL);
        });
      }, 'json');
    }
  });

  $('#dim-div').on('click', '.level-unique-name', function() {
    if($(this).parent().children('ul').length == 0) {
      var parameters = {xmlaServer: $('#url').val(), pathName: "/"+ $('#dataSource').val() + "/" + $('#catalog').val() + "/" + $('#cube option:selected').text() + "/" + $(this).parent().parent().parent().parent().parent().children('.dimension-unique-name').parent().data('unique-name') + "/" + $(this).parent().parent().parent().children('.hierarchy_unique_name').parent().data('unique-name')+ "/" + $(this).parent().data('unique-name')};
      // console.log(parameters);
      var childUL = $("<ul class='nav nav-list nav-left-ml'></ul>");
      childUL.appendTo($(this).parent()).toggle();
      $.get('/member_details', parameters, function(data) {
        data.forEach(function(item){
         console.log(item.MEMBER_NAME);
         var li = $("<li><a href='#'>" + item.MEMBER_NAME + "</a></li>");
         li.data('unique-name', item.MEMBER_UNIQUE_NAME);
         li.appendTo(childUL).find('a').draggable({
           appendTo: "body",
           helper: "clone"
         });
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
