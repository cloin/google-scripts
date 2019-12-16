// Create retire/expiration of emails of specific label
// after specified days, threads of that label are trashed

// Make a spreadsheet with column for label and column for days before deletion and header row

function deleteMessages() {
  getRules();
}

function getRules() {
  var rows = SpreadsheetApp.getActiveSpreadsheet().getDataRange().getValues(); 
  for (var i=1; i<rows.length; i++) {
    var search = rows[i][0];
    var age = rows[i][1];
    cleanUp2(search, age);
  }
}

function cleanUp2(search, age) {
  var daysOld = age
  var label = GmailApp.getUserLabelByName(search);
  Logger.log('Running on: ' + search);
  
  var threads = GmailApp.search(search +' older_than:' + daysOld + 'd');
  Logger.log('Evaluating search: ' + search +' older_than:' + daysOld + 'd');
  for (var i = 0; i < threads.length; i++) {
    Logger.log(" --deleting " + threads[i].getFirstMessageSubject());
    GmailApp.moveThreadToTrash(threads[i]);
  }
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Script menu')
      .addItem('Start deletion', 'menuItemRun')
      .addToUi();
}

function menuItemRun() {
  SpreadsheetApp.getUi()
     getRules();
}

