$(document).ready(function() {
if (!window.single) {
  window.single = true;
} else {
  return;
}
if (/(MSIE|Trident\/|Edge\/)/i.test(navigator.userAgent)) {
  alert('Internet Explorer and Edge not supported. Try Chrome or Firefox.');
  return;
}
var hash = window.location.hash.split('/');
switch (hash[0]) {
  case '#activity': var activityId=hash[1]; break;
  case '#session': var activityId=hash[1].slice(0,-12); break;
  default: alert('Open a class page first.'); return;
}
var startDate = new Date(new Date().getFullYear(),0,1,11).toISOString();
var endDate = new Date().toISOString();
if ($('body #dash').length) {
  $('body #dash').remove();
}
$('<div id="dash"><style type="text/css">#dash { position: fixed; box-sizing: border-box; top: 0; padding: 64px calc(50% - 490px); z-index: 100; background-color: #e3e3e3; width: 100%; height: 100%; overflow: scroll; -webkit-overflow-scrolling: touch; } #dash .header { display: flex; align-items: center; margin: 1em; } #dash table { background-color: white; border-radius: 0.5em; box-shadow: 0 0 1em rgba(0, 0, 0, 0.2); margin: 1em; } #dash tbody tr { border-top: #ccc 1px solid; } #dash tbody tr:hover { background-color: #eee; } #dash tr:last-child td:first-child { border-radius: 0 0 0 0.5em; } #dash tr:last-child td:last-child { border-radius: 0 0 0.5em 0; } #dash th, #dash td { position: relative; padding: 1em; border: 0; } #dash .green { background-color: rgba(68, 221, 102, 0.2); } #dash .yellow { background-color: rgba(255, 204, 0, 0.2); } #dash .red { background-color: rgba(255, 51, 51, 0.2); } #dash .grey { color: #999; } #dash .button { margin-left: 1em; padding: 0.5em 1em; border-radius: 0.5em; color: #666; border: #666 1px solid; } #dash .button:hover { background-color: #ccc; } #dash .note { padding: 1em; } #dash .note, #dash .note a, #dash .note a:visited { color: #666; }</style></div>').appendTo('body');
$('<div>').addClass('header').appendTo('#dash');
$('<h1>').addClass('title')
  .text('Class Summary: '+$('#ClassCodeText').text()).appendTo('#dash .header');
$('<div>').addClass('button').text('Close')
  .click(function() {
    window.single = false;
    $('#dash').remove();
}).appendTo('#dash .header');
$('<table>').append($('<thead>').append($('<tr>'))).appendTo('#dash');
$('<div>').addClass('note')
  .html('<a href="mailto:kerr.andrew.p@edumail.vic.gov.au?subject=Re: Compass Class Dashboard">👨🏻‍💻 Email Andrew Kerr for support</a>').appendTo('#dash');
var headers = {
  'Name':'',
  'Attendance':'Includes sessions present, late and approved absenses',
  'Chronicle':'General Chronicle entries',
  'Contacts':'Days since last contact home',
  'Tasks':'Learning Tasks included in semester reports',
  'GPA':'Grade Point Average on latest progress report',
  'GPA Growth':'Growth from previous progress report',
  'VC Growth':'Victorian Curriculum average growth to latest semester report (6 months = 0.5)'};
$.each(Object.keys(headers),function() {
  $('<th>').attr('title',headers[this]).text(this).appendTo('#dash thead tr');
});
var userIds = [];
function getStudents(startDate, endDate, activityId) {
  return $.ajax("/Services/Attendance.svc/GetUserSummariesByActivityWithFilter"+"?_dc="+new Date().getTime(),{
    data:JSON.stringify({
      startDate:startDate,
      endDate:endDate,
      ActivityId:activityId,
      studentStatus:1,inClass:1,okClass:1,vce:1,schl:1}),
    contentType:'application/json',
    type:'POST'});
}
function getTasks(user) {
  return $.ajax("/Services/Subjects.svc/GetAllAcademicGroups",{
      data:JSON.stringify({
        page:1,start:0,limit:25}),
      contentType:'application/json',
      type:'POST'}).then(function(cycles) {
    var currentCycle = cycles.d.filter(function(cycle) {return cycle.isRelevant})[0].id;
    return $.ajax("/Services/LearningTasks.svc/GetAllLearningTasksByUserId"+"?_dc="+new Date().getTime(),{
      data:JSON.stringify({
        academicGroupId:currentCycle,
        userId:user,
        page:1,start:0,limit:100}),
      contentType:'application/json',
      type:'POST',
      user:user});
  });
}
function getGPA(user) {
  return $.ajax("/Services/Gpa.svc/GetOverallGraphData"+"?_dc="+new Date().getTime(),{
    data:JSON.stringify({userId:user}),
    contentType:'application/json',
    type:'POST',
    user:user});
}
function getContacts(user) {
  return $.ajax("/Services/ChronicleV2.svc/GetUserChronicleFeed"+"?_dc="+new Date().getTime(),{
    data:JSON.stringify({
      targetUserId:user,
      startDate:startDate,
      endDate:endDate,
      filterCategoryId:13,
      start:0,pageSize:5,asParent:false,page:1,limit:25}),
    contentType:'application/json',
    type:'POST',
    user:user});
}
function getChronicle(activityId) {
  return $.ajax("/Services/ChronicleV2.svc/GetCategoryUsageCount"+"?_dc="+new Date().getTime(),{
    data:JSON.stringify({
      type:1,
      id:activityId}),
    contentType:'application/json',
    type:'POST'});
}
function getVC() {
  return $.ajax("/Services/AnalyticsV2.svc/GetCycles"+"?_dc="+new Date().getTime(),{
    data:JSON.stringify({
      userIds:userIds,
      page:1,start:0,limit:25}),
    contentType:'application/json',
    type:'POST'});
}
function getVCGrowth(cycleIds) {
  return $.ajax("/Services/AnalyticsV2.svc/GetCyclesByCycleIds"+"?_dc="+new Date().getTime(),{
    data:JSON.stringify({
      cycleIds:cycleIds,
      userIds:userIds,
      page:1,start:0,limit:25}),
    contentType:'application/json',
    type:'POST'});
}

function loadStudents(students) {
  $('<tbody>').appendTo('#dash table');
  $.each(students.d,function() {
    var user = this.uid;
    userIds.push(user);
    $('<tr>').addClass('dash'+user).appendTo('#dash tbody');
    $.each(Object.keys(headers),function() {
      $('<td>').addClass(this.replace(' ','-').toLowerCase())
        .attr('title',headers[this]).appendTo('.dash'+user);
    });
    $('<a href="/Records/User.aspx?userId='+user+'">'+this.un+'</a>')
      .addClass('extra-info-link').addClass('sel-student-name')
      .attr('data-action-tip-uid',user).attr('id',user).appendTo('.dash'+user+' .name');
    var att = this.pok;
    var el = $('.dash'+user+' .attendance');
    el.text(att+'%');
    switch (true) {
      case (att < 90): el.addClass('red'); break;
      case (att < 95): el.addClass('yellow'); break;
      default: el.addClass('green'); break;
    }
    getTasks(user).done(loadTasks);
    getGPA(user).done(loadGPA);
    getContacts(user).done(loadContacts);
  });
  getChronicle(activityId).done(loadChronicle);
  getVC(activityId).done(loadVC);
}

function loadTasks(tasks) {
  var user = this.user;
  var subs = {overdue:0, late:0, pending:0, ontime:0};
  var el = $('.dash'+user+' .tasks');
  $.each(tasks.d.data,function() {
    if (this.includeInSemesterReports) {
      switch(this.students[0].submissionStatus) {
        case 1: subs.pending++; break;
        case 2: subs.overdue++; break;
        case 3: subs.ontime++; break;
        case 4: subs.late++; break;
      }
    }
  });
  var submissions=[];
  $.each(subs,function(key,val) {
    if (val) submissions.push(val+' '+key);
  });
  el.text(submissions.join(', '));
  switch (true) {
    case (subs.overdue > 0): el.addClass('red'); break;
    case (subs.late > 0): el.addClass('yellow'); break;
    default: el.addClass('green');
  }
}

function loadGPA(cycles) {
  var user = this.user;
  var el = $('.dash'+user+' .gpa');
  if (cycles.d.length) {
    var gpa = cycles.d[cycles.d.length-1].score;
    el.text(gpa);
    switch (true) {
      case (gpa < 2.9): el.addClass('red'); break;
      case (gpa < 3.5): el.addClass('yellow'); break;
      default: el.addClass('green');
    }
  } else {
    el.addClass('grey').text('NA');
  }
  var el = $('.dash'+user+' .gpa-growth');
  if (cycles.d.length >= 2) {
    var growth = cycles.d[cycles.d.length-1].score-cycles.d[cycles.d.length-2].score;
    el.text(growth.toFixed(2));
    switch (true) {
      case (growth < -0.25): el.addClass('red'); break;
      case (growth < 0.0): el.addClass('yellow'); break;
      default: el.addClass('green');
    }
  } else {
    el.addClass('grey').text('NA');
  }
}

function loadChronicle(chronicle) {
  $.each(chronicle.d,function() {
    if ([1,2,3,4,5,6,14].includes(this.categoryId)) {
      if (this.counts) {
        $.each(this.counts,function() {
          user = this.StudentId;
          var el = $('.dash'+user+' .chronicle');
          var count = parseInt(el.text());
          if (!count) count = 0;
          el.text(count+this.Grey+this.Green+this.Amber+this.Red);
          switch (true) {
            case (this.Red > 0): el.addClass('red'); break;
            case (this.Amber > 0): el.addClass('yellow'); break;
            case (this.Green > 0): el.addClass('green');
          }
        });
      }
    }
  });
  $('.chronicle:empty').addClass('grey').text('0');
}

function loadContacts(contacts) {
  var user = this.user;
  var el = $('.dash'+user+' .contacts');
  if (contacts.d.total) {
    var occ = contacts.d.data[0].chronicleEntries[0].occurredTimestamp;
    var days = Math.ceil((new Date() - new Date(occ)) / (1000 * 60 * 60 * 24));
    el.text(days+" days");
    switch (true) {
      case (days>60): el.addClass('red'); break;
      case (days>30): el.addClass('yellow'); break;
      default: el.addClass('green');
    }
  } else {
    el.addClass('grey').text('NA');
  }
}

function loadVC(cycles) {
  var cycleIds = [];
  $.each(cycles.d,function() {
    if (this.type == 22 && !this.name.includes("Import")) {
      cycleIds.push(this.id);
    }
  });
  if (cycleIds.length < 2) {
    $.each(userIds,function() {
      var user = this;
      var el = $('.dash'+user+' .vc-growth');
      el.addClass('grey').text('NA');
    });
    return;
  } else if (cycleIds.length > 2) {
    cycleIds = cycleIds.slice(-2);
    getVCGrowth(cycleIds).done(loadVCGrowth);
  }
}

function loadVCGrowth(cycles) {
  var getResult = function(cycle,user) {
    var results = cycles.d[cycle].enrolments
      .filter(function(result) {return result.userId == user});
    if (results.length) {
      results = results[0].results;
      return Object.keys(results)
        .map(function(key) {return results[key].result;})
        .map(parseFloat)
        .filter(Boolean);
    } else {
      return false;
    }
  }
  var avg = function(arr) {
    return arr.reduce(function(sum,val) {return sum+val;})/arr.length;
  };
  $.each(userIds,function() {
    var user = this;
    var el = $('.dash'+user+' .vc-growth');
    var res1 = getResult(1,user);
    var res0 = getResult(0,user);
    if (res0.length && res1.length) {
      var growth = avg(res1) - avg(res0);
      el.text(growth.toFixed(2));
      switch (true) {
        case (growth<0.0): el.addClass('red'); break;
        case (growth<0.5): el.addClass('yellow'); break;
        default: el.addClass('green');
      }
    } else {
      el.addClass('grey').text('NA');
    }
  });
}

getStudents(startDate,endDate,activityId).done(loadStudents);
});