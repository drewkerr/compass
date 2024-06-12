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
      select {
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
      .cycle .button {
        margin-top: 1em;
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
      }
      summary,
      .excend > div {
        display: flex;
        align-items: center;
        border-bottom: solid 1px lightgray;
      }
      summary {
        padding-left: 1em;
      }
      details details summary {
        padding-left: 3em;
      }
      .excend > div {
        padding-left: 5em;
      }
      summary div,
      .excend div div {
        display: inline-block;
        padding: 1em;
      }
      details details details summary {
        padding: 1em 1em 1em 5em;
      }
      summary > div:first-child,
      .excend div div:first-child {
        font-weight: bold;
        width: 30%;
      }
      .kats,
      .elements {
        padding: 0;
      }
      .excend div div:last-child,
      summary > div:last-child {
        margin-left: auto;
      }
      details p {
        margin: 0 5em 0.25em;
      }
      details p:last-child {
        margin-bottom: 2em;
      }
      .note {
        margin: 2em;
        color: #666;
      }
    </style>
  </div>`).appendTo('body')
  $('<div>').addClass('header').appendTo('#dash')
  $('<h1>').addClass('title').text('Reports Check').appendTo('#dash .header')
  var selectCycle = $('<select>').change(loadCycle).appendTo('#dash .header')
  if (Compass.organisationUserRoles.ReportsAdmin) {
    $('<div>').addClass('button').text('Expand all').click(function() {
      if ($(this).text() == 'Expand all') {
        $(this).text('Collapse all')
        $('details.staff').attr('open','')
      } else {
        $(this).text('Expand all')
        $('details.staff').removeAttr('open')
      }
    }).appendTo('#dash .header')
  }
  $('<div>').addClass('button').text('Close').css({ "order": "2" }).click(function() {
    window.single = false
    $('#dash').remove()
  }).appendTo('#dash .header')
  $('<div>')
    .addClass('note')
    .css({ "flex-grow": "1", "order": "1" })
    .html('👨🏻‍💻 Email Andrew Kerr for support')
    .appendTo('#dash .header')
  $('<div>')
    .addClass('note')
    .text('This tool checks reports for missing elements automatically. Click into colour-coded classes to see details of errors (red) or warnings (yellow) and how to fix them. Award recommendations are also listed here. Hover over tasks to see the full name. Click on class names to go directly and make changes. Completed reports (green) still require proofreading.')
    .appendTo('#dash')
  
  getCycles().done(loadCycles)

  function getCycles() {
    return $.ajax("/Services/Reports.svc/GetCycles",{
      data: JSON.stringify({page: 1, start: 0, limit: 25}),
      contentType: 'application/json',
      type: 'POST'})
  }
  
  function loadCycles(cycles) {
    $.each(cycles.d, function(i, n) {
      var option = $('<option>').attr('value', n.id)
                                .text(n.name + ' ' + n.year)
                                .appendTo(selectCycle)
      if (i == 0) {
        option.attr('selected', 'selected')
      }
    })
    selectCycle.change()
  }
  
  function loadCycle() {
    var cycleId = selectCycle.val()
    $('.cycle').hide()
    if ($(`#${cycleId}`).length) {
      $(`#${cycleId}`).show()
    } else {
      var cycle = $('<div>').attr('id', cycleId).addClass('cycle').appendTo('#dash')
      var userId = Compass.organisationUserId
      var user = $('<details>').addClass(`${userId} staff`).appendTo(`#${cycleId}.cycle`)
      var summary = $('<summary>').appendTo(user)
      $('<div>').text(selectCycle.children('option:selected').text()).appendTo(summary)
      $('<div>').appendTo(summary)
      user.attr('open','')
      getActivities(cycleId, userId).done(function(data) {
        loadActivities(data, userId, cycleId)
      })
      if (Compass.organisationUserRoles.ReportsAdmin) {
        $('<div>').addClass('button').text('All Staff').click(function() {
          $(`#${cycleId} details`).remove()
          getStaff(cycleId).done((users) => loadStaff(users, cycleId))
          $(this).remove()
        }).appendTo(`#${cycleId}.cycle`)
      }
    }
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
      var user = $('<details>').addClass(`${userId} staff`).appendTo(`#${cycleId}.cycle`)
      var summary = $('<summary>').appendTo(user)
      $('<div>').text(this.n).appendTo(summary)
      $('<div>').text('Email').click(function(event) {
        event.preventDefault()
        getUser(userId).done((user) => emailUser(user, cycleId))
      }).appendTo(summary)
      getActivities(cycleId, userId).done(function(data) {
        loadActivities(data, userId, cycleId)
      })
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

  function emailUser(user, cycleId) {
    var subject = 'Please check the following reports (or mark Excluded)'
    var body = []
    $(`#${cycleId}.cycle .${user.d.userId}.staff details`).each(function() {
      var errors = $(this).find('p')
      if (errors.length) {
        body.push($(this).find('summary > div:first-child').text())
        body.push(errors.map(function(){return $(this).text()}).get().join('%0a')+'%0a')
      }
    })
    if (body.length) {
      window.location.href = `mailto:${user.d.userEmail}?subject=${subject}&body=${body.join('%0a')}`
    } else {
      alert($(`#${cycleId}.cycle .${user.d.userId}.staff > summary div:first-child`).text()+" has finished their reports.")
    }
  }

  function getActivities(cycleId, userId) {
    return $.ajax("/Services/Reports.svc/GetOpenCycleActivitiesByUserId",{
      data: JSON.stringify({cycleId: cycleId, userId: userId}),
      contentType: 'application/json',
      type: 'POST'})
  }

  function loadActivities(data, userId, cycleId) {
    var staff = $(`#${cycleId}.cycle .${userId}.staff`)
    var progress = $(`#${cycleId}.cycle .${userId}.staff > summary`)
    var total = data.d.length
    var count = 0
    $.each(data.d, function() {
      if (this.subjectName == "Advisory" || this.subjectName == "YDuties" || this.subjectName == "YDBUS") {
        total--
        return
      }
      //if (Compass.organisationUserRoles.ReportsAdmin && !(this.activityName.includes("VC") || this.activityName.slice(2,4) == "10")) {
      //  total--
      //  return
      //}
      var entityId = this.id
      var activityId = this.activityId
      var activity = $('<details>').addClass(`${entityId} activity`).appendTo(staff)
      var summary = $('<summary>').appendTo(activity)
      $('<div>').html(`<a href="/Organise/Activities/Activity.aspx#activity/${activityId}" target="_blank">${this.activityName} - ${this.subjectName}</a>`).appendTo(summary)
      $('<div>').addClass('kats').appendTo(summary)
      $('<div>').addClass('elements').appendTo(summary)
      $.when(getReports(entityId, cycleId), getTasks(activityId))
      .done(function(results, tasks) {
        var issues = $('<details>').addClass(`${entityId} issues`).hide().appendTo(activity)
        var summary = $('<summary>').text("Issues").appendTo(issues)
        loadTasks(tasks[0], entityId, userId, cycleId)
        loadReports(results[0], entityId, userId, cycleId)
      }).done(function() {
        if (!staff.hasClass('complete')) staff.addClass('complete')
        count++
        var percent = count / total * 100
        progress.css({ background: `-webkit-linear-gradient(left, rgba(0,0,0,0), rgba(0,0,0,0) ${percent}%, white ${percent}%, white)` })
      })
    })
  }

  function getReports(entityId, cycleId) {
    return $.ajax("/Services/Reports.svc/GetReportReviewerBlob",{
      data: JSON.stringify({entityType: 1, entityId: entityId, cycleId: cycleId}),
      contentType: 'application/json',
      type: 'POST'})
  }
  function loadReports(results, entityId, userId, cycleId) {
    var activity = $(`#${cycleId}.cycle .${userId}.staff .${entityId}.activity .elements`)
    var metadata = activity.parent().parent()
    var issues = $(`#${cycleId}.cycle .${userId}.staff .${entityId}.issues`)
    var staff = metadata.parent()
    var elements = $('<div>').text("Completed").addClass('complete').appendTo(activity)
    var excend = $('<details>').addClass(`${entityId} excend`).appendTo(metadata)
    var summary = $('<summary>').text("Excellence & Endeavour recommendations").appendTo(excend)
    $.each(results.d.entities, function() {
      var studentName = this.name
      var student = $('<div>').appendTo(excend)
      $('<div>').text(studentName).appendTo(student)
      var gp = []
      var ex = []
      $.each(this.results, function() {
        if (this.name == "Overall Assessment" || this.name == "Performance" || this.name == "Grading: Achievement") {
          var abbr = this.displayValue.match(/\b([A-Z])/g).join('')
          $('<div>').text(abbr).appendTo(student)
          ex.push(this.displayValue == "Working Well Above Expected Level" || this.displayValue == "Working Above Expected Level" || this.displayValue == "Working At Expected Level" || this.displayValue == "Excellent" || parseInt(this.displayValue) >= 50)
        }
        if (this.itemName == "Work Habits") {
          switch (this.value) {
            case "Consistently": gp.push(4); break
            case "Usually": gp.push(3); break
            case "Sometimes": gp.push(2); break
            case "Rarely": gp.push(1); break
          }
        }
        if (!this.value || (this.itemName == "Award" && this.value == "None")) {
          issues.show()
          var text = [studentName, this.name].join(' - ')
          $('<p>').text(text).appendTo(issues)
          issues.children('summary').text(`Issues (${issues.children('p').length})`)
          if (!elements.hasClass('error')) elements.addClass('error').text("Incomplete")
          if (!staff.hasClass('error')) staff.addClass('error')
        }
      })
      var gpa = gp.length ? (gp.reduce((a, b) => a + b) / gp.length).toFixed(2) : "NA"
      $('<div>').text(gpa).appendTo(student)
      if (gpa >= 3.75) {
        if (!ex.includes(false) && ex.length) {
          $('<div>').text("Excellence").addClass('complete').appendTo(student)
        } else {
          $('<div>').text("Endeavour").addClass('complete').appendTo(student)
        }
      } else {
        $('<div>').appendTo(student)
      }
    })
  }

  function getTasks(activityId) {
    return $.ajax("/Services/LearningTasks.svc/GetAllLearningTasksByActivityId",{
      data: JSON.stringify({
        activityId: activityId,
        page: 1, start: 0, limit: 2000}),
      contentType: 'application/json',
      type: 'POST'})
  }
  function loadTasks(tasks, entityId, userId, cycleId) {
    var activity = $(`#${cycleId}.cycle .${userId}.staff .${entityId}.activity .kats`)
    var metadata = activity.parent().parent()
    var issues = $(`#${cycleId}.cycle .${userId}.staff .${entityId}.issues`)
    var staff = metadata.parent()
    var message = function(kat, type, count, text) {
      issues.show()
      $('<p>').text(`Task ${count}${text}`).appendTo(issues)
      issues.children('summary').text(`Issues (${issues.children('p').length})`)
      if (!kat.hasClass(type)) kat.addClass(type)
      if (!staff.hasClass(type)) staff.addClass(type)
    }
    var katCount = 0
    $.each(tasks.d.data, function() {
      if (this.semesterReportCycles && this.semesterReportCycles.some(task => task.includeInSemesterReports === true && task.reportCycleId == cycleId)) {
        katCount++
        var kat = $('<div>').text(`Task ${katCount}`).attr('title', this.name).addClass('complete').appendTo(activity)
        if (!this.taskReportDescription) {
          message(kat, 'error', katCount, " has no description (edit Learning Task > Reporting and add Task Summary Description)")
        }
        if (this.gradingItems && this.gradingItems.filter(grade => grade.includeInSemesterReport === true).length < 1) {
          message(kat, 'error', katCount, " grading components disabled (edit Learning Task > Reporting and check Components are ticked)")
        }
        $.each(this.students, function() {
          if (!this.results.length) {
            message(kat, 'error', katCount, ` results missing for ${this.userName}`)
          }
        })
        if (this.taskReportDescription.includes("\n\n")) {
          message(kat, 'warning', katCount, " has extra text in description (edit Learning Task > Reporting and remove extra text from Task Summary Description)")
        }
        if (!(this.name.startsWith("Key Assessment Task") || this.name.startsWith("Unit") || this.name.startsWith("Exam") || this.name.startsWith("SAC") || this.name.startsWith("Semester") || this.name.startsWith("Structured") )) {
          message(kat, 'warning', katCount, `: '${this.name}' does not follow naming format (edit Learning Task and check Name)`)
        }
        if (!(this.taskTitleOnReport.startsWith("Key Assessment Task") || this.taskTitleOnReport.startsWith("Unit") || this.taskTitleOnReport.startsWith("Exam") || this.taskTitleOnReport.startsWith("SAC") || this.taskTitleOnReport.startsWith("Semester") || this.taskTitleOnReport.startsWith("Structured") )) {
          message(kat, 'warning', katCount, `: '${this.taskTitleOnReport}' does not follow naming format (edit Learning Task > Reporting and check Title on Report)`)
        }
        if (this.includeInOverall) {
          message(kat, 'warning', katCount, `: ${this.name} is emphasised (edit Learning Task > Reporting and untick Emphasise in Task Summary)`)
        }
        if (this.showTaskDueDates) {
          message(kat, 'warning', katCount, `: ${this.name} shows due date on report (edit Learning Task > Reporting and untick Display Task Due Dates)`)
        }
        if (this.securityOptions && this.securityOptions.filter(grade => grade.gradingVisible === false).length) {
          message(kat, 'warning', katCount, " grading not visible (edit Learning Task > Basic and check Grading Visible is ticked)")
        }
        if (this.name.includes(" : ") || this.taskTitleOnReport.includes(" : ")) {
          message(kat, 'info', katCount, " has incorrect colon use in name (edit Learning Task and remove space before colon)")
        }
        if (!this.dueDateTimestamp) {
          message(kat, 'info', katCount, `: ${this.name} is missing due date (edit Learning Task and add Due Date)`)
        }
      }
    })
    if (katCount < 3) {
      issues.show()
      $('<p>').text("Class has fewer than 3 Tasks (edit Learning Tasks > Reporting and check Semester Report Cycles are added)").appendTo(issues)
      if (!staff.hasClass('warning')) staff.addClass('warning')
      issues.children('summary').text(`Issues (${issues.children('p').length})`)
    }
  }
})