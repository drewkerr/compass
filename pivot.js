$(document).ready(function() {

if ($("body #pivot").length) {
  $("body #pivot").remove();
}

$(`<div id="pivot">
<script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui-touch-punch/0.2.3/jquery.ui.touch-punch.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/plotly.js/2.5.1/plotly-basic.min.js"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/pivottable/2.23.0/pivot.min.css" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/pivottable/2.23.0/pivot.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pivottable/2.23.0/plotly_renderers.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pivottable/2.23.0/tips_data.min.js"></script>
<style type="text/css">
#pivot {
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
#pivot .header {
	display: flex;
	align-items: center;
	margin: 1em;
}
#pivot .button {
	margin-left: 1em;
	padding: 0.5em 1em;
	border-radius: 0.5em;
	color: #666;
	border: #666 1px solid;
}
#pivot .button:hover {
	background-color: #ccc;
}
#pivot .note {
	padding: 1em;
}
#pivot .note, #pivot .note a, #pivot .note a:visited {
	color: #666;
}
</style></div>`).appendTo('body');

$('<div>').addClass('header').appendTo('#pivot');
$('<h1>').addClass('title')
  .text('Data Pivot').appendTo('#pivot .header');
$('<div>').addClass('button').text('Close')
  .click(function() {
    $('#pivot').remove();
}).appendTo('#pivot .header');
$('<div id="output">').appendTo('#pivot');
$('<div>').addClass('note')
  .html('👨🏻‍💻 Contact Andrew Kerr for support').appendTo('#pivot');

var startDate = new Date(new Date().getFullYear(),0,1,11).toISOString();
var endDate = new Date().toISOString();  
var activityId = 21355;

var userIds = [];
function getStudents(startDate, endDate, activityId) {
  return $.ajax("/Services/Attendance.svc/GetUserSummariesByActivityWithFilter"+"?_dc="+new Date().getTime(),{
    data:JSON.stringify({
      startDate:startDate,
      endDate:endDate,
      ActivityId:activityId,
      studentStatus:1,inClass:[0,1],okClass:[0,1],vce:[0,1],schl:[0,1],perspective:0,totalWholeDayLimit:0,totalPartialDayLimit:0,}),
    contentType:'application/json; charset=utf-8',
    type:'POST'});
}

function loadStudents(students) {
  $("#pivot #output").pivotUI(
  students.d, {
    rows: ["un"],
    cols: ["yl"],
    renderers: $.extend(
    	$.pivotUtilities.renderers, 
      $.pivotUtilities.plotly_renderers
    )
  });
}

getStudents(startDate,endDate,activityId).done(loadStudents);
});