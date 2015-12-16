function jsondata(){
  $("button#button").css('display','none');
  // jQuery for post request
  $.post(
      "/execute",
      { url: "http://172.23.238.252:8080/pentaho/Xmla?userid=admin&password=password",
        dataSource: "Pentaho",
        catalog: "SampleData",
        statement: "select NON EMPTY {[Measures].[Actual],[Measures].[Budget]} ON COLUMNS, "+
                    "NON EMPTY Crossjoin(Union({[Region].[All Regions]},{[Region].[All Regions].Children}),"+
                        " Crossjoin(Hierarchize(Union({[Department].[All Departments]}, "+
                          "[Department].[All Departments].Children)),Union({[Positions].[All Positions]},"+
                              " {[Positions].[All Positions].Children}))) ON ROWS from [Quadrant Analysis]"
      }
    ).done(function( data ) {
        renderData(data);
      });
}

function renderData(data){
    var axes = data.Axes,
        axis = axes.Axis,
        axis0 = axis[0],
        axis1 = axis[1];

/************************************ Axis0 Hierarchical Structure *****************************************/

    for ( var axis0HierLevel = 0, axis0HierLen = axis0[0].Member.length ;
            axis0HierLevel < axis0HierLen;
            axis0HierLevel++ )
      {
          captions = [];
          obj={};
          flag = false;
          count = 0;
          for (var axis0Index in axis0){
              if(!flag){
                  flag = true;
                  obj.caption = axis0[0].Member[axis0HierLevel].Caption;
                  obj.span = count;
                  captions.push(obj);
              }
              else if(obj.caption !== axis0[axis0Index].Member[axis0HierLevel].Caption){
                  if (obj.caption)
                  {
                    obj = {};
                  }
                  obj.caption = axis0[axis0Index].Member[axis0HierLevel].Caption;
                  count= 1;
                  obj.span = count;
                  captions.push(obj);
              }
              else {
                  count++;
                  for (var captionIndex in captions){
                      if (captions[captionIndex].caption ==
                            axis0[axis0Index].Member[axis0HierLevel].Caption)
                      {
                        captions[captionIndex].span = count;
                      }
                  }
              }
          }

          var template0 = $.trim($("#axis0_insersion").html()),
              frag0='<tr>';

          for( var axis1MemberIndex=0, axis1MemberLen = axis1[0].Member.length;
                axis1MemberIndex < axis1MemberLen;
                axis1MemberIndex++ )
            {
              frag0 += '<th></th>';
            }
          $.each(captions, function(index,obj){
            if (index < captions.length-1){
              frag0 += template0.replace(/{{axis0}}/ig, "<th colspan="+
                        parseInt(obj.span)+">"+obj.caption+"</th>");
            }
            else {
              frag0 += template0.replace(/{{axis0}}/ig, "<th colspan="+
                        parseInt(obj.span)+">"+obj.caption+"</th></tr>");
            }
          });
          $('#dataTableBody').append(frag0);
    }

    /* ********************************** Axis1 Hierarchical Structure **************************************** */


    var cellData = data.CellData,
        cells = cellData.Cell,
        val = [];
    for (var cellIndex in cells) {
        var valObj = {};
        valObj.value = cells[cellIndex].FmtValue;
        val.push(valObj);
      }

    count  = 0;
    var dataArray = [];
    for (var j = 0, len1 = axis1.length; j < len1; j++) {
      td='';
      var axis1Member = axis1[j].Member;
      var axis1Name = '';
      for(var memIndex1 in axis1Member){
        axis1Name = axis1Name+axis1Member[memIndex1].Caption+".";
      }
      var tempDataObj = {};
      for (var i = 0, len = axis0.length; i < len; i++) {
        td += "<td>"+val[count].value+"</td>";
        count++;
      }
      tempDataObj.td = td;
      dataArray.push(tempDataObj);
    }

    var captionsArray = [];
    for (var axis1HierLevel = 0, axis1HierLen = axis1[0].Member.length ; axis1HierLevel < axis1HierLen; axis1HierLevel++) {
      captions = [];
      obj={};
      flag = false;
      count = 0;
      for (var axis1Index in axis1){
        if(!flag){
          flag = true;
          obj.caption = axis1[0].Member[axis1HierLevel].Caption;
          obj.span = count;
          captions.push(obj);
        }
        if(obj.caption !== axis1[axis1Index].Member[axis1HierLevel].Caption){
          if (obj.caption){obj = {};}
          obj.caption = axis1[axis1Index].Member[axis1HierLevel].Caption;
          count= 1;
          obj.span = count;
          captions.push(obj);
        }
        else {
          count++;
          for (var caption1Index in captions){
            if (captions[caption1Index].caption == axis1[axis1Index].Member[axis1HierLevel].Caption){
              captions[caption1Index].span = count;
            }
          }
        }
      }
      captionsArray.push(captions);
    }
    captionsArray = shortCaptionsArray(captionsArray);
    appendRowData(captionsArray, dataArray);

    function shortCaptionsArray(captionsArray){
      for(var captionArrayIndex in captionsArray){
        if (parseInt(captionArrayIndex) < captionsArray.length-1){
          if (captionsArray[captionArrayIndex].length > captionsArray[parseInt(captionArrayIndex)+1].length){
            var temp = captionsArray[captionArrayIndex];
            captionsArray[captionArrayIndex] = captionsArray[parseInt(captionArrayIndex)+1];
            captionsArray[parseInt(captionArrayIndex)+1] = temp;
          }
        }
      }
      return captionsArray;
    }

    function appendRowData(captionsArray, dataArray){
      var index = 0;
      var initialElement = [];
      var elementLeft= [];
      var rowspanApplied = [];
      var rowspanAppliedPrev = [];
      for(var captionsArrayIndex in captionsArray){
        initialElement.push(captionsArray[captionsArrayIndex].length);
        elementLeft.push(captionsArray[captionsArrayIndex].length);
        rowspanApplied.push(0);
        rowspanAppliedPrev.push(0);
      }
      var rowspanAppliedIndex;
      while(elementLeft[(elementLeft.length)-1] > 0){
        for(captionsArrayIndex in captionsArray){
          var obj = captionsArray[captionsArrayIndex][parseInt(initialElement[captionsArrayIndex])-parseInt(elementLeft[captionsArrayIndex])];
          if (parseInt(captionsArrayIndex) === 0){
            if(rowspanApplied[parseInt(captionsArrayIndex)] <= rowspanApplied[parseInt(captionsArrayIndex)+1]){
              $('#dataTableBody').append("<tr id='tobeAppendend'><th rowspan="+obj.span+">"+obj.caption+"</th></tr>");
              elementLeft[captionsArrayIndex] = parseInt(elementLeft[captionsArrayIndex]) - 1;
              for(rowspanAppliedIndex in rowspanApplied){
                rowspanAppliedPrev[rowspanAppliedIndex] = rowspanApplied[rowspanAppliedIndex];
              }
              rowspanApplied[captionsArrayIndex] += obj.span;
            }
          }
          else{
            if(rowspanApplied[parseInt(captionsArrayIndex)-1] > rowspanApplied[parseInt(captionsArrayIndex)]){
              prevObj = captionsArray[parseInt(captionsArrayIndex)-1][parseInt(parseInt(initialElement[parseInt(captionsArrayIndex)-1])-parseInt(elementLeft[parseInt(captionsArrayIndex)-1]))-1];
              obj = captionsArray[parseInt(captionsArrayIndex)][parseInt(initialElement[captionsArrayIndex])-parseInt(elementLeft[captionsArrayIndex])];
              if(parseInt(captionsArrayIndex) === captionsArray.length-1){
                for(var rowIndex1=0; rowIndex1 < prevObj.span; rowIndex1++){
                  if (parseInt(rowIndex1) === 0){
                    $("#tobeAppendend:last-child").append("<th rowspan="+obj.span+">"+obj.caption+"</th>"+dataArray[rowspanApplied[rowspanApplied.length-1]].td);
                  }
                  else{
                    $("#dataTableBody").append("<tr><th rowspan="+obj.span+">"+obj.caption+"</th>"+dataArray[rowspanApplied[rowspanApplied.length-1]].td+"</tr>");
                  }
                  elementLeft[parseInt(captionsArrayIndex)] = parseInt(elementLeft[parseInt(captionsArrayIndex)]) - 1;
                  for(rowspanAppliedIndex in rowspanApplied){
                    rowspanAppliedPrev[rowspanAppliedIndex] = rowspanApplied[rowspanAppliedIndex];
                  }
                  rowspanApplied[parseInt(captionsArrayIndex)] += obj.span;
                  obj = captionsArray[parseInt(captionsArrayIndex)][parseInt(initialElement[captionsArrayIndex])-parseInt(elementLeft[captionsArrayIndex])];
                }
                rowspanAppliedPrev[captionsArrayIndex] = rowspanApplied[captionsArrayIndex];
              }
              else{
                if (rowspanApplied[parseInt(captionsArrayIndex)] === 0 || rowspanApplied[parseInt(captionsArrayIndex)] === rowspanAppliedPrev[parseInt(captionsArrayIndex)-1]){
                  $("#tobeAppendend:last-child").append("<th rowspan="+obj.span+">"+obj.caption+"</th>");
                }
                else{
                  $("#dataTableBody").append("<tr id='tobeAppendend'><th rowspan="+obj.span+">"+obj.caption+"</th></tr>");
                }
                elementLeft[parseInt(captionsArrayIndex)] = parseInt(elementLeft[parseInt(captionsArrayIndex)]) - 1;
                for(rowspanAppliedIndex in rowspanApplied){
                  rowspanAppliedPrev[rowspanAppliedIndex] = rowspanApplied[rowspanAppliedIndex];
                }
                rowspanApplied[parseInt(captionsArrayIndex)] += obj.span;
              }
            }
          }
        }
      }
    }
    $("tr th").css('background-color','white');
    $("tr:nth-child(even) td").css('background-color','lightblue');
    $("tr:nth-child(even) td").prev().css('background-color','lightblue');
}
