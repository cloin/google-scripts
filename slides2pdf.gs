// this is used to export google slides of ansible workshops to pdfs for external partner access
// pdfs are created in a specific folder
// the folder contents are purged every day as this script runs nightly

// configuration for this script is sourced from the google sheet the script is attached to

// This project takes the file ID from the spreadsheet and creates a pdf of it
// This also adds a button the spreadsheet to run the script manually


function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Slides2PDF')
      .addItem('Convert slides', 'workshopSlidesToPdf')
      .addToUi();
}


function workshopSlidesToPdf() {
  spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  cleanUpFolder();
  getConfig();
}


function cleanUpFolder() {
  var rows = spreadsheet.getSheetByName("Folder").getDataRange().getValues();
  var folderId = rows[1][1];
  folder = DriveApp.getFolderById(folderId);
  var files = folder.getFiles();
  while (files.hasNext()) {
    var fileId = files.next().getId();
    var file = DriveApp.getFileById(fileId);
    folder.removeFile(file);
  }
}


function getConfig() {
  
  var rows = spreadsheet.getSheetByName("Files").getDataRange().getValues(); 
  var files = [];
  
  for (var i=1; i<rows.length; i++) {
    var fileId = rows[i][1];
    files.push(fileId);
  }
  makePdfs(files);
}


function makePdfs(files) {
  
  var attachments = [];
  
  for (var i=0; i<files.length; i++) {
    var file = DriveApp.getFileById(files[i]);
    var blob = file.getBlob();
    var pdf = folder.createFile(blob);
  }
}
