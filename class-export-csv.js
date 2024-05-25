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
    </style>
  </div>`).appendTo('body')
  $('<div>').addClass('header').appendTo('#dash')
  $('<h1>').addClass('title').text('Class List Export').appendTo('#dash .header')
  $('<div>').addClass('button').text('Export Student List').click(function() {
    downloadCSV(studentList, 'students.csv')
  }).appendTo('#dash .header')
  $('<div>').addClass('button').text('Export Teacher List').click(function() {
    downloadCSV(teacherList, 'teachers.csv')
  }).appendTo('#dash .header')
  $('<div>').addClass('button').text('Close').click(function() {
    window.single = false
    $('#dash').remove()
  }).appendTo('#dash .header')
  
  var studentList = [["First Name",
                      "Last Name",
                      "Class Name",
                      "Class Year Level",
                      "Subject",
                      "Teacher Name",
                      "Class School Management ID",
                      "Student ID",
                      "Student Email"]]

  var teacherList = [["First Name",
                      "Last Name",
                      "Email"]]
  
  function getSubjects(academicGroupId) {
    return $.ajax("/Services/Subjects.svc/GetSubjectsInAcademicGroup",{
      data: JSON.stringify({
      academicGroupId: academicGroupId,
      includeDataSyncSubjects: true,
      //subjectName: "math",
      page: 1, start: 0, limit: 200,
      sort:"[{\"property\":\"importIdentifier\",\"direction\":\"ASC\"}]"}),
      contentType:'application/json',
      type:'POST'})
  }

  function getClass(subjectId) {
    return $.ajax("/Services/Subjects.svc/GetStandardClassesOfSubject",{
      data: JSON.stringify({subjectId: subjectId,
      page: 1, start: 0, limit: 50,
      sort:"[{\"property\":\"name\",\"direction\":\"ASC\"}]"}),
      contentType:'application/json',
      type:'POST'})
  }
  
  function getStaff(targetUserId) {
    return $.ajax("/Services/User.svc/GetUserDetailsBlobByUserId",{
      data:JSON.stringify({
        targetUserId: targetUserId,
        targetSchoolId: Compass.schoolId,
        page: 1, start: 0, limit: 25}),
      contentType:'application/json',
      type:'POST'})
  }
  
  function getEnrolments(activityId) {
    return $.ajax("/Services/Activity.svc/GetEnrolmentsByActivityId",{
      data: JSON.stringify({
        activityId: activityId,
        page: 1, start: 0, limit: 30}),
      contentType:'application/json',
      type:'POST'})
  }
    
  var loadSubjects = function(subjects) {
    $('<table>').appendTo('#dash')
    $('<thead>').appendTo('#dash table')
    tableRow(['Subject', 'Name', 'Year Level'], true).appendTo('#dash table thead')
    $('<tbody>').appendTo('#dash table')
    $.each(subjects.d.data, function() {
      tableRow([this.importIdentifier, this.shortName, this.yearLevelShortName]).appendTo('#dash table tbody')
      getClass(this.id).done(function(group) {
        loadClass(group, this.yearLevelShortName)
      })
    })
  }

  var loadClass = function(group, classlevel) {
    $.each(group.d.data, function() {
      var activityId = this.id
      var classname = [this.name, this.subjectLongName].join(" - ")
      var classid = this.name
      var subject = this.subjectLongName
      getStaff(this.managerId).done(function(staff) {
        loadStaff(staff, activityId, classname, classlevel, subject, classid)
      })
    })
  }

  var loadStaff = function(staff, activityId, classname, classlevel, subject, classid) {
    let fname = staff.d.userPreferredName
    let lname = staff.d.userFullName.split(" ")
    lname = lname[lname.length - 1]
    let teacher = [fname, lname].join(" ")
    let email = staff.d.userEmail.toLowerCase()
    classname = [classname, teacher].join(" - ")
    if (!teacherList.some(t => t.includes(email))) {
      let row = [fname, lname, email]
      teacherList.push(row)
    }
    getEnrolments(activityId).done(function(enrolments) {
      loadEnrolments(enrolments, teacher, classname, classlevel, subject, classid)
    })
  }

  var loadEnrolments = function(enrolments, teacher, classname, classlevel, subject, classid) {
    var students = enrolments.d.filter(function(student) {
      return student.pi
    })
    $.each(students, function() {
      var student = this.n.split(", ")
      var email = this.ii.toLowerCase() + "@crusoecollege.vic.edu.au"
      var row = [student[1], student[0], classname, classlevel, subject, teacher, classid, this.ii, email]
      studentList.push(row)
    })
  }
  
  var tableRow = function(cells, header = false) {
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
  
  getSubjects(-1).done(loadSubjects)
  
})