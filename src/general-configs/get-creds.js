require("dotenv").config();

const fs = require("fs").promises;
const { join } = require("path");

  
  // Function to retrieve credentials based on the provided session name
  const getCreds = async (sessionName) => {
    const filePath = join(
      process.cwd(),
      `/Sessions/${sessionName}_session/creds.json`
    );

    try {
      const data = await fs.readFile(filePath, "utf8");
      const creds = JSON.parse(data);
      const num = creds.me.id;

      if (num) {
        return `${num.split(":")[0]}@s.whatsapp.net`;
      }
    } catch (err) {
      console.log("No credentials found, create a new bot");
    }
  };

  module.exports = {
    getCreds
  }