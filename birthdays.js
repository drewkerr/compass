$(document).ready(function(){
if (!window.single){
  window.single=true;
} else{
  return;
}
if ($('body #dash').length){
  $('body #dash').remove();
}
var wrapper=$(`<div id="dash"><style type="text/css">
#dash {
	display: flex;
	align-items: center;
	flex-direction: column;
	position: fixed;
	box-sizing: border-box;
	top: 0;
	padding: 64px calc(50% -
	490px);
	z-index: 100;
	background-color: #f0f2f5;
	width: 100%;
	height: 100%;
	overflow: scroll;
	-webkit-overflow-scrolling: touch;
}
#dash .header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin: 1em;
	width: 100%;
}
#dash .button {
	margin-left: 1em;
	padding: 0.5em
	1em;
	border-radius: 0.5em;
	color: #666;
	border: #666 1px solid;
}
#dash .button:hover {
	background-color: #ccc;
}
#dash li {
	margin: 1em 0;
	text-align: center;
	font-size: 125%;
}
@keyframes spin {
	0% {
		transform: rotate(0) rotateX(0);
	}
	100% {
		transform: rotate(180deg) rotateX(360deg);
	}
}
#dash .graph {
	display: flex;
	align-items: baseline;
	width: 100%;
	position: fixed;
	bottom: 0;
}
#dash .bar {
	background-color: #3e85f2;
	flex-grow: 1;
}
#dash .bar:hover {
	background-color: #ff3333;
}
</style></div>`).appendTo('body');
$('<div>').addClass('header').appendTo('#dash');
$('<div>').addClass('date').appendTo('#dash .header');
$('<h1>').addClass('title').text('Happy Birthday').appendTo('#dash');
var selectDay=$('<select>').appendTo('#dash .date');
var selectMonth=$('<select>').appendTo('#dash .date');
var date=new Date().getDate();
var month=new Date().getMonth()+1;
var months=[ "January", "February", "March", "April", "May", "June",
"July", "August", "September", "October", "November", "December" ];
$.each(months, function(i,n){
  var option=$('<option>').attr('value',i+1).text(n).appendTo(selectMonth);
  if (i+1==month){
    option.attr('selected','selected');
  }
});
$('<div>').addClass('button').text('Close').click(function(){
  window.single=false;
  $('#dash').remove();
}).appendTo('#dash .header');
var list=$('<ul>').appendTo('#dash');
function setDay(){
  date=selectDay.val();
  list.empty();
  var names=data[month-1][date-1];
  $.each(names,function(){
    $('<li>').text(this).appendTo(list);
  });
  if (names.length) confetti();
}
function setMonth(){
  selectDay.empty();
  month=selectMonth.val();
  for (var i=1; i <= daysInMonth(month); i++){
    var option=$('<option>').attr('value',i).text(i).appendTo(selectDay);
    if (i==date){
      option.attr('selected','selected');
    }
  }
  setDay();
}
function daysInMonth(month){
  return new Date(new Date().getFullYear(),month,0).getDate();
}
var data;
$.ajax("/Services/UserRecords.svc/GetAllPeopleThin"+"?_dc="+new Date().getTime(),{
  data:JSON.stringify({"advancedFilterString":"{\"yearLevels\":[],\"formGroups\":[],\"userHouses\":[],\"userStatuses\":[1],\"userRoles\":[1,2],\"searchString\":\"\",\"authModes\":[],\"customFlags\":[],\"contactNumber\":\"\",\"addressString\":\"\",\"googlePlace\":false}","page":1,"start":0,"limit":1000,"sort":"[{\"property\":\"currentOrganisationBaseRole\",\"direction\":\"ASC\"},{\"property\":\"currentOrganisationFormGroup\",\"direction\":\"ASC\"},{\"property\":\"username\",\"direction\":\"ASC\"}]","filter":"[{\"value\":null}]"}),
  contentType:'application/json',
  type:'POST'})
.done(function(people){
  selectDay.change(setDay);
  selectMonth.change(setMonth);
  $('<div>').addClass('graph').appendTo('#dash');
  data=[...Array(12).keys()].map(v=>Array(daysInMonth(v+1)).fill(false));
  people.d.data.forEach(function(person){
    var dmy=person.dateOfBirth.split('/');
    var d=parseInt(dmy[0]);
    var m=parseInt(dmy[1]);
    if (person.currentOrganisationBaseRole==1){
      var text=person.displayName+' ('+person.currentOrganisationFormGroup+')';
    } else {
      if (d==1&&m==1) {
        var fake=true;
      }
      var text=person.title+' '+person.displayName;
    }
    if (!fake) {
      if (data[m-1][d-1]) {
        data[m-1][d-1].push(text);
      } else {
        data[m-1][d-1]=[text];
      }
    }
  });
  setMonth();
  setDay();
  data.forEach(function(month,m){
    month.forEach(function(names,d){
      var x=names.length;
      $('<div>')
        .addClass('bar')
        .attr('title',(d+1)+' '+months[m]+' ('+x+')')
        .css({height:x*10+'px'})
        .click(function(){
          selectMonth.val(m+1).change();
          selectDay.val(d+1).change();
        })
        .appendTo('#dash .graph');
    });
  });
});
function confetti(){
  for (var i=0; i < 100; i++){
    var width=Math.random() * 5 + 10;
    var height=width * 0.5;
    var colour=['#f33','#f90','#fc0','#4d6','#3cf'][Math.floor(Math.random()*5)];
    $('<div>').addClass('confetti').css({
      'position': 'absolute',
      'background-color': colour,
      'width': width+'px',
      'height': height+'px',
      'top': -Math.random()*10+'%',
      'left': '50%',
      'animation': 'spin '+(Math.random()+0.5)+'s linear infinite'
    }).appendTo('#dash')
      .animate({
        top: ['100%', 'easeInSine'],
        left: [Math.random()*100+'%', 'easeOutSine']
      },
      Math.random()*1000+2000,
      function(){
        this.remove();
      });
  }
}
jQuery.extend(jQuery.easing, {
  easeInSine: function (x,t,b,c,d){
    return -c*Math.cos(t/d*(Math.PI/2))+c+b;
  },
  easeOutSine: function (x,t,b,c,d){
    return c*Math.sin(t/d*(Math.PI/2))+b;
  }
});
});