const axios = require("axios");

class CodeGPTApi {
  constructor(generalUrl, apiKey) {
    this.generalUrl = generalUrl;
    this.apiKey = apiKey;
    this.headers = {
      accept: "application/json",
      "content-type": "application/json",
      authorization: `Bearer ${this.apiKey}`,
    };
  }

  async completion(agentId, messages) {
    const url = `${this.generalUrl}/chat/completions`;

    const payload = {
      agentId: agentId,
      messages: messages,
    };
    console.log("headers", this.headers);
    try {
      const response = await axios.post(url, payload, {
        headers: this.headers,
      });
      const responseText = response.data;

      // Extract the content from the response text
      const contentRegex = /"content":"(.*?)"/g;
      let match;
      let combinedMessage = "";
      while ((match = contentRegex.exec(responseText)) !== null) {
        combinedMessage += match[1];
      }

      console.log("response OK", combinedMessage);
      return combinedMessage;
    } catch (error) {
      console.error("Error status:", error.response.statusText);
      console.error("Error details:", error.response.data);
      throw new Error(`HTTP error! status: ${error.response.data}`);
    }
  }
}

module.exports = CodeGPTApi;
