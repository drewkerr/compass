$(document).ready(function() {

  if (!window.single) {
    window.single = true;
  } else {
    return
  }

  var hash = window.location.hash.split('/')
  switch (hash[0]) {
    case '#activity': var activityId = hash[1]; break;
    case '#session': var activityId = hash[1].slice(0,-12); break;
    default: alert('Open a class page first.'); return;
  }

  var startDate = new Date(new Date().getFullYear(),0,1,11).toISOString()
  var endDate = new Date().toISOString()

  if ($('body #dash').length) {
    $('body #dash').remove()
  }

  $(`<div id="dash"><style type="text/css">
  #dash {
    position: fixed;
    box-sizing: border-box;
    top: 0;
    padding: 64px calc(50% - 490px);
    z-index: 100;
    background-color: #f0f2f5;
    width: 100%;
    height: 100%;
    overflow: scroll;
    -webkit-overflow-scrolling: touch;
  }
  h1 {
    margin: 1rem;
  }
  #dash .header {
    display: flex;
    justify-content: space-between;
    margin: 1em;
  }
  #dash table {
    border-collapse: collapse;
    width: 100%;
  }
  #dash th, #dash td {
    padding: 1em;
    border: 0;
  }
  #dash th:nth-child(-n+3), #dash td:nth-child(-n+3) {
    width: 1%;
    white-space: nowrap;
  }
  #dash td {
    background-color: white;
    border: 1px solid;
  }
  @media print {
    #dash {
      position: static;
    }
    body * {
      visibility: hidden;
    }
    #dash * {
      visibility: visible;
    }
    #dash {
      position: absolute;
      left: 0;
      top: 0;
    }
  }
  </style></div>`).click(function() {
      window.single = false
      $('#dash').remove()
  }).appendTo('body')

  let classname = $('#ClassName').text()
  let classcode = $('#ClassCodeText').text().slice(0, -16)
  let teachname = $('.teacherContainer__name a').text()

  $('<h1>').addClass('title')
    .html(`<b>${classcode}:</b> ${classname}`)
    .appendTo('#dash')
  $('<div>').addClass('header').appendTo('#dash')
  $('<p>').addClass('subtitle')
    .html(`<b>Teacher:</b> ${teachname}`)
    .appendTo('#dash .header')

  $('<table>').append($('<thead>').append($('<tr>'))).appendTo('#dash')

  var headers = ['Student ID', 'Student Name', 'Home Group']
  $.each(headers ,function() {
    $('<th>').text(this).appendTo('#dash thead tr')
  })

  function getStudents(startDate, endDate, activityId) {
    return $.ajax("/Services/Attendance.svc/GetUserSummariesByActivityWithFilter"+"?_dc="+new Date().getTime(),{
      data:JSON.stringify({
        startDate:startDate,
        endDate:endDate,
        ActivityId:activityId,
        studentStatus:1,inClass:[0,1],okClass:[0,1],vce:[0,1],schl:[0,1],perspective:0,totalWholeDayLimit:0,totalPartialDayLimit:0,}),
      contentType:'application/json; charset=utf-8',
      type:'POST'})
  }

  function loadStudents(students) {
    let body = $('<tbody>').appendTo('#dash table')
    $('<p>').addClass('subtitle')
      .html(`<b>Students:</b> ${students.d.length}`)
      .appendTo('#dash .header')
    students.d.sort((a, b) => a.uii.localeCompare(b.uii))
    $.each(students.d, function() {
      let row = $('<tr>').appendTo(body)
      $('<td>').text(this.uii).appendTo(row)
      let name = this.un.slice(0,-10)
      $('<td>').text(name).appendTo(row)
      $('<td>').text(this.fg).appendTo(row)
      for (var i=10; i--;) $('<td>').appendTo(row)
    })
  }

  getStudents(startDate,endDate,activityId).done(loadStudents).done(window.print())

})