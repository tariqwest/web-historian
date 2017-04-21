$('form').on('submit', function() {
  $.ajax({
    url: 'http://127.0.0.1:8080',
    data: $(this).serialize(),
    method: 'POST',
    success: function(data) {
      console.log('Successful request');
      document.open();
      document.write(data);
      document.close();
    },
    error: function(data) {
      console.log(data);
    }
  });
});

if($('#polling-url').data('polling-data')){
  var url = $('#polling-url').data('polling-data');
  $.ajax({
    url: url,
    //data: $(this).serialize(),
    method: 'GET',
    success: function(data) {
      console.log('Successful request');
      document.open();
      document.write(data);
      document.close();
    },
    error: function(data) {
      console.log(data);
    }
  });

}