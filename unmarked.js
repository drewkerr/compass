$(document).ready(function() {

  if (!window.single) {
    window.single = true
  } else {
    return
  }

  var wrapper = $(`<div id="dash">
    <style type="text/css">
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
      .header {
        display: flex;
        align-items: center;
        margin: 1em;
      }
      input {
        margin-left: 1em;
      }
      .button {
        display: inline-block;
        margin-left: 1em;
        padding: 0.5em 1em;
        border-radius: 0.5em;
        color: #666;
        border: #666 1px solid;
      }
      .button:hover {
        background-color: #ccc;
      }
      #dash table {
        background-color: white;
        border-radius: 0.5em;
        box-shadow: 0 0 1em rgba(0, 0, 0, 0.2);
        margin: 1em;
      }
      #dash tbody tr {
        border-top: #ccc 1px solid;
      }
      #dash tbody tr:hover {
        background-color: #eee;
      }
      #dash tr:last-child td:first-child {
        border-radius: 0 0 0 0.5em;
      }
      #dash tr:last-child td:last-child {
        border-radius: 0 0 0.5em 0;
      }
      #dash th, #dash td {
        position: relative;
        padding: 1em;
        border: 0;
      }
      #progress {
        position: fixed;
        bottom: 0;
        left: 0;
        background-color: #06c;
        height: 1em;
        width: 0;
      }
    </style>
  </div>`).appendTo('body')
  $('<div>').addClass('header').appendTo('#dash')
  $('<h1>').addClass('title').text('Unmarked Intelligent Rolls').appendTo('#dash .header')
  var today = new Date().toISOString().slice(0,10)
  $('<input>').attr('type', 'date').attr('value', today).attr('max', today).change(function() {
    $('#dash tbody').empty()
    $('#progress').attr('data-finished', 0)
    let date = $(this).attr('value')
    getSessions(date).done(loadSessions)
  }).appendTo('#dash .header').change()
  $('<div>').addClass('button').text('Close').css({ "order": "2" }).click(function() {
    window.single = false
    $('#dash').remove()
  }).appendTo('#dash .header')
  $('<div>').attr('id', 'progress').appendTo('#dash')
  
  $('<table>').append($('<thead>').append($('<tr>'))).appendTo('#dash')
  var headers = ['Activity', 'Time', 'Staff']
  $.each(headers, function() {
    $('<th>').text(this).appendTo('#dash thead tr')
  })
  $('<tbody>').appendTo('#dash table')

  function getSessions(date) {
    let start = new Date(date)
    start.setHours(start.getHours() - 4)
    let finish = new Date(date)
    finish.setHours(start.getHours() + 10)
    return $.ajax("/Services/Instance.svc/GetClassManagerLines",{
      data: JSON.stringify({startTime: start.toISOString(), finishTime: finish.toISOString(),
                            activityName:"",teacherId:null,runningStatus:1,yearLevelId:null,
                            page:1,start:0,limit:200,sort:"[{\"property\":\"s\",\"direction\":\"ASC\"},{\"property\":\"n\",\"direction\":\"ASC\"},{\"property\":\"teachers\",\"direction\":\"ASC\"}]"}),
      contentType: 'application/json',
      type: 'POST'})
  }

  function updateProgress() {
    let started = $('#progress').attr('data-started')
    let finished = parseInt($('#progress').attr('data-finished') || 0) + 1
    $('#progress').attr('data-finished', finished)
    let percent = finished / started * 100
    percent = percent == 100 ? 0 : percent
    $('#progress').width(`${percent}%`)
  }
  
  function loadSessions(lines) {
    $('#progress').attr('data-started', lines.d.data.length)
    $.each(lines.d.data, (i, n) => {
      getRoll(n.id).done(loadRoll)
    })
  }
  
  function getUser(userId) {
    return $.ajax("/Services/User.svc/GetUserDetailsBlobByUserId",{
      data: JSON.stringify({
        targetUserId: userId,
        targetSchoolId: Compass.schoolId,
        page: 1, start: 0, limit: 25}),
      contentType: 'application/json',
      type: 'POST'})
  }

  function emailUser(user, activity) {
    var subject = 'You have unmarked rolls in Compass: ' + activity
    var body = 'https://' + user.d.userSchoolURL + '/Records/UserNew.aspx?#attendance'
    window.location.href = `mailto:${user.d.userEmail}?subject=${subject}&body=${body}`
  }
  
  function getRoll(instanceId) {
    return $.ajax("/Services/Attendance.svc/GetRollPackage",{
      data: JSON.stringify({"instanceId": instanceId}),
      contentType: 'application/json',
      type: 'POST'})
  }
  
  function loadRoll(roll) {
    console.log(roll.d.data.previousMarkings.length, roll.d.data.rollData.length)
    if (!roll.d.data.previousMarkings.length && roll.d.data.rollData.length) {
      let row = $('<tr>')
      row.appendTo('#dash tbody')
      $('<td>').html(`<a href="/Organise/Activities/Activity.aspx#session/${roll.d.data.instanceId}">${roll.d.data.activityName}</a>`).appendTo(row)
      $('<td>').html(roll.d.data.tpString).appendTo(row)
      $('<td>').html($('<a>').text(roll.d.data.managerIi)).click(function(event) {
          event.preventDefault()
          getUser(roll.d.data.managerId).done((user) => emailUser(user, roll.d.data.activityName))
      }).appendTo(row)
    }
    updateProgress()
  }
  
})