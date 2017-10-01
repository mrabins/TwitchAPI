'use strict';
var PS = PS || {};

PS.TwitchView = function (model) {
        var self = this;
        // Potential actions by a user
        self.searchStarted = new PS.Event(self);
        self.pagerClicked = new PS.Event(self);

        // Add handlers to the document to delegate events when they occur
        document.addEventListener('click', function (e) {
                self.clickHandler(e);
        });
        document.addEventListener('submit', function (e) {
                self.submitHandler(e);
        });

        self._model = model;
        // Add hanlder to the model's loaded evenet to update the view when the model changes
        self._model.loaded.register(function () {
                self.show();
        });
};
PS.TwitchView.prototype = {
        // Delegation for elements with the class 'pager'. Handles the case where a sub-element of .pager is the actual target
        clickHandler: function (e) {
                var target = this._findParent(e.target, '.pager');
                if (target) {
                        var pageNo = target.classList.contains('next') ? this._model.nextPage() : this._model.prevPage();
                        if (pageNo) {
                                this.pagerClicked.trigger(pageNo);
                        }
                        e.preventDefault();
                }
        },
        // Simple delegation for elements of the type 'form'
        submitHandler: function (e) {
                if (e.target && e.target.tagName == 'FORM') {
                        var query = e.target.querySelectorAll('[name="query"]')[0];
                        if (query) {
                                this.searchStarted.trigger(query.value);
                        }
                        e.preventDefault();
                }
        },
        // Update the document using data from the model
        show: function () {
                var container = document.getElementById('results');
                if (this._model.totalStreams) {
                        container.classList.remove('no-data');

                        var texts = document.querySelectorAll('[data-text]');
                        for (var i = 0; i < texts.length; i++) {
                                var param = texts[i].getAttribute('data-text');
                                texts[i].innerHTML = PS.getValueFromObject(this._model, param);
                        }

                        var disables = document.querySelectorAll('[data-enable]');
                        for (var i = 0; i < disables.length; i++) {
                                var param = disables[i].getAttribute('data-enable');
                                disables[i].disabled = !PS.getValueFromObject(this._model, param);
                        }

                        var repeats = document.querySelectorAll('[data-repeat]');
                        for (var i = 0; i < repeats.length; i++) {
                                var template = document.getElementById(repeats[i].getAttribute('data-template'));
                                var param = repeats[i].getAttribute('data-repeat');
                                var enumerable = PS.getValueFromObject(this._model, param);

                                if (template && enumerable && enumerable.length) {
                                        var combined = '';
                                        for (var j = 0; j < enumerable.length; j++) {
                                                combined += PS.fillTemplate(enumerable[j], template.innerHTML);
                                        }
                                        repeats[i].innerHTML = combined;
                                } else {
                                        repeats[i].innerHTML = '';
                                }
                        }
                } else {
                        // No data from Twitch
                        container.classList.add('no-data');
                }
        },

        _findParent: function (elem, selector) {
                var parents = document.querySelectorAll(selector);
                for (var i = 0; i < parents.length; i++) {
                        if (parents[i].contains(elem)) return parents[i];
                }
                return null;
        }
};
