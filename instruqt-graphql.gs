function getData() {
  var myHeaders = {
    "Authorization": "Bearer YOURTOKEN",
    "Content-Type": "application/json"
  };

  var graphql = JSON.stringify({
    query: "query trackStatistics {\n  tracks(organizationSlug: \"ORGANIZATION_SLUG\", orderBy: last_update_DESC) {\n    statistics (filterDevelopers: true) {\n      track {\n        slug\n        maintenance\n      }\n      started_total\n      completed_total\n      average_review_score\n    }\n    tags\n    developers{\n      profile{\n        display_name\n        email\n      }\n    }\n  }\n}",
  variables: {}
});

  var requestOptions = {
    'method': 'POST',
    'headers': myHeaders,
    'payload': graphql,
  };

  var orgTracks = JSON.parse(UrlFetchApp.fetch("https://play.instruqt.com/graphql", requestOptions));
  formatData(orgTracks);
}

function formatData(orgTracks) {
  var sheet = SpreadsheetApp.getActiveSheet();
  var tracks = orgTracks.data.tracks;

  // Loop over all tracks
  for (var i=0; i<tracks.length; i++) {
    trackSlug = tracks[i].statistics.track.slug;
    trackSlugRich = SpreadsheetApp.newRichTextValue()
      .setText(trackSlug)
      .setLinkUrl("https://play.instruqt.com/ORGANIZATION_SLUG/tracks/" + trackSlug)
      .build();
    trackMaintenance = tracks[i].statistics.track.maintenance;
    trackStarts = tracks[i].statistics.started_total;
    trackCompletes = tracks[i].statistics.completed_total;
    trackScore = tracks[i].statistics.average_review_score;
    trackDevsList = tracks[i].developers
    trackTagsList = tracks[i].tags;
    var trackDevs = "";
    var trackTags = "";

    // Loop over track developers
    for (var dev=0; dev<trackDevsList.length; dev++){
      var trackDevs = trackDevs + trackDevsList[dev].profile.display_name + ", ";
    }

    // Loop over track tags
    for (var tag=0; tag < trackTagsList.length; tag++) {
      var trackTags = trackTags + trackTagsList[tag] + ", ";
    }

    // Write track vars to sheet
    Logger.log("Writing... " + trackSlug);
    sheet.getRange(i + 2, 1).setRichTextValue(trackSlugRich);
    sheet.getRange(i + 2, 2).setValue(trackMaintenance);
    sheet.getRange(i + 2, 3).setValue(trackStarts);
    sheet.getRange(i + 2, 4).setValue(trackCompletes);
    sheet.getRange(i + 2, 5).setValue(trackScore);
    sheet.getRange(i + 2, 6).setValue(trackDevs);
    sheet.getRange(i + 2, 7).setValue(trackTags);
    SpreadsheetApp.flush();
  }
}

    // Sample query
    //
    // query trackStatistics {
    //   tracks(organizationSlug: "ORGANIZATION_SLUG", orderBy: last_update_DESC) {
    //     statistics (filterDevelopers: true) {
    //       track {
    //         slug
    //         maintenance
    //       }
    //       started_total
    //       completed_total
    //       average_review_score
    //     }
    //     tags
    //     developers{
    //       profile{
    //         display_name
    //         email
    //       }
    //     }
    //   }
    // }

    // Sample return
    //
    // {
    //   "data": {
    //     "tracks": [
    //       {
    //         "statistics": {
    //           "track": {
    //             "slug": "writing-first-playbook",
    //             "maintenance": false
    //           },
    //           "started_total": 2,
    //           "completed_total": 0,
    //           "average_review_score": null
    //         },
    //         "tags": [
    //           "ansible",
    //           "infrastructure",
    //           "gettingstarted"
    //         ],
    //         "developers": [
    //           {
    //             "profile": {
    //               "display_name": "Roland Wolters",
    //               "email": "rwolters@example.com"
    //             }
    //           },
    //           {
    //             "profile": {
    //               "display_name": "Adé Mochtar",
    //               "email": "ade@example.com"
    //             }
    //           },
    //           {
    //             "profile": {
    //               "display_name": "Monish Shah",
    //               "email": "moshah@example.com"
    //             }
    //           }
    //         ]
    //       },
