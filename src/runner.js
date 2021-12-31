const { Import } = require('./index');

// This is just the script that will await the index.js script to start and check for errors
(async()=>{
  try {
    await Import.start();
  } catch (e) {
    console.error(e, e.stackTrace);
  }
})();
