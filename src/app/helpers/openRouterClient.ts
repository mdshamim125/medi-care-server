// import OpenAI from "openai";
// import config from "../../config";
import axios from "axios";
import config from "../../config";

// export const openai = new OpenAI({
//   baseURL: "https://openrouter.ai/api/v1",
//   // baseURL: 'https://openrouter.ai/api/v1/models',
//   apiKey: config.openRouterApiKey,
// });

export const askOpenRouter = async (messages: any[]) => {
  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "openai/gpt-3.5-turbo", // or 'anthropic/claude-3-haiku'
      messages,
    },
    {
      headers: {
        Authorization: `Bearer ${config.openRouterApiKey}`,
        "Content-Type": "application/json",
      },
    },
  );

  return response.data.choices[0].message.content;
};
