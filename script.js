function check() {
  if (/(MSIE|Trident\/|Edge\/)/i.test(navigator.userAgent)) {
    alert("Internet Explorer and Edge not supported. Try Chrome or Firefox.");
  }
}