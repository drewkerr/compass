$(document).ready(function(){
if (!window.single) {
  window.single = true;
} else {
  return;
}
var hash = window.location.hash.split('/');
switch (hash[0]){
  case '#session': var instanceId = hash[1]; break;
  default: alert('Open a lesson page first.'); return;
}
if ($('body #guess').length) {
  $('body #guess').remove();
}
$(`<div id="guess"><style type="text/css">
#guess {
	position: fixed;
	box-sizing: border-box;
	top: 0;
	padding: 0;
	z-index: 1000;
	background-color: #f0f2f5;
	width: 100%;
	height: 100%;
	overflow: scroll;
	-webkit-overflow-scrolling: touch;
}
#guess .header {
	display: flex;
	align-items: flex-start;
	margin: 1em;
}
#guess .card {
  display: inline-block;
	margin: 0 0 1vw 1vw;
  height: 14vw;
	width: 11vw;
  perspective: 1000px;
}
#guess .front, #guess .back {
  position: relative;
  backface-visibility: hidden;
  border-radius: 0.5rem;
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  box-shadow: 0 0 .125rem rgba(80,80,80,.14),0 .125rem .125rem rgba(80,80,80,.12),0 .125rem .1875rem rgba(80,80,80,.2);
  transition: transform 0.5s ease;
}
#guess .card:hover .front {
  transform: rotateY(-180deg);
}
#guess .card:hover .back {
  transform: rotateY(0deg) translateY(-14vw);
}
#guess .front {
  background-size: cover;
  background-position: center;
}
#guess .back {
  background-color: dodgerblue;
  color: white;
  text-align: center;
  padding: 50% 0 0 0;
  transform: rotateY(180deg) translateY(-14vw);
}
#guess .button {
	margin-left: 1em;
	padding: 0.5em 1em;
	border-radius: 0.5em;
	color: #666;
	border: #666 1px solid;
}
#guess .button:hover {
	background-color: #ccc;
}
</style></div>`).appendTo('body');
$('<div>').addClass('header').appendTo('#guess');
$('<h1>').addClass('title').text('Guess Who?').appendTo('#guess .header');
$('<div>').addClass('button').text('Reset')
  .click(function() {
    $('#guess .card').css('opacity', 1);
}).appendTo('#guess .header');
$('<div>').addClass('button').text('Close')
  .click(function() {
    window.single = false;
    $('#guess').remove();
}).appendTo('#guess .header');
$.ajax("/Services/Attendance.svc/GetRollPackage",{
  data: JSON.stringify({
    instanceId: instanceId}),
  contentType:'application/json',
  type:'POST'})
.done(function(rolldata) {
  $.each(rolldata.d.data.rollData, function() {
    var url = this.img.split('roll');
    if (url[1] == '/no_user_pic.jpg') {
      var src = this.img;
    } else {
      var src = url[0] + 'full' + url[1];
    }
    var card = $('<div>')
      .addClass('card')
      .click(function() {
        if ($(this).css('opacity') == 1) {
          $(this).css('opacity', 0.1);
        } else {
          $(this).css('opacity', 1);
        }
      }).appendTo('#guess');
    var front = $('<div>').addClass('front').css('background-image', `url(${src})`).appendTo(card);
    var back = $('<div>').addClass('back').text(this.n).appendTo(card);
  });
});
});