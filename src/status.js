const { apiClient } = require('./api-client');

(async()=>{
  try {
    // So initially when I check the status of this the api will run...
    console.log('Checking the status endpoint...');
    const response = await apiClient.status();
    if (response.status.toString() === '200') {
      // ... and it shows that the response status is getting a response 200 status so no problems with the internet
      console.log('... done! Everything looks good!');
    } else {
      const text = await response.text();
      console.error(`... ugh. Something went wrong. Let Christopher know. [${response.status} - ${text}]`)
    }
  } catch (e) {
    console.error(`Welp. That's a problem. Something went wrong, double check your internet connection and environment, and try again. If things are still broke, reach out to Christopher.`, e, e.stackTrace);
  }
})();
