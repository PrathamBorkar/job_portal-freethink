const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({});

const PlatformKnowledge = `

1. **User Roles**: There are two roles - Applicants and Recruiters.
2. **Applicants**:
   - Has a profile, can upload resumes, and add their skills to profile.
   - can Search and apply for jobs.
   - can Track application status.
3. **Recruiters** can:
   - Post job listings with detailed descriptions.
   - View applicant profiles and scores.
   - Accept or reject applicants.

4. **Interview Score**: Each application can include an interview score between 0-10 that recruiters can use to assess candidates.

5. **Job Filters**: Users can search jobs based on location, mode (online/offline), job type (full-time, internship), and required skills.

6. **Company Profiles**: Recruiters are linked to companies. Each company has a description, size, and status (hiring or not).

7. **Experience & Education**: Applicants can list past experience and education to enhance visibility.

8. **Skills Matching**: Applicants and jobs are linked via skill IDs for matching.

9. **Application Status**: When you apply, the job goes into 'pending' state. Recruiters can later accept or reject applications.

Use this bot to ask about how to use any feature on the site.
`;

exports.askGemini = async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res
      .status(400)
      .json({ error: "Question is required in request body." });
  }

  try {
    const prompt = `
    Strict Guidelines:
    1. Respond **only** with text-based answers.
    2. Do **not** include any images, tables, code snippets, or other non-text media in your response.
    3. **Do not** append the question to your response.
    4. **Do not** write or suggest any code, even if the user explicitly asks for it.
    5. Ensure that the response is relevant and precise to the user's question.
    
    Platform Knowledge: 
    ${PlatformKnowledge}

    User: 
    ${question}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,

      config: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    });

    if (response.text) {
      res.json({ answer: response.text });
    } else {
      res.json({ answer: "Sorry, I can only provide text-based responses." });
    }
  } catch (error) {
    console.error("Error interacting with Gemini API:", error);
    res.status(500).json({ error: "Failed to get response from Gemini API." });
  }
};
