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
      stream: false,
      format: "text",
    };
    try {
      const response = await axios.post(url, payload, {
        headers: this.headers,
      });

      // // Extract the content from the response text
      // const contentRegex = /"content":"(.*?)"/g;
      // let match;
      // let combinedMessage = "";
      // while ((match = contentRegex.exec(responseText)) !== null) {
      //   combinedMessage += match[1];
      // }

      console.log("response OK", response.data);
      return response.data;
    } catch (error) {
      // console.error("Error status:", error.response);
      console.error("Error details:", error.response.data.error[0]); // Este es el verdadero mensaje de error.
      throw new Error(`HTTP error! status: ${error.message}`);
    }
  }
}

module.exports = CodeGPTApi;
