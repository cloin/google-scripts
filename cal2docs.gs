function createDocForEvents() {
  
  function getEvents() {
    var today = new Date();
  
    // get events occurring today
    var todayEvents = CalendarApp.getDefaultCalendar().getEventsForDay(today);
    var events = [];
 
    // add today's events to array
    for (var i=0; i<todayEvents.length; i++) {
      eventTitle = todayEvents[i].getTitle();
   
      events.push(eventTitle);
   }   
   getFiles(events);
  }
    
  
  function getFiles(events) {
    var folderId = todayFolder.getId();
     
    // get a list of files in specific folder (where calendar event docs are created)
    var searchResults = DriveApp.searchFiles("'" + folderId + "'" + " in parents");
          
    var files = [];
  
    // loop over each file in this folder
    while (searchResults.hasNext()) {
      var f = searchResults.next();
      var fileName = f.getName();
      // add each filename to the files array
      files.push(fileName);
   }
  checkAndCreate(events, files);
  }
   
  
  function checkAndCreate(events, files) {

    for (var i=0; i<events.length; i++) {
    a = files.indexOf(events[i]);
    // check if doc already exists.
    if (a != -1) {
        
    // if the event title doesn't have a matching doc created already
    } else if (a = -1) {
        
      var doc = DriveApp.getFileById(docId);       
      newFile = meetingTemplate.makeCopy(events[i], todayFolder);
    }
  }
  }
  
   getEnv();
   getEvents();
  
}


// Cleanup the Today folder
// past events should be moved to archive folder
// past events that were never modified after created should be removed
function cleanupDocs() {
  
  getEnv();
  
  // Search for files in Today folder
  var folderId = todayFolder.getId();
  var searchResults = DriveApp.searchFiles("'" + folderId + "'" + " in parents");
  var files = [];
 
  // build array of files in Today folder
  while (searchResults.hasNext()) {
    var f = searchResults.next();
    var fId = f.getId();
  
    files.push(fId);
  }
    
  // Loop over files in files array
  for (var i=0; i < files.length; i++) {
    var f = DriveApp.getFileById(files[i]);
    
    var today = Utilities.formatDate(new Date(), "GMT-5", "yyyy-MM-dd");

    var cdate = f.getDateCreated();
    var mdate = f.getLastUpdated(); 
    
    var createdDate = Utilities.formatDate(new Date(cdate), "GMT-5", "yyyy-MM-dd'T'HH:mm'Z'");
    Logger.log("created date: " + createdDate);
    var createdDay = Utilities.formatDate(new Date(cdate), "GMT-5", "yyyy-MM-dd");
    Logger.log("created day: " + createdDay);


    var modifiedDate = Utilities.formatDate(new Date(mdate), "GMT-5", "yyyy-MM-dd'T'HH:mm'Z'");
    
    
      Logger.log("created day1: " + createdDay);

    // If the file wasn't created today and modified at least a minute after it was created, archive it
    if (createdDay == today) {
      // Do nothing
      
       Logger.log("created day2: " + createdDay);
      Logger.log("today: " + today);
    } else if (createdDate < modifiedDate) {
      
      // If file was created before today add it to the archive folder
      archive.addFile(f);
      
      // and remove it from today's folder
      todayFolder.removeFile(f);
    
    // If the file created and modified dates are the same, remove the file
    } else if (createdDate = modifiedDate) {   
      todayFolder.removeFile(f);      
    }
  }
}





//  ========================
//  ========================
//  ========================



  
// Set global vars for contants
function getEnv() {
  docId = DocumentApp.getActiveDocument().getId();
  file = DriveApp.getFileById(docId);
  var folders = file.getParents();
  
  while (folders.hasNext()) {
    folder = folders.next();
  }
  
  var folders = folder.getFoldersByName("Archive");
  while (folders.hasNext()) {
    archive = folders.next();
  }
  
  var folders = folder.getFoldersByName("Today");
  while (folders.hasNext()) {
    todayFolder = folders.next();
  }
  
  var files = folder.getFilesByName("meetingTemplate");
  while (files.hasNext()) {
    meetingTemplate = files.next();
  }
  meetingTemplateId = meetingTemplate.getId();
}


// Build a menu to run the setup script from the opened doc
function onOpen() {
  var ui = DocumentApp.getUi();
  ui.createMenu('Script menu')
      .addItem('Setup', 'setup')
      .addItem('Create Events First Time', 'createDocForEvents')
      .addToUi();
}


// Create folders for today's events and past events
// Create triggers to run the event creation funtion and cleanup funtion
function setup() {
  var docId = DocumentApp.getActiveDocument().getId();
  var file = DriveApp.getFileById(docId);
  var folders = file.getParents();
  
  // var folder is the folder that contains the script
  while (folders.hasNext()) {
    var folder = folders.next();
  }  
  
  var folderId = folder.getId();
  
  // check if archive folder created - create if not
  try {
    var archive = folder.getFoldersByName("Archive").next();
  }
  catch(e) {
    var archive = folder.createFolder("Archive").getId();
  }
 
  // check if today folder create - create if not
  try {
    var todayFolder = folder.getFoldersByName("Today").next();
  }
  catch(e) {
    var todayFolder = folder.createFolder("Today").getId();
  }
  
  // check if template file create - create if not
  try {
    var template = DriveApp.getFilesByName("meetingTemplate").next();
  }
  catch(e) {
    var template = DocumentApp.create("meetingTemplate");
    var templateFile = DriveApp.getFileById(template.getId());
    DriveApp.getFolderById(folderId).addFile(templateFile);
    DriveApp.getRootFolder().removeFile(templateFile)
  }

  // Deletes all triggers in the current project.
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
  
  // Creates triggers for creating and cleaning up docs
  // Runs at 1am in the timezone of the script
  ScriptApp.newTrigger("cleanupDocs")
    .timeBased()
    .atHour(1)
    .everyDays(1) // Frequency is required if you are using atHour() or nearMinute()
    .create();

  // Runs every 10m
  ScriptApp.newTrigger("createDocForEvents")
    .timeBased()
    .everyMinutes(10)
    .create();
    
}



  