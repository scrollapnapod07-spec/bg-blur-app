import fetch from "node-fetch";
import FormData from "form-data";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Only POST allowed");
  }

  try {
    // Collect the file data from request
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Send it to Remove.bg API
    const formData = new FormData();
    formData.append("image_file", buffer, "upload.png");

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": process.env.REMOVE_BG_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Remove.bg API error:", text);
      return res.status(500).send("Remove.bg API failed");
    }

    // Return the processed image as response
    const arrayBuffer = await response.arrayBuffer();
    res.setHeader("Content-Type", "image/png");
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).send("Server error");
  }
}
