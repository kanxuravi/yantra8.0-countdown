window.onload=function() {
    // Month,Day,Year,Hour,Minute,Second
    upTime('sep,17,2019,00:00:00');
  }
  function upTime(countTo) {
    now = new Date();
    countTo = new Date(countTo);
    difference = -(now-countTo);
    milliseconds=Math.floor(difference*1);
    document.getElementById('milliseconds').firstChild.nodeValue = milliseconds.toLocaleString();
    clearTimeout(upTime.to);
    upTime.to=setTimeout(function(){ upTime(countTo); },1);
  }
  
  