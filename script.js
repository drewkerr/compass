function check() {
  if (/(MSIE|Trident\/|Edge\/)/i.test(navigator.userAgent)) {
    alert("Internet Explorer and Edge not supported. Try Chrome or Firefox.")
  }
}

document.addEventListener('DOMContentLoaded', event => { 
  var buttons = document.querySelectorAll('.button')
  Array.from(buttons).forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault()
      alert("Drag the button to your Bookmarks Bar to use in Compass.")
    })
  })
})