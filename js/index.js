(function () {

  var model = new PS.TwitchModel();
  var view = new PS.TwitchView(model);
  var controller = new PS.TwitchController(model, view);
  view.show();

  var firstInput = document.querySelector('input');
  if (firstInput && firstInput.focus) first.focus();  
})();
