/**
 * Functions to handle lyrics.
 * @author Sven Recknagel (svenrecknagel@googlemail.com)
 * Licensed under the BSD license
 */
function buildSearchUrl(song) {
  var artist = "";
  var title = "";
  var search = "";
  if (song.artist) {
    artist = encodeURIComponent(song.artist).replace(/%20/g, "+");
    search = artist;
  }
  if (song.title) {
    title = song.title;
    if (title.indexOf("(") > 0) {//remove remix/version info
      title = title.replace(/\(.*\)/, "").trim();
    }
    title = encodeURIComponent(title).replace(/%20/g, "+");
    search = (search ? search + "+" : "") + title;
  }
  var url = null;
  if (search) {
    url = "http://www.songlyrics.com/index.php?section=search&searchW=" + search + "&submit=Search";
    if (artist) url += "&searchIn1=artist";
    if (title) url += "&searchIn3=song";
  }
  return url;
}

function fetchLyrics(song, callback) {
  var url = buildSearchUrl(song);
  if (url) {
    $.get(url)
      .done(function(data) {
        var href = $(data).find(".serpresult > a").attr("href");
        if (href) {
          $.get(href)
            .done(function(data) {
              var page = $(data);
              var lyrics = page.find("#songLyricsDiv");
              if (lyrics.text().trim().indexOf("We do not have the lyrics for") == 0) callback({noresults: true, src: href, searchSrc: url})
              else {
                var credits = page.find(".albuminfo > li > p");
                if (credits.length == 0) credits = null;
                callback({title: page.find(".pagetitle h1"), lyrics: lyrics, credits: credits, src: href, searchSrc: url});
              }
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
              console.error(textStatus, errorThrown);
              callback({error: true, src: href, searchSrc: url});
            });
        } else {
          callback({noresults: true, searchSrc: url});
        }
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        console.error(textStatus, errorThrown);
        callback({error: true, searchSrc: url});
      });
  } else {
    callback({error: true});
  }
}