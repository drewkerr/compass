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
$('<div id="guess"><style type="text/css">#guess { position: fixed; box-sizing: border-box; top: 0; padding: 0; z-index: 1000; background-color: #e3e3e3; width: 100%; height: 100%; overflow: scroll; -webkit-overflow-scrolling: touch; } .header { display: flex; align-items: flex-start; margin: 1em; } #guess img { margin: 0 0 1vw 1vw; width: 11vw; border-radius: 1vw; } .button { margin-left: 1em; padding: 0.5em 1em; border-radius: 0.5em; color: #666; border: #666 1px solid; } .button:hover { background-color: #ccc; }</style></div>').appendTo('body');
$('<div>').addClass('header').appendTo('#guess');
$('<h1>').addClass('title').text('Guess Who?').appendTo('#guess .header');
$('<div>').addClass('button').text('Reset')
  .click(function() {
    $('#guess img').css('opacity', 1);
}).appendTo('#guess .header');
$('<div>').addClass('button').text('Close')
  .click(function() {
    window.single = false;
    $('#guess').remove();
}).appendTo('#guess .header');
$.ajax("/Services/Attendance.svc/GetRollPackage"+"?_dc="+new Date().getTime(),{
  data: JSON.stringify({
    instanceId: instanceId}),
  contentType:'application/json',
  type:'POST'})
.done(function(data) {
  $.each(data.d.rollData, function() {
    var url = this.img.split('roll');
    if (url[1] == '/no_user_pic.jpg') {
      var src = this.img;
    } else {
      var src = url[0] + 'full' + url[1];
    }
    $('<img>')
      .attr('src', src)
      .attr('title', this.n)
      .click(function() {
        if ($(this).css('opacity') == 1) {
          $(this).css('opacity', 0.1);
        } else {
          $(this).css('opacity', 1);
        }
      })
      .appendTo('#guess');
  });
});
});