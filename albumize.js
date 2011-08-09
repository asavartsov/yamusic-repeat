/**
 * albumize.js
 * Script running in the real page context
 * Copyright (c) 2011 Alexey Savartsov <asavartsov@gmail.com>
 * Licensed under the MIT license
 */

var MY_ALBUMS_URL = /\#\!\/artist\/[0-9]+\/tracks\/albums/
var ARTIST_URL = /\#\!\/artist\/[0-9]+/

var _interval_id; ///< ИД интервала альбумизации

/**
 * Запускает альбумизацию (ха-ха, чё за слово) по интервалу
 */
function try_albumize() {
    $("#js-content").removeClass("albumized");
    _interval_id = setInterval(albumize, 100);
}

/**
 * Убирает интервал альбумизации и ставит маркер проальбумизированности
 */
function stop_trying() {
    $("#js-content").addClass("albumized");
    clearInterval(_interval_id);
}

/**
 * Делает левый или правый блок с контролами альбома
 *
 * @param artist Исполнитель
 * @param album Хэш {:title => "Ссылка на заголовок альбома", :subtitle => "Описалово альбома"}
 * @param cover Cover URL (75x75)
 * @param onclick Original onclick callback
 * @param side Строка 'left' или 'right'
 *
 * @return jQuery-объект с плашкой по параметрам
 */
function make_album(artist, album, cover, onclick, side) {
    var album_block = $("<div></div>");
    var cover_block = $("<div></div>");

    // Нет альбома, нет артиста
    artist = album ? artist : "";

    // Нет альбома - пустой тайтл
    var title = album ? album.title.text() : "";

    // Чтобы не было undefined в плашке
    if(album && album.subtitle.length > 0) {
        var subtitle = $(album.subtitle).text();
    }
    else {
        var subtitle = "";
    }

    // Ссылка тоже не нужна, если дали null вместо альбома
    var link = album ? album.title.attr("href") : "";

    // Ну, понятно, в общем
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

    // Кнопки в плашке
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

    // Клёвые полупрозрачные хрени
    var fade_type_right = $("<div></div>")
        .addClass("b-albums__fade")
        .addClass("b-albums__fade_type_right");

    var fade_type_bottom = $("<div></div>")
        .addClass("b-albums__fade")
        .addClass("b-albums__fade_type_bottom");

    // Самый ад — тут собирается плашка альбома
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

/**
 * Шарится по страницам с нужными урлами и либо перехерачивает
 * страничку .../tracks/albums, делая плашки альбомов, либо заменяет
 * урл в ссылках "Все ХХ альбомов" на .../tracks/albums
 */
function albumize() {
    if($("#js-content").hasClass("albumized")) {
        stop_trying();
        return;
    }

    // Страничка с дорожками всех альбомов - перехачить её срочно!
    if(location.hash.match(MY_ALBUMS_URL)) {
        // Спрятать лабудень
        $("#js-content .b-track, .b-subtitle, .b-album-disc, .b-group-switch, .l-album, .l-mix").hide();

        // Исполнитель
        var artist = $("#js-content .b-title__title").text();
        
        // Фигачим поля
        
        // Заголовки альбома
        var titles = $(".b-subtitle__title a").map(function(i, e) { 
                return {
                    "title": $(e),
                    "subtitle": $(e).parent().next(".b-subtitle__info")
                };
        });

        if(titles.length > 0) {
            // Если что-то наскребли - похерить таймер
            stop_trying();
        }

        // Обложки
        var covers = $(".b-album-cover__img").map(function(i, e) { return $(e).attr("src").replace("m150x150", "m75x75"); });
        
        // Колбэки
        var onclicks = $(".b-album-control").map(function(i, e) { return e.getAttribute('onclick'); });

        // Контейнер для плашек
        $("#js-content").append($("<div></div>").addClass("js-albums-list"));

        // По два в ряд
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
                    // Если плашек получается нечетное количество, надо пустую плашку захуярить в конец
                    // чтобы предыдущую не распидорасило на весь враппер
                )
            );
        }
    }
    else if(location.hash.match(ARTIST_URL)) {
        // Страница исполнителя - надо испортить ссылки
        stop_trying();

        $.each($(".b-arrow-link_type_album a"), function(i, e) {
            $(e).attr("href", e + "/albums");
        });
    }
    else {
        // Левый урл, делать нечего
        if(location.hash) 
            stop_trying();
    }
}

// Ну, это понятно
window.addEventListener("hashchange", try_albumize, false);

// А это, чтобы магия сработала, если какой-нибудб умник перейдет по адресу
// .../tracks/albums в новом окне, например
window.addEventListener("load", try_albumize, false);
