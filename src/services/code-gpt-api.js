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
    const response = await fetch(url, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(payload),
    });
    console.log("response", response);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error text:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const responseText = await response.text();
    console.log("Response text:", responseText);

    // Extract the content from the response text
    const contentRegex = /"content":"(.*?)"/g;
    let match;
    let combinedMessage = "";
    while ((match = contentRegex.exec(responseText)) !== null) {
      combinedMessage += match[1];
    }

    console.log("response OK", combinedMessage);
    return combinedMessage;
  }
}

module.exports = CodeGPTApi;
