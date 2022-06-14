$(document).ready(function() {

  if (!window.single) {
    window.single = true
  } else {
    return
  }

  if ($('body #dash').length) {
    $('body #dash').remove()
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
      .button {
        margin-left: 1em;
        padding: 0.5em 1em;
        border-radius: 0.5em;
        color: #666;
        border: #666 1px solid;
      }
      .button:hover {
        background-color: #ccc;
      }
      input {
        margin-left: 1em;
      }
      .complete {
        background-color: rgb(219, 248, 225);
      }
      .warning {
        background-color: rgb(255, 244, 202);
      }
      .error {
        background-color: rgb(255, 216, 216);
      }
      details {
        background-color: white;
        border-bottom: solid 1px lightgray;
      }
      details details {
        margin-left: 1em;
      }
      summary div {
        display: inline-block;
        padding: 1em;
      }
      summary {
        padding-left: 1em;
      }
      .hidden {
        opacity: 0.5;
      }
      .keytask {
        font-weight: bold;
      }
      .note {
        margin: 2em;
        color: #666;
      }
    </style>
  </div>`).appendTo('body')
  $('<div>').addClass('header').appendTo('#dash')
  $('<h1>').addClass('title').text('Tasks Check').appendTo('#dash .header')
  $('<input>').attr({type: 'checkbox', id: 'hidden'}).change(function() {
    if (this.checked) {
      $('.hidden').show()
    } else {
      $('.hidden').hide()
    }
  }).appendTo('#dash .header')
  $('<label>').attr('for', 'hidden').text('Show hidden tasks').appendTo('#dash .header')
  $('<input>').attr({type: 'checkbox', id: 'sem2', checked: true}).change(function() {
    if (this.checked) {
      $('.sem2').show()
    } else {
      $('.sem2').hide()
    }
  }).appendTo('#dash .header')
  $('<label>').attr('for', 'sem2').text('Show Semester 2').appendTo('#dash .header')
  if (Compass.organisationUserRoles.ReportsAdmin) {
    $('<div>').addClass('button').text('Expand all').click(function() {
      if ($(this).text() == 'Expand all') {
        $(this).text('Collapse all')
        $('details').attr('open','')
      } else {
        $(this).text('Expand all')
        $('details').removeAttr('open')
      }
    }).appendTo('#dash .header')
  }
  $('<div>').addClass('button').text('Close').click(function() {
    window.single = false
    $('#dash').remove()
  }).appendTo('#dash .header')
  $('<div>')
    .addClass('note')
    .html('👨🏻‍💻 Email Andrew Kerr for support')
    .appendTo('#dash .header')
  
  getCycles().done(loadCycles)
  function getCycles() {
    return $.ajax("/Services/Reports.svc/GetCycles",{
      data: JSON.stringify({page: 1, start: 0, limit: 25}),
      contentType: 'application/json',
      type: 'POST'})
  }
  
  function loadCycles(cycles) {
    var cycleId = cycles.d[0].id
    var cycle = $('<div>').attr('id', cycleId).addClass('cycle').appendTo('#dash')
    getStaff(cycleId).done((users) => loadStaff(users, cycleId))
  }
  
  function getStaff(cycleId) {
    return $.ajax("/Services/Reports.svc/GetReportsStaff",{
      data: JSON.stringify({cycleId: cycleId}),
      contentType: 'application/json',
      type: 'POST'})
  }
  function loadStaff(users, cycleId) {
    users.d.sort(function compare(a, b) {
      return a.ln.localeCompare(b.ln) || a.fn.localeCompare(b.fn)
    })
    $.each(users.d, function() {
      var userId = this.id
      if (Compass.organisationUserRoles.ReportsAdmin || userId == Compass.organisationUserId) {
        var user = $('<details>').addClass(`${userId} staff`).appendTo(`#${cycleId}.cycle`)
        var summary = $('<summary>').appendTo(user)
        $('<div>').text(this.n).appendTo(summary)
        if (Compass.organisationUserRoles.ReportsAdmin) {
          $('<div>').text('Email').click(function(event) {
            event.preventDefault()
            getUser(userId).done((user) => emailUser(user, cycleId))
          }).appendTo(summary)
        } else {
          $('<div>').appendTo(summary)
          user.attr('open','')
        }
        getTasks(userId).done(function(data) {
          loadTasks(data, userId)
        })
      }
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

  function emailUser(user) {
    var subject = 'Please check the following reports (or mark Excluded)'
    var body = []
    $(`.${user.d.userId}.staff details`).each(function() {
      var errors = $(this).find('p')
      if (errors.length) {
        body.push($(this).find('summary > div:first-child').text())
        body.push(errors.map(function(){return $(this).text()}).get().join('%0a')+'%0a')
      }
    })
    if (body.length) {
      window.location.href = `mailto:${user.d.userEmail}?subject=${subject}&body=${body.join('%0a')}`
    } else {
      alert($(`.${user.d.userId}.staff > summary div:first-child`).text()+" has finished their reports.")
    }
  }

  function getTasks(userId) {
    return $.ajax("/Services/LearningTasks.svc/GetAllLearningTasksByUserId",{
      data: JSON.stringify({
        userId: userId,
        forceTaskId: 0,
        showHiddenTasks: true,
        page: 1, start: 0, limit: 200}),
      contentType: 'application/json',
      type: 'POST'})
  }

  function loadTasks(data, userId) {
    var staff = $(`.${userId}.staff`)
    staff.addClass('hidden').addClass('complete').hide()
    $.each(data.d.data, function() {
      var taskId = this.id
      var activityId = this.activityId
      var activity = staff.find(`.${activityId}.activity`)
      if (!activity.length) {
        activity = $('<details>').addClass(`${activityId} activity`).appendTo(staff)
        var activitySummary = $('<summary>').appendTo(activity)
        $('<div>').text(this.activityName).appendTo(activitySummary)
        activity.addClass('sem2').addClass('hidden').hide()
      }
      var task = $('<details>').addClass(`${taskId} task`).appendTo(activity)
      var taskSummary = $('<summary>').appendTo(task)
      $('<div>').text(this.name).appendTo(taskSummary)
      if (this.includeInSemesterReports) {
        task.addClass('keytask')
      }
      if (new Date(this.activityStart) > new Date(new Date().getFullYear(), 6, 1)) {
        task.addClass('sem2')
      } else {
        activity.removeClass('sem2')
      }
      var hidden = false
      $.each(this.securityOptions, function () {
        if (this.userBaseRole != 2 && !this.taskVisible) {
          hidden = true
        }
      })
      if (this.hidden || hidden) {
        task.addClass('hidden').hide()
      } else {
        activity.removeClass('hidden').show()
        staff.removeClass('hidden').show()
        if (!task.hasClass('hidden') && !task.hasClass('sem2') && !staff.hasClass('error')) {
          staff.addClass('error')
        }
      }
    })
  }
})