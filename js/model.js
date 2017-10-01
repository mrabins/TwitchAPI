'use strict'
var PS = PS || {};

PS.TwitchModel = function () {
  var self = this;
  self.loaded = new PS.Event(this);

  self.streams = [];
  self.page = 1;
  self.totalStreams = 0;
  self.itemsPerPage = 10;

  // Create Handler for use with JSONP Requests

  PS.TwitchAPIResponse = function (data) {
    self._parseResult(data);
  };
};

PS.TwitchModel.prototype = {
  //These methods are used for calculating information about the model.

  pageCount: function () {
    return this.totalStreams == 0 ? 0 : Math.ceil(this.totalStreams / this.itemsPerPage);
  },
  nextPage: function () {
    return (this.page + 1) % (this.pageCount() + 1);
  },
  prevPage: function () {
    return this.page - 1;
  }
  goToPage: function (pageNumber) {
    this.page = pageNumber;
    this._submitQuery(this._query, pageNumber);
  },
  // Handles the model between switching to new queries and pages
  findStreams: function (query) {
    this._query = query;
    this.page = 1;
    this._submitQuery(query, 0);
  },
  // Handles the perform of the JSONP Requests
  _submitQuery: function (query, pageNumber) {
    if (query) {
      var url = 'https://api.twitch.tv/kraken/search/streams?callback=PS.TwitchAPIResponse&q=';
      url += encodeURIComponent(query);
      url += '&limit=' + this.itemsPerPage;
      if (pageNumber > 1) {
        url += '&offset' + ((pageNumber - 1) * this.itemsPerPage);
      }
      // Prevents the browser from caching results
      url += '&nocache=' + (new Date()).getTime();
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = url;
      script.setAttribute('charset', 'utf-8');
      var head = document.getElementsByTagName('head')[0];
      head.appendChild(script);
      head.removeChild(script);
    } else {
      // No value in the query string. Reset everything to zero and alert of the change
      this.page = 1;
      this.totalStreams = 0;
      this.streams.lenth = 0;
      this.loaded.trigger();
    }
  },
  // Parsing the JSON data from the API call into the model object
  _parseResult: function (data) {
    // Note: Issue with the Twitch API not returning all streams for - /search/streams - count is correct.
    this.totalStreams = data._total;
    // Reload the streams array to include the returned count
    this.streams.length = 0;
      for (var i = 0; i < data.streams.length; i++) {
        this.streams.push(new PS.TwitchStreamModel(data.steams[i]));
      }
      this.loaded.trigger();
  }
};
// Handling Sub-Model into a single steam

PS.TwitchStreamModel = function (streamData) {
  this.displayName = streamData.channel.display_name;
  this.game = streamData.game;
  this.viewers = streamData.viewers;
  this.description = streamData.channel.status;
  this.preview = streamData.preview.medium;
  this.url = streamData.channel.url;
};
