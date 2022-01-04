const { isFalsy, isJson } = require("./utils");
const defaultOptions = {
  suppressErrors: true,
  logResponse: false,
};


/**
 * Performs supplied api action.
 */
class Request {
  /**
   *
   * @param {Object} datacenter - `dataCenter` object from dataClient
   * @param {Function} apiAction - apiClient action to take (create, update, etc)
   * @param {Object} options
   * @param {Boolean} options.suppressErrors - If true, will prevent try/catch in perform from throwing error, reporting it back in a pseudo response
   * @param {Boolean} options.logResponse - Will console log response data. Could get messy!
   */
  constructor(datacenter, apiAction = () => {}, options = defaultOptions, failedCount = 0) {
    this.datacenter = datacenter;
    this.apiAction = apiAction;
    this.options = options;
  }

  get requestArgs() {
    const { apiAction: { length: argCount }, datacenter: dc } = this;
    let args;
    if (argCount === 1) {
      args = [dc];
    } else if (argCount === 2) {
      const { id } = dc;
      if (isFalsy(id)) throw new Error('Must have id to update.');
      args = [id, dc];
    } else {
      throw new Error('weird arg count for fn.');
    }
    return args;
  }

  // async callWithRetry(fn, depth = 0) {
  //   const wait = (ms) => new Promise((res) => setTimeout(res, ms));

  //   try {
  //     return await fn;
  //   }catch(e) {
  //     if (depth > 7) {
  //       throw e;
  //     }
  //     await wait(2 ** depth * 10);
  //     console.log("did this wait?")
  //     return this.callWithRetry(fn, depth + 1);
  //   }
  // }


  /**
   * Does the work.
   * Returns a combination of response, and parsed response body.
   * @returns {Promise<({headers: string, error: boolean, body: string, status: string}|{message: *}|string)[]>}
   */

  async perform() {
    const { apiAction } = this;
    let response;
    let body;

    try {
      response = await apiAction(...this.requestArgs);
      // console.log(...this.requestArgs)

      if (response.ok) {
        // console.log("I guess this worked?")
        body = await response.json();
      } else {
        // console.log(response.status);
        body = response.statusText;

        
        switch (response.status) {
          case 500:
            // console.log(this)
            // this.callWithRetry(this.perform)
            // console.log("crap its a 500 error");
            break;
          case 503:
            // console.log(this)
            // this.callWithRetry(this.perform)
            // console.log("crap its a 503 error");
            break;
          case 429:
            // console.log("crap its a 429 error");
            break;
          default:
            break;
        }
        const message = await response.text();
        body = { message, error: true, status: response.status };
      // }
      // if (isJson(response)) {
      //   body = await response.json();
      //   // console.log(body.error)

      // } else {
        // 429, 404, and several other responses come back as text.
      //   const message = await response.text();
      //   body = { message, error: true, status: response.status };
        // console.log(body.message, body.status)
        // console.log(Promise.resolve(body))
      }

    } catch(e) {
      if (!this.options.suppressErrors) {
        throw e;
      }
      response = {
        error: true,
        status: 'request-failure',
        body: '',
        headers: ''
      };
      body = `${e}\n${e.stackTrace}`;
      // console.log(body)
      // console.log (Promise.reject(body))
    }
    if (this.options.logResponse) {
      console.log(`[${(new Date()).toTimeString()}] - ${this.apiAction.name} - response and body:`, response, body);
    }
    return [response, body];
  }

  static async perform(datacenter, apiAction = () => {}, options = defaultOptions) {
    const request = new this(datacenter, apiAction, options);
    return request.perform();
  }


}


module.exports = { Request };