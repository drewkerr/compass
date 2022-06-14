$(document).ready(function() {

if ($("#clipboard").length) {
  $("#clipboard").remove()
}

$(`<div id="clipboard">
</div>`).appendTo("#c_main")
  
$('<input type="button" style="padding: 5px" value="Copy">').click(function() {
  let values = Array.from(document.querySelectorAll('select')).map(select => select.value)
  navigator.clipboard.writeText('['+values+']')
}).appendTo('#clipboard')

$('<input type="text" style="font-size: x-small" placeholder="Paste here">').on('input', function() {
  let values = JSON.parse($(this).val())
  document.querySelectorAll('select').forEach((select, index) => {
    select.value = values[index]
    select.dispatchEvent(new Event('change'))
  })
  $(this).val('').attr('placeholder', 'Done!')
}).appendTo('#clipboard')

})