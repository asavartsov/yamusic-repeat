/**
 * repeat.js
 * Script running in the real page context
 * Copyright (c) 2011 Alexey Savartsov <asavartsov@gmail.com>
 * Licensed under the MIT license
 */

var MY_ALBUMS_URL = /\#\!\/artist\/[0-9]+\/tracks\/albums/
var ARTIST_URL = /\#\!\/artist\/[0-9]+/

var _interval_id;

function stop_trying() {
    $("#js-content").addClass("albumized");
    clearInterval(_interval_id);
}

function try_albumize() {
    _interval_id = setInterval(albumize, 100);
}

/**
 *
 * @param side String: 'left' or 'right'
 */
function make_album(artist, album, cover, onclick, side) {
    var album_block = $("<div></div>");
    var cover_block = $("<div></div>");

    artist = album ? artist : "";

    var title = album ? album.title.text() : "";

    if(album && album.subtitle.length > 0) {
        var subtitle = $(album.subtitle).text();
    }
    else {
        var subtitle = "";
    }

    var link = album ? album.title.attr("href") : "";

    if(cover) {
        cover_block.addClass("b-albums__cover");
        cover_block.append(
            $("<a></a>")
                .attr("href", link)
                .append(
                    $("<img />")
                    .attr("src", cover)
                    .addClass("b-albums__cover__img")
                )
        );
    }

    if(onclick) {
        var play_button = $("<div></div>")
            .addClass("b-albums__play")
            .addClass("js-play-album")
            .attr ("title", "играть альбом");

        play_button[0].setAttribute("onclick", onclick);

        var add_button = $("<div></div>")
            .addClass("b-albums__add")
            .addClass("js-add-album")
            .attr ("title", "добавить в плейлист");

        add_button[0].setAttribute("onclick", onclick);
    }

    var fade_type_right = $("<div></div>")
        .addClass("b-albums__fade")
        .addClass("b-albums__fade_type_right");

    var fade_type_bottom = $("<div></div>")
        .addClass("b-albums__fade")
        .addClass("b-albums__fade_type_bottom");

    album_block.addClass("l-half__" + side)
        .attr("title", title)
        .append($("<div></div>")
            .addClass("b-albums")
            .append(cover_block)
            .append(fade_type_right)
            .append(fade_type_bottom)
            .append(play_button)
            .append(add_button)
            .append(
                $("<div></div>")
                .addClass("b-albums__text")
                .append(
                    $("<div></div>")
                    .addClass("b-albums__artist")
                    .text(artist)
                    .append(
                        $("<span></span>")
                        .addClass("b-albums__year")
                        .html("<br>" + subtitle)
                    )
                )
                .append(
                    $("<div></div>")
                    .addClass("b-albums__title")
                    .append(
                        $("<a></a>")
                        .addClass("b-link")
                        .addClass("b-link_class_albums-title-link")
                        .attr("href", link)
                        .text(title)
                    )
                )
            )
        );

    return album_block;
}

function albumize() {
    if($("#js-content").hasClass("albumized")) {
        stop_trying();
        return;
    }

    if(location.hash.match(MY_ALBUMS_URL)) {
        $("#js-content .b-track, .b-subtitle, .b-album-disc, .b-group-switch, .l-album, .l-mix").hide();

        var artist = $("#js-content .b-title__title").text();
        var titles = $(".b-subtitle__title a").map(function(i, e) { 
                return {
                    "title": $(e),
                    "subtitle": $(e).parent().next(".b-subtitle__info")
                };
        });

        if(titles.length > 0) {
            stop_trying();
        }

        var covers = $(".b-album-cover__img").map(function(i, e) { return $(e).attr("src").replace("m150x150", "m75x75"); });
        var onclicks = $(".b-album-control").map(function(i, e) { return e.getAttribute('onclick'); });

        $("#js-content").append($("<div></div>").addClass("js-albums-list"));

        for(i = 0; i < Math.ceil(titles.length / 2); i++) {
            $("#js-content .js-albums-list").append(
                $("<div></div>")
                .addClass("l-half")
                .append(
                    $("<div></div>")
                    .addClass("l-half__row")
                    .append(make_album(artist, titles[i*2], covers[i*2], onclicks[i*2], "left"))
                    .append(
                        $("<div></div>")
                        .addClass("l-half__gap")
                    )
                    .append(make_album(artist, titles[i*2+1], covers[i*2+1], onclicks[i*2+1], "right"))
                )
            );
        }
    }
    else if(location.hash.match(ARTIST_URL)) {
        stop_trying();

        $.each($(".b-arrow-link_type_album a"), function(i, e) {
            $(e).attr("href", e + "/albums");
        });
    }

}

window.addEventListener("hashchange", try_albumize, false);
