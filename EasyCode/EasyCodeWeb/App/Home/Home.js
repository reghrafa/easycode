﻿/// <reference path="../App.js" />

(function (ko) {
    "use strict";

    var ViewModel = function () {
        var self = this;

        var currentRepository, currentSha;

        self.level = ko.observable(1);
        self.currentRepository = ko.observable("");
        self.currentFile = ko.observable("");

        self.isReposLoading = ko.observable(false);
        self.isFilesLoading = ko.observable(false);

        self.repositories = ko.observableArray([]);
        self.files = ko.observableArray([]);
        self.file = ko.observable("");

        // Loads the list of repositories
        self.loadRepositories = function () {
            var owner = "aspnet";
            self.isReposLoading(true);

            $.ajax({
                url: "https://api.github.com/orgs/" + owner + "/repos",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "Basic S2FpQnJ1bW11bmQ6OGYyMGNiNmE1NzM3ZjBlYmE0YzMxOTVlODRiNWZhMWZlNmMyYjc0NA==");
                }
            }).then(function (data) {
                self.repositories(data);
                self.level(2);
            }).always(function () {
                self.isReposLoading(false);
            });
        }

        // Loads the files in a repository
        self.loadFiles = function (repository) {
            if (!repository) { return; };
            currentRepository = repository.full_name;

            self.isFilesLoading(true);

            $.ajax({
                url: "https://api.github.com/repos/" + currentRepository + "/branches",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "Basic S2FpQnJ1bW11bmQ6OGYyMGNiNmE1NzM3ZjBlYmE0YzMxOTVlODRiNWZhMWZlNmMyYjc0NA==");
                }
            }).then(function (dataB) {
                var masterSha;
                $.each(dataB, function (i, obj) { if (obj.name == "master") masterSha = obj.commit.sha; });

                if (masterSha) {
                    return $.ajax({
                        url: "https://api.github.com/repos/" + currentRepository + "/git/trees/" + masterSha,
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader("Authorization", "Basic S2FpQnJ1bW11bmQ6OGYyMGNiNmE1NzM3ZjBlYmE0YzMxOTVlODRiNWZhMWZlNmMyYjc0NA==");
                        }
                    }).then(function (data) {
                        currentSha = masterSha;
                        self.files(data.tree);
                        self.level(3);
                    });
                }
            }).always(function (data) {
                self.isFilesLoading(false);
            });
        }

        // Loads the specific file tree item (either blob or tree)
        self.loadTree = function (node) {
            $.ajax({
                url: node.url,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "Basic S2FpQnJ1bW11bmQ6OGYyMGNiNmE1NzM3ZjBlYmE0YzMxOTVlODRiNWZhMWZlNmMyYjc0NA==");
                }
            })
            .then(function (result) {
                if (node.type == "tree") self.files(result.tree);
                if (node.type == "blob") {
                    var x = result.content.split("\n");
                    var y = Array();
                    $.each(x, function (i, obj) { y[i] = base64_decode(obj); });

                    self.file(y.join("\n"));
                    self.level(4);
                    $('.prettyprinted').removeClass('prettyprinted');
                    prettyPrint();
                }
            });
        };

        self.goBack = function () {
            if (self.level() > 1) self.level(self.level() - 1);
        }
    }

    // Die Initialisierungsfunktion muss bei jedem Laden einer neuen Seite ausgeführt werden.
    Office.initialize = function (reason) {
        $(document).ready(function () {
            app.initialize();

            //$('#get-data-from-selection').click(getDataFromSelection);

            ko.applyBindings(new ViewModel());
        });
    };

    // BASE64 DECODE
    function base64_decode(data) {
        //  discuss at: http://phpjs.org/functions/base64_decode/
        // original by: Tyler Akins (http://rumkin.com)
        // improved by: Thunder.m
        // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        //    input by: Aman Gupta
        //    input by: Brett Zamir (http://brett-zamir.me)
        // bugfixed by: Onno Marsman
        // bugfixed by: Pellentesque Malesuada
        // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        //   example 1: base64_decode('S2V2aW4gdmFuIFpvbm5ldmVsZA==');
        //   returns 1: 'Kevin van Zonneveld'
        //   example 2: base64_decode('YQ===');
        //   returns 2: 'a'

        var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
          ac = 0,
          dec = '',
          tmp_arr = [];

        if (!data) {
            return data;
        }

        data += '';

        do { // unpack four hexets into three octets using index points in b64
            h1 = b64.indexOf(data.charAt(i++));
            h2 = b64.indexOf(data.charAt(i++));
            h3 = b64.indexOf(data.charAt(i++));
            h4 = b64.indexOf(data.charAt(i++));

            bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

            o1 = bits >> 16 & 0xff;
            o2 = bits >> 8 & 0xff;
            o3 = bits & 0xff;

            if (h3 == 64) {
                tmp_arr[ac++] = String.fromCharCode(o1);
            } else if (h4 == 64) {
                tmp_arr[ac++] = String.fromCharCode(o1, o2);
            } else {
                tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
            }
        } while (i < data.length);

        dec = tmp_arr.join('');

        return dec.replace(/\0+$/, '');
    }

})(ko);