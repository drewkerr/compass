$(document).ready(function() {

  // only create if not already present
  if (!window.single) {
    window.single = true
  } else {
    return
  }

  // create style and header elements
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
      #dash .header {
        display: flex;
        align-items: center;
        margin: 1em;
        gap: 1em;
      }
      #dash h1 {
        font: revert;
      }
      #dash .button {
        display: inline-block;
        padding: 0.5em 1em;
        border-radius: 0.5em;
        color: #666;
        border: #666 1px solid;
      }
      #dash .button:hover {
        background-color: #ccc;
      }
      #dash input[type="checkbox"] {
        margin-left: 1em;
      }
      #dash #custom {
        margin-left: 1em;
      }
      #dash #custom:not(:checked) ~ table .custom {
        display: none;
      }
      #dash #forecast:not(:checked) ~ table .forecast {
        display: none;
      }
      #dash table {
        background-color: white;
        border-radius: 0.5em;
        box-shadow: 0 0 1em rgba(0, 0, 0, 0.2);
        margin: 1em;
      }
      #dash tbody:empty::after {
        content: '';
        margin: 1em;
        display: block;
        width: 1em;
        aspect-ratio: 1;
        border-radius: 50%;
        border: 0.2em solid #06c;
        border-right-color: white;
        animation: turn 1s infinite linear;
      }
      @keyframes turn {
        to { transform: rotate(1turn) }
      }
      #dash th.asc:after {
        content: '▲';
        position: absolute;
      }
      #dash th.dsc:after {
        content: '▼';
        position: absolute;
      }
      #dash tbody tr {
        border-top: #ccc 1px solid;
      }
      #dash tbody tr:hover {
        background-color: #f6fafe;
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
    </style>
  </div>`).appendTo('body')
  $('<div>').addClass('header').appendTo('#dash')
  $('<h1>').addClass('title').text('Attendance by Class').appendTo('#dash .header')

  // optionally hide custom classes
  $('<input>').attr('id', 'custom').attr('type', 'checkbox').appendTo('#dash')
  $('<label>').attr('for', 'custom').text('Custom classes').appendTo('#dash')

  // optionally forecast attendance
  $('<input>').attr('id', 'forecast').attr('type', 'checkbox').appendTo('#dash')
  $('<label>').attr('for', 'forecast').text('Forecast attendance').appendTo('#dash')
  
  // date picker for start - through today
  let dates
  $('<label>').attr('for', 'date').text('Start date').appendTo('#dash .header')
  const formatDate = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const d = new Date()
  const endToday = formatDate(d)
  const lastMonday = formatDate(new Date(d.getFullYear(), d.getMonth(), d.getDate() - (d.getDay() + 6) % 7))
  $('<input>').attr('id', 'date').attr('type', 'date')
    .attr('value', lastMonday)
    .attr('max', endToday)
    .change(loadDates)
    .appendTo('#dash .header')
    .change() // run on start
  
  // export CSV
  $('<div>').addClass('button').text('Export').click(function() {
    const rows = [...document.querySelectorAll('#dash table tr')]
      .filter(el => el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0) // visible
      .map(r => [...r.querySelectorAll('td, th')].map(td => td.textContent))
    downloadCSV(rows, 'attendance.csv')
  }).appendTo('#dash .header')
  
  // close button
  $('<div>').addClass('button').text('Close').click(function() {
    window.single = false
    $('#dash').remove()
  }).appendTo('#dash .header')
  
  // https://stackoverflow.com/questions/14267781/sorting-html-table-with-javascript
  const getCellValue = (tr, idx) =>
    tr.children[idx].dataset.percent || tr.children[idx].innerText
  const comparer = (idx, asc) =>
    (a, b) => (
      (v1, v2) => ((v1 === "") - (v2 === "")) * asc || // always sort empty last
        v1.localeCompare(v2, undefined, {numeric: true, sensitivity: "base"})
    ) (getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx))
  function sortTable(th) {
    th = th.target
    const tb = th.closest('table').tBodies[0]
    Array.from(tb.querySelectorAll('tr'))
      .sort(comparer(Array.from(th.parentNode.children).indexOf(th), this.asc = !this.asc))
      .forEach(tr => tb.appendChild(tr) )
    // show sort direction arrows
    $('#dash .asc').removeClass('asc')
    $('#dash .dsc').removeClass('dsc')
    if (this.asc) {
      $(this).addClass('asc')
    } else {
      $(this).addClass('dsc')
    }
  }
  
  // calculate attendance dates to get when date picker changes
  function loadDates() {
    // reset array and table
    dates = []
    $('#dash table').remove()
    $('<table>').append($('<thead>').append($('<tr>'))).appendTo('#dash')
    let th = $('<th>').text('Class').click(sortTable).appendTo('#dash thead tr')
    $('<tbody>').appendTo('#dash table')

    // array of weekdays between start date and today
    const startDate = new Date($(this).attr('value'))
    let currentDate = new Date(endToday)
    while (currentDate >= startDate) {
      let day = currentDate.getDay()
      if (day >= 1 && day <= 5) { // Monday to Friday (1 to 5)
        dates.push(new Date(currentDate))
      }
      currentDate.setDate(currentDate.getDate() - 1)
    }

    // get and load attendance data for each date
    let deferred = []
    let forecast
    for (const date of dates) {
      // forecast attendance for today
      if (dates.indexOf(date) == 0) {
        deferred.push(
          getAttendance(date).done((att) => {
            forecast = att
            loadAttendance(att, date)
          })
        )
      } else {
        deferred.push(
          getAttendance(date).done((att) => loadAttendance(att, date))
        )
      }
    }
    $.when(...deferred).done(e => {
      th.click() // sort once complete
      getCustom().done(loadCustom) // hide custom classes
      let date = new Date(endToday)
      getForecast(date).done((stu) => loadForecast(stu, forecast)) // after loading attendance but before filtering
    })
  }
  
  function getAttendance(date) {
    const iso = date.toISOString() // yyyy-mm-ddT00:00:00.000Z
    const dmm = `${date.getDate()}/${date.getMonth() + 1}` // d/m
    const ymd = iso.substring(0, 10) // yyyy-mm-dd
    $('<th>').addClass(ymd).text(dmm).click(sortTable).appendTo('#dash thead tr') // add sortable heading for each date
    return $.ajax("/Services/Attendance.svc/GetAttendanceSummaryForCustomGroupBySubjectExtraParams",{
      data: JSON.stringify({startDate: iso, endDate: iso,
                            studentStatus:"1",inClass:["0","1"],overall:["0","1"],okClass:["0","1"],vce:["0","1"],schl:["0","1"],perspective:"1",totalWholeDayLimit:"0",totalPartialDayLimit:"0",customGroupId:"all"}),
      contentType: 'application/json',
      type: 'POST'})
  }

  // check object has key before push
  const push = (o, k, v) => (o[k] || (o[k] = [])).push(parseInt(v))
  // fraction of array as string
  const fraction = array => `${array.reduce((a, b) => a + b)}/${array.length}`
  // average of array
  const average = array => array.reduce((a, b) => a + b) / array.length
  // percentage to red-green colour range
  const hsla = (n) => `hsla(${120*n}, 80%, 80%, 0.8)`

  function loadAttendance(att, date) {
    const ymd = date.toISOString().substring(0, 10)

    // loop over data to create classes = { name: [attendance] }
    let classes = {}
    $.each(att.d, function() {
      if (this.aid > 0) { // exclude "School Activities"
        push(classes, this.an, this.ta)
      }
    })

    // loop over classes to create table cells
    Object.keys(classes).forEach(function(v, i) {
      let a = average(classes[v])
      let f = fraction(classes[v])
      let id = att.d.find(obj => obj['an'] === v)['aid'].toString()
      let url = `/Organise/Activities/Activity.aspx#activity/${id}`
      // create whole class row if doesn't exist
      let row = $('tr.'+id)
      if (!row.length) {
        row = $('<tr>')
        row.addClass(id).appendTo('#dash tbody')
        $('<td>').html(`<a href="${url}">${v}</a>`).appendTo(row) // first column
        for (let j = 0; j < dates.length; j++) { // remaining columns
          const currentDate = dates[j].toISOString().substring(0, 10)
          $('<td>').addClass(currentDate).appendTo(row)
        }
      }
      // add class data by date
      const ddmm = `${date.getDate()}/${date.getMonth() + 1}`
      $(`#dash .${id} .${ymd}`).attr('title', ddmm).attr('data-percent', a*100).text(f).css('background-color', hsla(a))
      // optionally hide single student classes
      if (classes[v].length == 1) $(`#dash .${id}`).addClass('single')
    })
  }
  
  function getCustom() {
    return $.ajax("/Services/Subjects.svc/GetSubjectsInAcademicGroup",{
      data: JSON.stringify({academicGroupId:-1,includeDataSyncSubjects:true,page:1,start:0,limit:200,sort:"[{\"property\":\"layerName\",\"direction\":\"ASC\"}]"}),
      contentType: 'application/json',
      type: 'POST'})
  }

  function loadCustom(subjects) {
    $.each(subjects.d.data, function() {
      if (this.layerName != "Normal Classes") {
        getClasses(this.id).done(loadClasses)
      }
    })
  }
  
  function getClasses(subjectId) {
    return $.ajax("/Services/Subjects.svc/GetStandardClassesOfSubject",{
      data: JSON.stringify({subjectId:subjectId,page:1,start:0,limit:100,sort:"[{\"property\":\"name\",\"direction\":\"ASC\"}]"}),
      contentType: 'application/json',
      type: 'POST'})
  }

  function loadClasses(classes) {
    $.each(classes.d.data, function() {
      $(`#dash .${this.id}`).addClass('custom')
    })
  }
  
  function getForecast(date) {
    return $.ajax("/Services/AttendanceV2.svc/GetStudentDailySummaries",{
      data: JSON.stringify({date: date,status:1,customGroupId:"all",byFilterClick:false,yearLevel:null,formGroupId:"",house:null,campus:null,initialStudentIds:null,page:1,start:0,limit:1000}),
      contentType: 'application/json',
      type: 'POST'})
  }

  function loadForecast(students, att) {
    // add column
    $('#dash').find('tr').each(function() {
      $(this).find('th').eq(0).after($('<th class="forecast">Forecast</th>').click(sortTable))
      $(this).find('td').eq(0).after('<td class="forecast"></td>')
    })
    // get students present in first session
    let present = []
    $.each(students.d.data, function() {
      let status = this.userTimeLinePeriods[0].status
      if (status == 1 || status == 4) {
        present.push(this.userId)
      }
    })
    // loop over data to create classes = { name: [attendance] }
    let classes = {}
    $.each(att.d, function() {
      let f = present.includes(this.uid) ? 1 : 0 // present in first session
      push(classes, this.an, f)
    })
    // add to table
    Object.keys(classes).forEach(function(v, i) {
      let a = average(classes[v])
      let f = fraction(classes[v])
      let id = att.d.find(obj => obj['an'] === v)['aid'].toString()
      $(`#dash .${id} .forecast`).attr('data-percent', a*100).text(f).css('background-color', hsla(a))
    })
  }
  
  var downloadCSV = function(rows, filename) {
    const csv = rows.map(e => e.join(",\t")).join("\n") // comma + tab to work around Excel import
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