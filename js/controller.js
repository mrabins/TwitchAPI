'use strict';

var PS = PS || {};

PS.TwitchController = function (model, view) {
     // Simple controller designed to ensure there's flexibility with future development.
view.searchStarted.register(function (sender, query) {
  model.findStreams(query);
});
view.pagerClicked.register(function (sender, pageNumber) {
    model.goToPage(pageNumber);
  });
};
