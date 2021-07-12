
// 时间戳转可读时间
function stamp2Read(t) {
  var date = new Date(parseInt(t));
  var Y = date.getFullYear() + '-';
  var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  var D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
  var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
  var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
  var s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());

  let strDate = Y + M + D + h + m + s;
  return strDate;
}

// 可读时间转时间戳
// 形式必须是 yyyy-mm-dd hh:mm:ss
function read2Stamp(t) {
  let date = new Date(t);
  return date.getTime();
}

export default { 
  stamp2Read,
  read2Stamp
}