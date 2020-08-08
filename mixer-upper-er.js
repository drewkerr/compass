$(document).ready(function() {

  if (!window.single) {
    window.single = true
  } else {
    return
  }

  var hash = window.location.hash.split('/')
  switch (hash[0]) {
    case '#activity': var activityId = hash[1]; break;
    case '#session': var activityId = hash[1].slice(0, -12); break;
    default: alert('Open a class page first.'); return;
  }

  if ($('body #mix').length) {
    $('body #mix').remove()
  }

  $(`<div id="mix">
      <style type="text/css">
        #mix {
          position: fixed;
          box-sizing: border-box;
          top: 0;
          padding: 0 calc(50% - 490px);
          z-index: 1000;
          background-color: #e3e3e3;
          width: 100%;
          height: 100%;
          overflow: scroll;
          -webkit-overflow-scrolling: touch;
        }
        .ui {
          display: flex;
          align-items: flex-start;
          margin: 1em;
        }
        table {
          background-color: white;
          border-radius: 0.5em;
          box-shadow: 0 0 1em rgba(0, 0, 0, 0.2);
          transform-origin: top left;
        }
        caption {
          font-weight: bold;
          padding: 0 1em 1em;
        }
        tbody tr {
          border-top: #ccc 2px solid;
        }
        tr:first-child th:last-child {
          border-radius: 0 0.5em 0 0;
        }
        tr:last-child td:last-child {
          border-radius: 0 0 0.5em 0;
        }
        th, td {
          position: relative;
          padding: 0.5em 1em;
          border: 0;
          text-align: center;
          font-weight: bold;
        }
        td {
          white-space: nowrap;
          opacity: 0.25;
        }
        td:first-child {
          opacity: 1;
          text-align: left;
        }
        th.highlight {
          background-color: black;
          color: white;
        }
        td.highlight {
          opacity: 1;
        }
        .red {
          background-color: red;
          color: white;
        }
        .orange {
          background-color: darkorange;
          color: white;
        }
        .yellow {
          background-color: yellow;
        }
        .green {
          background-color: green;
          color: white;
        }
        .blue {
          background-color: royalblue;
          color: white;
        }
        .purple {
          background-color: purple;
          color: white;
        }
        .button {
          position: absolute;
          top: 1em;
          right: 1em;
          margin-left: 1em;
          padding: 0.5em 1em;
          border-radius: 0.5em;
          color: #666;
          border: #666 1px solid;
        }
        .button:hover {
          background-color: #ccc;
        }
        .note {
          max-width: 60em;
          margin: 2em;
        }
        .note h6 {
          font-size: 1em;
        }
        .note p {
          padding: 1em;
        }
        .note ul {
          padding: 1em 2.5em 0;
        }
        .note li {
          list-style: initial;
        }
        .note {
          line-height: 1.5;
        }
        .note,
        .note a,
        .note a:visited {
          color: #666;
        }
        .note a,
        .note a:visited {
          text-decoration: underline;
        }
        .note em {
          font-style: italic;
        }
      </style>
    </div>`).appendTo('body')
  $('<div>').addClass('ui').appendTo('#mix')
  var table = $('<div>').addClass('table').appendTo('#mix .ui')
  // var selectGroups = $('<select>').change(function() {
  //   table.empty()
  //   createTable(parseInt(selectGroups.val()))
  // }).appendTo('#mix .ui')
  // for (var i = 3; i < 7; i++) {
  //   var option = $('<option>').attr('value', i).text(i+' groups').appendTo(selectGroups)
  //   if (i == 5) {
  //     option.attr('selected', 'selected')
  //   }
  // }
  $('<div>').addClass('button').text('Close')
    .click(function() {
      window.single = false
      $('#mix').remove()
  }).appendTo('#mix .ui')

  function sortnth(array, n) {
    var sorted = []
    for (var i = 0; i < n+1; i++) {
      for (var j = i; j < array.length; j += n+1) {
        sorted.push(array[j])
      }
    }
    return sorted
  }

  function mixer(classSize, numGroups) {
    var fill = classSize > numGroups ** 2 ? Math.floor(classSize / numGroups ** 2) * numGroups ** 2 : numGroups ** 2
    return Array(numGroups + 1).fill().map((a, group) => {
      var arr = Array(fill).fill().map((b, student) => {
        if (group < numGroups) {
          return (group * Math.floor(student / numGroups) + student) % numGroups
        } else {
          return Math.floor(student / numGroups) % numGroups
        }
      })
      return arr.concat(sortnth(arr, numGroups)).slice(0, classSize)
    })
  }

  var groups = ['Red','Orange','Yellow','Green','Blue','Purple']

  function createTable(numGroups) {
    $('<table>')
      .append($('<thead>')
        .append($('<tr>')))
      .appendTo('#mix .table')
    $('<caption>')
      .text(`Classroom Mixer-upper-er for ${$('#ClassCodeText').text()}`)
      .appendTo('#mix table')
    var mix = mixer(students.length, numGroups)
    //console.log(students.length, numGroups, mix)
    $('<th>').text('Name')
      .appendTo('#mix thead tr')
    $.each(mix, function(i, v) {
      $('<th>').text(i+1)
        .click(highlight)
        .appendTo('#mix thead tr')
    })
    $('<tbody>').appendTo('#mix table')
    $.each(students, function(i, v) {
      var row = $('<tr>').appendTo('#mix tbody')
      var uid = this.uid
      var n = this.n.split(', ')
      $('<td>').text((i+1)+'. ')
        .append($('<a>').text(n[1]+' '+n[0])
          .attr('href','/Records/User.aspx?userId='+uid)
          .addClass('extra-info-link')
          .addClass('sel-student-name')
          .attr('data-action-tip-uid',uid)
          .attr('id',uid))
        .appendTo(row)
      $.each(mix, function() {
        var colour = groups[this[i]]
        $('<td>').text(colour)
          .addClass(colour.toLowerCase())
          .click(highlight)
          .appendTo(row)
      })
    })
    $('#mix thead th:nth-child(2)').click()
    doResize()
  }

  function highlight() {
    $('.highlight').removeClass('highlight')
    $('#mix tr :nth-child('+($(this).index()+1)+')').addClass('highlight');
  }

  $(window).on("resize", doResize)
  function doResize(){
    var table = $('#mix table');
    var scale = ( $(this).height() - 24 ) / table.height();
    table.css({transform: 'scale('+ scale +')'});
    $('.table').width(table.width() * scale);
    $('.table').height(table.height() * scale);
  }

  var students
  $.ajax("/Services/Activity.svc/GetEnrolmentsByActivityId"+"?_dc="+new Date().getTime(),{
    data: JSON.stringify({
      activityId: activityId,
      page: 1, start: 0, limit: 30}),
    contentType:'application/json',
    type:'POST'})
  .done(function(data) {
    students = data.d.filter(function(student) {
      return student.pi
    })
    createTable(5)
  })
  $('<div>')
    .addClass('note')
    .html(`<h6>Instructions</h6>
           <ul>
             <li>Organize your classroom into five table groups with at least five chairs at each grouping.</li>
             <li>Label each of the five table groups with a different colour (Red, Orange, Yellow, Green and Blue).</li>
             <li>Ask all students to read the table to identify the colour from the first mix column (Mix Column 1) that is beside their name. The first combination of students is formed when students move to their colour-coded table group.</li>
             <li>Repeat this process over successive lessons/weeks using the other mix columns (2 through to 6). Click to highlight.</li>
           </ul>
           <p>For a class of 25 or fewer students, there are no repetitions – everyone is always with a new group of students for all six groupings. Teachers who are familiar with the Jigsaw cooperative learning strategy (Murdoch & Wilson, 2004, p. 34) can implement this by using Mix Column 1 as the expert group and Mix Column 6 as the home group.</p>
           <h6>References</h6>
           <p>Cox, P. (2009). <em>The Mixer-upper-er: A Systematic Way to Group Students.</em> Paper presented at the 2009 Mathematical Association of Victoria Annual Conference. La Trobe University, Bundoora.</p>
           <span>👨🏻‍💻 Email Andrew Kerr for support</span>`)
      .appendTo('#mix')
})