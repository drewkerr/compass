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
      #dash .header {
        display: flex;
        align-items: center;
        margin: 1em;
      }
      #dash h1 {
        font: revert;
      }
      #dash .button {
        display: inline-block;
        margin-left: 1em;
        padding: 0.5em 1em;
        border-radius: 0.5em;
        color: #666;
        border: #666 1px solid;
      }
      #dash .button:hover {
        background-color: #ccc;
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
      #dash .top td:first-child {
        background-color: #fff391;
      }
    </style>
  </div>`).appendTo('body')
  $('<div>').addClass('header').appendTo('#dash')
  $('<h1>').addClass('title').text('Attendance Summary').appendTo('#dash .header')
  $('<div>').addClass('button').text('Close').click(function() {
    window.single = false
    $('#dash').remove()
  }).appendTo('#dash .header')
  
  var d = new Date()
  var startYear = new Date(d.getFullYear(), 0, 1)
  var lastMonday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - (d.getDay() + 6) % 7)
  var prevFriday = new Date(d.getFullYear(), d.getMonth(), lastMonday.getDate() - 3)
  var endToday = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  
  $('<table>').append($('<thead>').append($('<tr>'))).appendTo('#dash')
  var headers = {
    'Group': '',
    'This Week': `${lastMonday.toLocaleDateString()} - ${endToday.toLocaleDateString()}`,
    'Previous Weeks': `${startYear.toLocaleDateString()} - ${prevFriday.toLocaleDateString()}`
    }
  $.each(Object.keys(headers), function() {
    $('<th>').attr('title', headers[this]).text(this).appendTo('#dash thead tr')
  })
  $('<tbody>').appendTo('#dash table')
  
  getHouses().done(loadHouses)
  function getHouses() {
    return $.ajax("/Services/User.svc/GetStudentHouses",{
      data: JSON.stringify({includeInternal:true,includeExternal:false,page:1,start:0,limit:25}),
      contentType: 'application/json',
      type: 'POST'})
  }

  const average = (a) => a.reduce((sum, value) => sum + value, 0) / a.length
  
  function loadHouses(houses) {
    var prev = {}
    var last = {}
    let deferred = []
    $.each(houses.d, function() {
      let house = this.id
      deferred.push(
        getAttendance(house, startYear.toISOString(), lastMonday.toISOString())
        .done((students) => loadAttendance(students, house, prev)),
        getAttendance(house, lastMonday.toISOString(), endToday.toISOString())
        .done((students) => loadAttendance(students, house, last))
      )
    })
    $.when(...deferred).done(function() {
      let top = [0, 0, 0]
      // sort keys in numerial order
      const collator = new Intl.Collator([], {numeric: true})
      Object.keys(last)
      .sort((a, b) => collator.compare(a, b))
      .forEach(function(v, i) {
        let n = average(last[v])
        let row = $('<tr>')
        row.appendTo('#dash tbody')
        const checkTop = (i) => {
          let type = ['form', 'year', 'house']
          row.addClass(type[i])
          if (top[i] < n) {
            top[i] = n
            $(`#dash .${type[i]}`).removeClass('top')
            row.addClass('top')
          }
        }
        let url = `/Records/House.aspx?id=${v}`
        if (/^\d/.test(v)) {
          url = `/Records/FormGroup.aspx?id=${v}`
          checkTop(0)
        } else if (/^Year/.test(v)) {
          url = `/Records/YearLevel.aspx?id=${v.slice(5)}`
          checkTop(1)
        } else {
          checkTop(2)
        }
        n = n.toFixed(1)
        $('<td>').html(`<a href="${url}">${v}</a>`).appendTo(row)
        let bg = 'background-color'
        let rgba = `rgba(164, 218, 164, ${(n/100)**2})`
        $('<td>').text(`${n}%`).css(bg, rgba).appendTo(row)
        n = average(prev[v]).toFixed(1)
        rgba = `rgba(164, 218, 164, ${(n/100)**2})`
        $('<td>').text(`${n}%`).css(bg, rgba).appendTo(row)
      })
    })
  }
  
  function getAttendance(houseName, startDate, endDate) {
    return $.ajax("/Services/Attendance.svc/GetUserSummariesByHouse",{
      data: JSON.stringify({startDate: startDate,
                            endDate: endDate,
                            studentStatus:"1",inClass:["0","1"],overall:["0","1"],okClass:["0","1"],vce:["0","1"],schl:["0","1"],perspective:"1",totalWholeDayLimit:"0",totalPartialDayLimit:"0",
                            houseName: houseName}),
      contentType: 'application/json',
      type: 'POST'})
  }
  
  function loadAttendance(students, house, span) {
    // check object has key before push
    const push = (o, k, v) => {
      (o[k] || (o[k] = [])).push(parseInt(v))
    }
    $.each(students.d, function() {
      push(span, house, this.spc)
      push(span, this.fg, this.spc)
      push(span, this.yl, this.spc)
    })
  }
  
})