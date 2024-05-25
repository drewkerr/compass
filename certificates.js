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
        #progress {
          position: fixed;
          bottom: 0;
          left: 0;
          background-color: #06c;
          height: 1em;
          width: 0;
        }
        .cycle {
          margin: 1em 0 0 2em;
        }
        .note {
          position: relative;
          top: 25%;
          margin: 2em;
          color: #666;
          text-align: center;
          font-size: large;
          line-height: 2;
        }
        .cycle h2, .cycle h3 {
          margin: 0;
          padding: 0;
          font-size: medium;
        }
        .cycle h3 {
          display: inline-block;
          position: sticky;
          top: 1em;
          min-width: 3em;
          background-color: #f0f2f5;
        }
        .level {
          margin: 1em 0 0 1em;
        }
        .group {
          display: flex;
          flex-wrap: wrap;
          margin: 1em 0 1em 4em;
          gap: 2em;
        }
        .student {
          background: white;
          width: 30%;
          aspect-ratio: 1 / 1.414;
          box-shadow: 0 0 1em rgba(0,0,0,0.1);
        }
        .student.none {
          opacity: 0.1;
        }
      }
      @media print {
        * {
          margin: 0;
          padding: 0;
        }
        #dash * {
          background: white;
        }
        body form, .header, h2, h3, #progress {
          display: none;
        }
        .student {
          page-break-after: always;
          background: white;
        }
        .student.none {
          display: none;
        }
      }
    </style>
  </div>`).appendTo('body')
  
  // SVG symbol reuse of logo
  $(`<div style="display: none;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 595 830">
  <symbol id="logohead">
  <path fill="#004A37" d="M127.616 68.02c-7.57 7.952-14.562 18.93-19.707 31.436a120.21 120.21 0 0 0-2.072 5.405c-2.603 9.483-3.87 18.675-3.924 26.963.198.264.46.608.656.871v-.074c-.022-.026.022-.114 0-.144.557-1.968 1.326-3.717 2.1-5.695.51-1.3 1.388-3.352 1.966-4.588 5.202-9.276 11.183-15.2 17.346-17.783 1.463 3.965 1.947 9.26 1.201 15.048 1.193-3.676 2.34-8.395 3.12-12.673 2.594-14.208 2.242-28.059-.686-38.766"/><path fill="#004A37" d="M141.56 57.313c-3.484 1.69-7.004 4.165-10.447 7.288 2.247 11.022 2.26 24.445-.244 38.16-1.585 8.686-4.084 16.897-7.22 24.173-.002.01-.006.028-.006.037.029-.075.064-.146.096-.221-.588 2.177-1.474 4.058-2.33 6.25-.509 1.298-1.33 2.788-1.909 4.022-2.312 4.129-4.373 7.508-7.125 10.497-.126-.23-.396-.112-.527-.346l-.002.003c.51.905 1.011 1.805 1.476 2.659 9.97-7.857 19.574-21.35 26.165-37.356a124.835 124.835 0 0 0 2.071-5.411c5.4-19.673 5.1-38.136.002-49.755"/><path fill="#8D1331" d="M124.214 104.154c-6.163 2.584-12.953 9.358-18.157 18.636a65.004 65.004 0 0 0-1.634 3.806 63.135 63.135 0 0 0-1.983 5.928c3.35 4.5 6.352 9.303 8.843 13.651 5.691-6.575 10.61-16.037 13.986-26.975.748-5.8.412-11.072-1.055-15.046"/><path fill="#8D1331" d="M111.538 146.628c.24.418.474.833.703 1.242 2.751-2.989 5.382-6.62 7.7-10.75a63.887 63.887 0 0 0 3.798-10.37c-3.403 7.949-7.585 14.772-12.2 19.878"/><path fill="#004A37" d="M100.354 152.828a31.688 31.688 0 0 1-1.461-1.554c-3.303-4.356-5.102-8.95-5.057-12.389.76.04 1.57.188 2.408.418 0-.006 0-.01.003-.016a77.284 77.284 0 0 0-8.08-4.958c-9.002-4.787-18.382-7.543-26.273-7.955 3.006 5.272 7.241 10.71 12.521 15.826a83.772 83.772 0 0 0 4.255 3.327c9.75 7.128 20.354 11.668 29.196 12.807-2.521-1.259-5.138-3.136-7.512-5.506"/><path fill="#004A37" d="M97.093 129.43a82.398 82.398 0 0 0-4.253-3.324c-12.362-9.033-26.121-13.967-35.887-13.019.442 3.151 1.565 6.594 3.288 10.162 7.96.914 17.009 3.803 25.724 8.439 4.9 2.604 9.39 5.607 13.32 8.814l.002.001c-.032-.025-.062-.052-.091-.078.164.08.331.186.5.271.09.046.188.096.296.159 2.379 1.257 4.819 3.033 7.05 5.255.507.508.993 1.025 1.455 1.55 2.451 3.231 4.064 6.587 4.725 9.511-.016-.032-.036-.062-.05-.095l.028.102c.218.47.43.943.612 1.411.247-.017.504-.02.748-.044-1.214-8.64-7.498-19.465-17.467-29.115"/><path fill="#FACE33" d="M96.279 139.311a11.48 11.48 0 0 0-2.443-.426c-.046 3.438 1.754 8.033 5.057 12.39.464.526.95 1.046 1.461 1.552 4.273 4.264 9.34 7.014 13.203 7.23.007-.514-.039-1.061-.116-1.622-2.683-6.443-8.9-13.327-17.162-19.124"/><path fill="#FACE33" d="M113.222 157.17c-.661-2.923-2.274-6.28-4.724-9.51a33.648 33.648 0 0 0-1.457-1.55c-2.48-2.472-5.224-4.429-7.844-5.686 6.499 5.29 11.447 11.145 14.025 16.747"/><path fill="#004A37" d="M167.83 115.346c-.17.288-.515.346-.743.171-.8-.512-2.29-1.774-5.152-1.774-4.808 0-8.416 4.066-8.416 8.361 0 2.23.86 4.464 2.348 6.01 1.489 1.544 3.662 2.46 6.068 2.46 2.576 0 4.18-.744 5.152-1.374.344-.228.63-.171.802.115l2.117 3.09c.174.29.113.63-.172.804-1.716 1.317-4.065 2.29-7.956 2.29-3.665 0-7.155-1.375-9.676-3.838-2.461-2.404-3.948-5.836-3.948-9.557 0-7.273 6.355-13.34 13.624-13.34 4.18 0 6.582 1.66 8.013 2.576.289.229.403.573.172.802l-2.233 3.204ZM191.795 112.37l-2.747 2.747c-.229.23-.517.346-.746.116-.345-.284-1.432-1.43-2.919-1.49-2.634-.114-6.011 2.06-6.011 9.048v11.62c0 .344-.229.573-.574.573h-3.948c-.344 0-.573-.229-.573-.573v-24.56c0-.342.23-.572.573-.572h3.948c.345 0 .574.23.574.573v1.889h.114c1.491-1.774 3.379-2.865 5.84-2.976 3.09-.118 5.209 1.602 6.47 2.804.285.229.228.572 0 .801M215.298 131.432c-1.603 2.576-4.749 4.067-9.1 4.067-4.41 0-7.557-1.49-9.159-4.067-1.204-1.832-1.718-3.72-1.718-6.926v-14.654c0-.344.229-.573.573-.573h3.948c.343 0 .572.23.572.573v13.455c0 1.484 0 3.261.457 4.52.805 2.002 3.266 2.919 5.268 2.919 2.06 0 4.524-.917 5.268-2.918.516-1.26.516-3.037.516-4.521v-13.455c0-.344.23-.573.57-.573h3.95c.344 0 .573.23.573.573v14.654c0 3.207-.515 5.094-1.718 6.926M230.542 135.498c-4.579 0-6.867-1.545-8.816-3.093-.286-.169-.286-.57-.057-.798l2.635-2.579c.17-.17.572-.229.8 0 1.032.919 2.805 2.004 5.093 2.004 2.52 0 4.468-.802 4.468-2.92 0-2.23-2.92-3.032-5.898-4.405-3.547-1.603-7.155-3.437-7.155-8.015 0-4.295 3.379-6.928 9.273-6.928 3.322 0 6.012.974 7.899 2.233.343.229.228.572 0 .801l-2.46 2.633a.616.616 0 0 1-.8.06c-.974-.576-2.404-1.263-4.694-1.263-3.035 0-4.067 1.263-4.067 2.635 0 1.603 2.176 2.518 4.41 3.548 3.893 1.89 8.585 3.32 8.585 8.416 0 4.75-3.662 7.671-9.216 7.671M255.658 113.515c-4.694 0-8.413 3.95-8.413 8.643 0 4.695 3.72 8.588 8.413 8.588 4.692 0 8.412-3.893 8.412-8.588 0-4.693-3.72-8.643-8.412-8.643m0 21.983c-7.382 0-13.507-5.954-13.507-13.34 0-7.382 6.125-13.394 13.507-13.394s13.507 6.012 13.507 13.394c0 7.386-6.125 13.34-13.507 13.34M289.055 114.888c-1.26-1.085-2.692-1.716-4.635-1.716-3.261 0-6.297 2.462-6.983 6.183h13.792c-.057-1.89-1.03-3.434-2.174-4.467Zm7.555 8.473c0 .345-.229.574-.574.574h-18.599c.4 3.49 3.264 6.753 8.3 6.699 2.346 0 4.288-.861 5.665-1.776.4-.287.63-.23.858 0l2.69 2.749c.225.229.225.63 0 .798-2.576 1.95-5.323 3.093-9.557 3.093-7.897 0-13.507-5.897-13.507-13.683 0-3.891 1.43-7.213 3.72-9.503 2.232-2.345 5.095-3.547 8.927-3.547 3.836 0 6.812 1.601 8.756 3.72 2.116 2.235 3.375 5.324 3.375 9.62l-.054 1.256ZM167.983 157.865c-.792.636-2.702 1.832-5.453 1.832-4.84 0-8.943-3.923-8.943-8.944 0-4.842 4.102-8.893 8.943-8.893 2.575 0 4.077.894 5.453 1.812.102.076.155.229.05.356l-.995 1.528c-.076.126-.252.154-.355.077-.816-.56-2.04-1.425-4.153-1.425-3.514 0-6.495 3.03-6.495 6.545 0 3.695 2.951 6.602 6.495 6.602 2.267 0 3.44-.97 4.153-1.4.126-.08.28-.053.355.073l1.02 1.479c.08.127.027.279-.075.358M180.97 144.13c-3.641 0-6.624 3.005-6.624 6.648 0 3.62 2.957 6.628 6.624 6.628 3.646 0 6.6-3.008 6.6-6.628 0-3.643-2.98-6.648-6.6-6.648m0 15.542c-4.94 0-8.991-3.974-8.991-8.894 0-4.916 4.05-8.942 8.991-8.942 4.92 0 8.972 4.026 8.972 8.942 0 4.92-4.051 8.894-8.972 8.894M205.406 159.443h-9.605c-.153 0-.256-.103-.256-.255v-16.841c0-.153.103-.258.256-.258h1.883c.155 0 .257.105.257.258v14.956h7.465c.153 0 .256.102.256.254v1.631c0 .152-.103.255-.256.255M220.49 159.443h-9.605c-.154 0-.257-.103-.257-.255v-16.841c0-.153.103-.258.257-.258h1.884c.153 0 .254.105.254.258v14.956h7.466c.155 0 .257.102.257.254v1.631c0 .152-.102.255-.257.255M238.042 159.443h-12.074c-.155 0-.255-.103-.255-.255v-16.841c0-.153.1-.258.255-.258h12.074c.15 0 .254.105.254.258v1.63c0 .152-.103.255-.254.255h-9.935v5.426h8.583c.156 0 .256.103.256.255v1.632c0 .152-.1.253-.256.253h-8.583v5.505h9.935c.15 0 .254.102.254.254v1.631c0 .152-.103.255-.254.255M277.188 159.443h-12.071c-.155 0-.256-.103-.256-.255v-16.841c0-.153.1-.258.256-.258h12.071c.155 0 .256.105.256.258v1.63c0 .152-.1.255-.256.255h-9.932v5.426h8.585c.15 0 .253.103.253.255v1.632a.24.24 0 0 1-.253.253h-8.585v5.505h9.932c.155 0 .256.102.256.254v1.631c0 .152-.1.255-.256.255M258.495 156.04v-6.072a.256.256 0 0 0-.257-.257h-6.825c-.154 0-.256.103-.256.257v1.55c0 .155.102.255.256.255h4.686v3.721c-.942.992-2.6 1.882-4.788 1.882-3.54 0-6.495-2.875-6.495-6.622 0-3.541 2.955-6.547 6.495-6.547 2.113 0 3.336.866 4.151 1.426.105.077.281.05.358-.078l.992-1.527c.102-.127.05-.281-.053-.356-1.373-.918-2.875-1.812-5.448-1.812-4.892 0-8.94 4.029-8.94 8.894 0 5.02 4.1 8.918 8.94 8.918.937 0 1.755-.156 2.483-.363a8.932 8.932 0 0 0 4.701-3.269"/>
  <path stroke="#004A37" stroke-width="2" d="M57 187h482"/>
  <text fill="#004A37" font-family="Georgia-BoldItalic, Georgia" font-size="72" font-style="italic" font-weight="bold" letter-spacing="6" transform="rotate(-90 98 498)"><tspan x="-177" y="522">Achievement</tspan></text>
  </symbol>
  </svg></div>`).appendTo('#dash')
  
  // certificate template
  var template = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 595 830">
  <use href="#logohead"/>
  <text x="539" y="255" fill="#000" font-family="Georgia-Italic, Georgia" font-size="18" font-style="italic" letter-spacing="1.5" text-anchor="end">
  <tspan x="539" dy="0" font-size="36">Certificate of</tspan>
  <tspan x="544" dy="41" font-size="36">Achievement</tspan>
  <tspan x="545" dy="49" font-size="24">Awarded to</tspan>
  <tspan x="545" dy="111" font-size="24">for the following</tspan>
  <tspan x="539" y="777" class="date"></tspan>
  </text>
  <text x="539" y="406" fill="#000" font-family="Georgia-BoldItalic, Georgia" font-size="36" font-weight="bold" font-style="italic" letter-spacing="1.5" text-anchor="end" class="name">
  </text>
  <text x="539" y="469" fill="#000" font-family="Georgia-Italic, Georgia" font-size="18" font-style="italic" letter-spacing="1.5" text-anchor="end" class="subjects">
  </text>
  </svg>`
  
  // header UI
  $('<div>').addClass('header').appendTo('#dash')
  $('<h1>').addClass('title').text('Certificates').appendTo('#dash .header')
  var selectCycle = $('<select>').appendTo('#dash .header')
  $('<div>').addClass('button').text('Create').click(loadCycle).appendTo('#dash .header')
  $('<div>').addClass('button').text('CSV').click(function() {
    let elems = document.querySelectorAll('.student')
    let studentList = Array.from(elems).map(s => [s.dataset.form, s.dataset.code, s.dataset.name, s.dataset.count || 0])
    studentList.unshift(['Form','Code','Name','Awards'])
    downloadCSV(studentList, 'certificates.csv')
  }).appendTo('#dash .header')
  $('<div>').addClass('button').text('Print').click(function() {
    window.print()
  }).appendTo('#dash .header')
  $('<div>').addClass('button').text('Close').click(function() {
    window.single = false
    $('#dash').remove()
  }).appendTo('#dash .header')
  $('<div>')
    .addClass('cycle')
    .addClass('note')
    .html('<p>Create excellence and endeavour certificates for a report cycle.</p><p>Search for a student, form or year group to select a subset.</p><p>👨🏻‍💻 Email Andrew Kerr for support</p>')
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

  // get the subjects for the selected cycle
  function loadCycle() {
    var cycleId = selectCycle.val()
    $('.cycle').hide()
    if ($(`#c${cycleId}`).length) {
      $(`#c${cycleId}`).show()
    } else {
      var cycle = $('<div>').attr('id', `c${cycleId}`).addClass('cycle').appendTo('#dash')
      getSubjects(cycleId).done((subjects) => loadSubjects(subjects, cycleId))
    }
  }

  function getSubjects(cycleId) {
    return $.ajax("/Services/Reports.svc/GetCycleActivitiesBySubject",{
      data: JSON.stringify({cycleId: cycleId, node:"root"}),
      contentType: 'application/json',
      type: 'POST'})
  }

  var activities = {}
  function loadSubjects(subjects, cycleId) {
    $.each(subjects.d, function() {
      var subject = this.text
      // strip subject code from name
      subject = subject.substring(subject.indexOf(' ') + 1)
      $.each(this.d, function() {
        activities[this.value] = subject
      })
    })
    getStudents(cycleId).done((users) => {
      // generate a subset on record pages
      if (document.location.pathname.startsWith("/Records/")) {
        let value = document.location.search.match(/id=(\w*)/i)[1]
        // recursively filter for selected student, form or year
        function recurse(obj) {
          if (obj.value === value) return obj
          else if (obj.d) {
            let sub = obj.d.map(sub => recurse(sub)).filter(sub => sub)
            if (sub.length) return { ...obj, d: sub }
          }
        }
        users = recurse(users)
      }
      loadStudents(users, cycleId)
    })
  }

  // get the enrolled students after the subjects are loaded
  function getStudents(cycleId) {
    return $.ajax("/Services/Reports.svc/GetCycleActivitiesByStudent",{
      data: JSON.stringify({cycleId: cycleId, node:"root"}),
      contentType: 'application/json',
      type: 'POST'})
  }

  function getUser(userId) {
    started++
    return $.ajax("/Services/User.svc/GetUserDetailsBlobByUserId",{
      data: JSON.stringify({
        targetUserId: userId,
        targetSchoolId: Compass.schoolId,
        page: 1, start: 0, limit: 25}),
      contentType: 'application/json',
      type: 'POST'})
  }
  
  function loadUser(user, cycleId) {
    let userId = user.d.userId
    let name = user.d.userFirstName + " " + user.d.userLastName
    let student = document.querySelector(`#c${cycleId}.cycle .s${userId}.student`)
    student.dataset.code = user.d.userDisplayCode
    student.dataset.name = name
    let el = document.querySelector(`#c${cycleId}.cycle .s${userId}.student .name`)
    el.textContent = name
    // resize text if student name is too long
    let width = el.getBBox().width
    if (width >= 360) {
      let size = Math.round(360 / width * 36)
      el.setAttribute('font-size', size)
      el.setAttribute('y', 406 - (36 - size) / 2)
    }
    finished++
    updateProgress()
  }
  
  function loadStudents(students, cycleId) {
    $.each(students.d, function() {
      var level = this.value
      $('<h2>').text(this.text).appendTo(`#c${cycleId}.cycle`)
      $('<div>').addClass(`y${level} level`).appendTo(`#c${cycleId}.cycle`)
      $.each(this.d, function() {
        // remove leading zero from form name
        var group = this.text.replace(/^0/, '')
        $('<h3>').text(group).appendTo(`#c${cycleId}.cycle .y${level}.level`)
        $('<div>').addClass(`g${group} group`).appendTo(`#c${cycleId}.cycle .y${level}.level`)
        $.each(this.d, function() {
          var userId = this.value
          $('<div>').addClass(`s${userId} student none`).appendTo(`#c${cycleId}.cycle .g${group}.group`)
          let student = document.querySelector(`#c${cycleId}.cycle .s${userId}.student`)
          student.dataset.form = group
          $(template).appendTo(`#c${cycleId}.cycle .s${userId}.student`)
          getUser(userId, cycleId).done((user) => loadUser(user, cycleId))
          getReport(userId, cycleId).done((report) => loadReport(report, cycleId))
        })
      })
    })
  }

  // get the results for each student
  function getReport(userId, cycleId) {
    started++
    return $.ajax("/Services/Reports.svc/GetReportReviewerBlob",{
      data: JSON.stringify({
        entityType: 2,
        entityId: userId,
        cycleId: cycleId,
        studentId: userId}),
      contentType: 'application/json',
      type: 'POST'})
  }

  function loadReport(report, cycleId) {
    var userId = report.d.id
    var award = false
    $.each(report.d.entities, function() {
      var activityId = this.cycleActivityId
      $.each(this.results, function() {
        if (this.itemName == "Award" && this.value[0] == "E") {
          award = true
          let student = document.querySelector(`#c${cycleId}.cycle .s${userId}.student`)
          student.dataset.count = parseInt(student.dataset.count) + 1 || 1
          // work around JQuery not supporting SVG
          var tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
          var $tspan = $(tspan).attr({x:539,dy:30})
            .text(this.value + " in " + activities[activityId])
            .appendTo(`#c${cycleId}.cycle .s${userId}.student .subjects`)
        }
      })
    })
    // dim (and don't print) certificates if no award given
    if (award) $(`#c${cycleId}.cycle .s${userId}.student`).removeClass('none')
    // current report cycle
    $(`#c${cycleId}.cycle .s${userId}.student .date`)
      .text("during " + $('#dash select option:selected').text())
    finished++
    updateProgress()
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