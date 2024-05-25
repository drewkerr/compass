$(document).ready(function() {

  if (!window.single){
    window.single = true
  } else {
    return
  }

  var cycleId = window.location.href.split('cycleId=')[1]
  
  if ($('body #dash').length) {
    $('body #dash').remove()
  }
  
  let wrapper = $(`<div id="dash"><style type="text/css">
    #dash {
      position: fixed;
      box-sizing: border-box;
      top: 0;
      padding: 56px calc(50% - 490px);
      z-index: 100;
      background-color: #f0f2f5;
      width: 100%;
      height: 100%;
      overflow: scroll;
      -webkit-overflow-scrolling: touch;
    }
    #dash .header {
      display: flex;
      align-items: center;
      margin: 3em 1em 1em;
    }
    #dash table {
      background-color: white;
      box-shadow: 0 0 1em rgba(0, 0, 0, 0.2);
      margin: 1em;
    }
    #dash th,
    #dash td {
      border: solid 1px #666;
      padding: 0.5em;
      background-color: white;
    }
    #dash .area th {
      position: sticky;
      top: 0;
      overflow: hidden;
    }
    #dash .area th:after,
    #dash .strand th:after {
      content: '';
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      border: solid 1px #666;
    }
    #dash .area th div {
      white-space: nowrap;
      width: 1em;
    }
    #dash .strand th {
      position: sticky;
      top: 31px;
      height: 5em;
    }
    #dash .strand th div {
      transform: translate(0, 1em) rotate(-90deg);
      width: 1em;
    }
    #dash .green {
      background-color: rgba(68, 221, 102, 0.2);
      color: rgb(68, 221, 102);
    }
    #dash .red {
      background-color: rgb(251, 218, 217);
    }
    #dash .hide {
      display: none;
    }
    #dash .button {
      margin-left: 1em;
      padding: 0.5em 1em;
      border-radius: 0.5em;
      color: #666;
      border: #666 1px solid;
    }
    #dash .button:hover {
      background-color: #ccc;
    }
  </style></div>`).appendTo('body')

  $('<div>').addClass('header').appendTo('#dash')
  $('<h1>').addClass('title').text('Victorian Curriculum Strand Coverage').appendTo('#dash .header')
  $('<div>').addClass('button').text('Export').click(function() {
    let a = document.createElement('a')
    let dataType = 'data:application/vnd.ms-excel'
    let tableHTML = $('#dash table')[0].outerHTML.replace(/ /g, '%20')
    a.href = dataType + ', ' + tableHTML
    a.download = 'exported_table.xls'
    a.click()
  }).appendTo('#dash .header')
  $('<div>').addClass('button').text('Close').click(function() {
    window.single = false
    $('#dash').remove()
  }).appendTo('#dash .header')
  let table = $('<table>').append($('<thead>')
    .append($('<tr>').addClass('area'))
    .append($('<tr>').addClass('strand'))).appendTo('#dash')
  
  $.ajax("/Services/Reports.svc/GetVicCurr2017Strands"+"?_dc="+new Date().getTime(),{
    data:JSON.stringify({page:1,start:0,limit:25}),
    contentType:'application/json',
    type:'POST'})
  .done(loadStrands)
  
  function loadStrands(vcstrands) {
    let strands = [];
    let area = $('<th>').attr('rowspan',2).append($('<div>').text('Subject')).appendTo('.area')
    $.each(vcstrands.d, function() {
      if (area && area.text() == this.areaName) {
        area.attr('colspan', parseInt(area.attr('colspan')) + 1)
      } else {
        area=$('<th>').attr('colspan', 1).append($('<div>').text(this.areaName)).appendTo('.area')
      }
      let title = this.subjectName == this.strandName ? this.strandName : this.subjectName + ' ' + this.strandName
      let th = $('<th>').append($('<div>').attr('title',title).text(this.strandCode)).addClass(this.strandCode + ' red')
      if (this.areaName == 'Languages') {
        th.addClass('hide')
      }
      th.appendTo('.strand')
      strands.push(this.strandCode)
    })
    $('<tbody>').appendTo('#dash table')

    $.ajax("/Services/Reports.svc/GetFilteredCycleSubjects"+"?_dc="+new Date().getTime(),{
      data:JSON.stringify({cycleId:cycleId,filter:1,page:1,start:0,limit:25}),
      contentType:'application/json',
      type:'POST'})
    .done((subjects) => loadSubjects(subjects, strands))
  }

  function loadSubjects(subjects, strands) {
    $.each(subjects.d,function(){
      var subjectId = this.id
      var subject = this.subjectCode
      var row = $('<tr>').addClass(subject).appendTo('#dash tbody')
      $('<td>').attr('title',this.subjectName).text(subject).addClass('red').appendTo(row)
      $.each(strands,function(){
        var strand = this.toString()
        var td=$('<td>').addClass(strand);
        if ($('th.'+strand).hasClass('hide')){
          td.addClass('hide')
        }
        td.appendTo(row)
      })
      $.ajax("/Services/Reports.svc/GetCycleSubjectReportBlob"+"?_dc="+new Date().getTime(),{
        data:JSON.stringify({cycleId:cycleId,subjectId:subjectId}),
        contentType:'application/json',
        type:'POST'})
      .done((report) => loadReports(report, subject))
    })
  }

  function loadReports(report, subject) {
    $.each(report.d.reportItems, function() {
      if (this.reportElementType == 199) {
        $('.' + subject + ' .' + this.name).text('Y').addClass('green')
        $('th.' + this.name).removeClass('red')
        $('.' + this.name).removeClass('hide')
        $('.' + subject + ' .red').removeClass('red')
      }
    })
  }
})