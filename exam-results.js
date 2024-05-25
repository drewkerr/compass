$(document).ready(function() {

  // only run once
  if (!window.single) {
    window.single = true
  } else {
    return
  }

  // add elements to page and set up styles
  var wrapper = $(`<div id="dash">
    <style type="text/css">
      @media screen {
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
        .header h1 {
          font-size: 2rem;
          letter-spacing: 0;
        }
        select {
          margin-left: auto;
        }
        .button {
          display: inline-block;
          margin-left: 1em;
          padding: 0.5em 1em;
          border-radius: 0.5em;
          color: #666;
          border: #666 1px solid;
        }
        .button:first-of-type {
          margin-right: auto;
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
  
  // header UI
  $('<div>').addClass('header').appendTo('#dash')
  $('<h1>').addClass('title').text('Exam results').appendTo('#dash .header')
  var selectCycle = $('<select>').appendTo('#dash .header')
  $('<div>').addClass('button').text('Create').click(loadCycle).appendTo('#dash .header')
  $('<div>').addClass('button').text('CSV').click(function() {
    let cycleId = selectCycle.val()
    let tr = document.querySelectorAll(`#c${cycleId} table tr`)
    let rows = Array.from(tr)
      .map(row => [
        Array.from(row.querySelectorAll('th, td'))
          .map(cell => cell.textContent)
      ])
    downloadCSV(rows, 'exam-results.csv')
  }).appendTo('#dash .header')
  $('<div>').addClass('button').text('Close').click(function() {
    window.single = false
    $('#dash').remove()
  }).appendTo('#dash .header')
  $('<div>')
    .addClass('cycle')
    .addClass('note')
    .html('<p>Export all exam results for an academic year.</p><p>Useful for academic award nominations.</p><p>👨🏻‍💻 Email Andrew Kerr for support</p>')
    .appendTo('#dash')
  $('<div>').attr('id', 'progress').appendTo('#dash')

  // progress of server requests
  var started = 0, finished = 0
  function updateProgress() {
    let percent = finished / started * 100
    percent = percent == 100 ? 0 : percent
    $('#progress').width(`${percent}%`)
  }
  
  // get the report cycles to populate dropdown list
  getCycles().done(loadCycles)
  
  function getCycles() {
    return $.ajax("/Services/ReferenceDataCache.svc/GetAllAcademicGroups")
  }
  
  function loadCycles(cycles) {
    let option = $('<option>')
      .attr('value', -1)
      .text("Currently Relevant")
      .attr('selected', 'selected')
      .appendTo(selectCycle)
    $.each(cycles.d, (i, n) => {
      let option = $('<option>')
        .attr('value', n.id)
        .text(n.name)
        .appendTo(selectCycle)
    })
    selectCycle.change()
  }

  // get the subjects for the selected cycle
  function loadCycle() {
    let cycleId = selectCycle.val()
    $('.cycle').hide()
    if ($(`#c${cycleId}`).length) {
      $(`#c${cycleId}`).show()
    } else {
      $('<div>').attr('id', `c${cycleId}`).addClass('cycle').appendTo('#dash')
      $('<table>').appendTo(`#c${cycleId}`)
      $('<thead>').appendTo(`#c${cycleId} table`)
      tableRow(['Student Name', 'Class', 'Result'], true).appendTo(`#c${cycleId} table thead`)
      $('<tbody>').appendTo(`#c${cycleId} table`)
      getSubjects(cycleId).done(loadSubjects)
    }
  }
  
  function getSubjects(AcademicGroup) {
    return $.ajax("/Services/Subjects.svc/GetSubjectsInAcademicGroup",{
      data: JSON.stringify({
        academicGroupId: AcademicGroup,
        includeDataSyncSubjects:true,
        page:1,start:0,limit:500,
        sort:"[{\"property\":\"importIdentifier\",\"direction\":\"ASC\"}]"}),
      contentType: 'application/json',
      type: 'POST'})
  }
  
  function loadSubjects(subjects) {
    $.each(subjects.d.data, (i, subject) => {
      getActivities(subject.id).done(loadActivities)
    })
  }

  function getActivities(subjectId) {
    return $.ajax("/Services/Subjects.svc/GetStandardClassesOfSubject",{
      data: JSON.stringify({
        subjectId: subjectId,
        page:1,start:0,limit:50,
        sort:"[{\"property\":\"name\",\"direction\":\"ASC\"}]"}),
      contentType: 'application/json',
      type: 'POST'})
  }
  
  function loadActivities(activities) {
    $.each(activities.d.data, (i, activity) => {
      getTasks(activity.id).done(loadTasks)
    })
  }
  
  function getTasks(activityId) {
    return $.ajax("/Services/LearningTasks.svc/GetAllLearningTasksByActivityId",{
      data: JSON.stringify({
        activityId: activityId,
        page:1,start:0,limit:500}),
      contentType: 'application/json',
      type: 'POST'})
  }
  
  function loadTasks(tasks) {
    let cycleId = selectCycle.val()
    tasks.d.data.forEach(task => {
      // check task has Exam in the name
      if (!task.name.includes("Exam")) return
      // check task has Per|formance|centage grading item
      if (!task.gradingItems.map(g => g.measureUniqueId).find(g => g.includes("Per"))) return
      task.students.forEach(student => {
        // check student has results
        if (!student.results.length) return
        let result = student.results
          // convert grading items to integers
          .map(r => parseInt(r.result))
          // return any numerical results from the grading items
          .find(r => !isNaN(r))
        // include non-numerical results as NA
        if (isNaN(result)) result = "NA"
        // add result to table
        tableRow([student.userName, task.activityName, result]).appendTo(`#c${cycleId} table tbody`)
      })
    })
  }
  
  function tableRow(cells, header = false) {
    var row = $('<tr>')
    $.each(cells, function() {
      if (header) {
        var cell = $('<th>')
      } else {
        var cell = $('<td>')
      }
      cell.text(this)
      cell.appendTo(row)
    })
    return row
  }
  
  var downloadCSV = function(rows, filename) {
    const csv = rows.map(e => e.join(",")).join("\n")
    const blob = new Blob([csv], {type:"text/csv"})
    const link = document.createElement("a")
    link.download = filename
    link.href = window.URL.createObjectURL(blob)
    link.style.display = "none"
    document.body.append(link)
    link.click()
    link.remove()
  }

})