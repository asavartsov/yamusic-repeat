/**
 * repeat.js
 * Script running in the real page context
 * Copyright (c) 2011 Alexey Savartsov <asavartsov@gmail.com>
 * Licensed under the MIT license
 */

// Playlist functions

/**
 * Sets repeat mode for playlist
 * 
 * @param repeat_mode 0 - no repeat, 1 - repeat playlist, 2 - repeat song
 */
Mu.Playlist.prototype.setRepeatMode = function (repeat_mode) {
    this.repeat_mode = repeat_mode;
};

/**
 * Replacement for Playlist.getNext with repeat support
 * 
 * @param index Current index
 * @returns The next song
 */
Mu.Playlist.prototype.getNext = function(index) {
    var reindex = this.tracks.getViceIndex(index);
    
    switch (this.repeat_mode) {
        case 2:
            break;
        case 1:
            reindex = (reindex + 1) % this.getLength();
            break;
        default:
            reindex = reindex + 1;
    }
    
    reindex = this.tracks.getVersaIndex(reindex);
    return this.getByIndex(reindex);
};

/**
 * Replacement for Playlist.getPrev with repeat support
 * 
 * @param index Current index
 * @returns The prev song
 */
Mu.Playlist.prototype.getPrev = function (index) {
    var reindex = this.tracks.getViceIndex(index);
    
    switch (this.repeat_mode) {
        case 2:
            break;
        case 1:
            reindex = reindex || this.getLength();
        default:
            reindex = reindex - 1;
    }
    
    reindex = this.tracks.getVersaIndex(reindex);
    return this.getByIndex(reindex);        
};

// Songbird functions

/**
 * Sets repeat mode for songbird and the current playlist
 * 
 * @param repeat_mode 0 - no repeat, 1 - repeat playlist, 2 - repeat song
 */
Mu.Classes.Songbird.prototype.setRepeatMode = function(repeat_mode) {
    this.repeat_mode = repeat_mode;
    
    var current_track = this.player.getCurrentTrack();
    
    if(current_track) {
        var playlist = this.playlists[current_track.kind];
        playlist.setRepeatMode(this.repeat_mode);
    }
};

/**
 * Cycles the repeat mode (none -> playlist -> song -> none)
 */
Mu.Classes.Songbird.prototype.nextRepeatMode = function() {
    this.setRepeatMode(((this.repeat_mode || 0) + 1) % 3);
};

/**
 * Original Songbird.play
 */
Mu.Classes.Songbird.prototype._play = Mu.Classes.Songbird.prototype.play;

/**
 * Replacement for Songbird.play with repeat support
 * 
 * @param trackdata What track to play
 * @returns New track playing
 */
Mu.Classes.Songbird.prototype.play = function(trackdata) {
    if(this.repeat_mode) {
        var playlist = this.getPlaylist(trackdata);
        
        if (!playlist.repeat_mode) {
            this.setRepeatMode(this.repeat_mode);
        }
    }
    
    // Call original Songbird.play
    return this._play(trackdata);
};

 
// Repeat button

var repeat_button = $("<div id='repeat_button' />");

repeat_button.click(function() {
    Mu.Songbird.nextRepeatMode();
    $(this).removeClass().addClass("repeat_" + ["none", "all", "one"][Mu.Songbird.repeat_mode]);
});

$(".b-jambox-tools__content").append(repeat_button);
