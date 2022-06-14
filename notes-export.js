$(document).ready(function() {

var hash = window.location.hash.split('/')
switch (hash[0]) {
  case '#session': var instanceId = hash[1]; break;
  default: alert('Open a class page first.'); return;
}

if ($('body #notex').length) {
  $('body #notex').remove()
  return
}

$(`<div id="notex"><style type="text/css">
#notex {
  position: fixed;
  box-sizing: border-box;
  top: 0;
  padding: 64px calc(50% - 665px / 2);
  z-index: 100;
  background-color: #f0f2f5;
  width: 100%;
  height: 100%;
  font-family: sans-serif;
  line-height: 1.5;
  overflow: scroll;
  -webkit-overflow-scrolling: touch;
}
#notex .header {
  display: flex;
  align-items: center;
  margin: 1em;
}
#notex .button {
  margin-left: 1em;
  padding: 0.5em 1em;
  border-radius: 0.5em;
  color: #666;
  border: #666 1px solid;
}
#notex .button:hover {
  background-color: #ccc;
}
#notex .body {
  background-color: white;
  border-radius: 0.5em;
  box-shadow: 0 0 0.25em rgba(0,0,0,0.4);
}
#notex .body h1,
#notex .body h2 {
  padding: 1rem 0 0 1rem;
}
#notex .date,
#notex .meta:not(:empty) {
  border-radius: 0.5em;
  margin-top: 1em;
  padding: 1em;
}
#notex .date {
  background-color: #dce6f1;
}
#notex .meta:not(:empty) {
  background-color: #eff3f8;
}
#notex .body div:not(:empty) {
  padding: 1em;
}
@media print {
	#notex {
	position: static;
	}
	body * {
	visibility: hidden;
	}
	#notex .body,  #notex .body * {
	visibility: visible;
	}
	#notex .body {
	position: absolute;
	left: 0;
	top: 0;
	}
}
</style></div>`).appendTo('body')
$('<div>').addClass('header').appendTo('#notex')
$('<h1>').addClass('title')
  .text('Teacher Notes Export').appendTo('#notex .header')
$('<div>').addClass('button').text('Save as PDF')
  .click(function() {
    window.print()
}).appendTo('#notex .header')
$('<div>').addClass('button').text('Close')
  .click(function() {
    $('#notex').remove()
}).appendTo('#notex .header')
$('<div>').addClass('body').appendTo('#notex')

var ajaxQueue = $({})
$.ajaxQueue = function(ajaxOpts) {
  var lastComplete = ajaxOpts.complete
  ajaxQueue.queue(function(next) {
    ajaxOpts.complete = function() {
      if (lastComplete) {
        lastComplete.apply(this, arguments)
      }
      next()
    }
    $.ajax(ajaxOpts)
  })
}

$.ajax("/Services/Activity.svc/GetLessonsByInstanceId"+"?_dc="+new Date().getTime(),{
  data: JSON.stringify({instanceId:instanceId}),
  contentType: 'application/json',
  type: 'POST' })
.done(function(lessons) {
  $('<h1>').text($('#ClassName').text()).appendTo('#notex .body')
  $('<h2>').text($('#ClassCodeText').text()).appendTo('#notex .body')
  var options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'}
  $.each(lessons.d.Instances, function() {
    var date = new Date(this.st).toLocaleDateString('en-AU',options)
    var lesson = $('<div>').appendTo('#notex .body')
    $('<h4>').addClass('date').text(date).appendTo(lesson)
    $('<div>').addClass('meta').html(this.lp.mp).appendTo(lesson)
    $.ajaxQueue({
      url: `/Services/FileAssets.svc/DownloadFile?sessionstate=readonly&id=${this.lp.fileAssetId}&nodeId=${this.lp.wnid}`,
      type: "GET",
      success: function(plan) {
        $('<div>').html(plan).appendTo(lesson)
      }
    })
  })
})

})