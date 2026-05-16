import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let model: any = null;

const getModel = () => {
  if (!API_KEY) {
    console.warn('Gemini: VITE_GEMINI_API_KEY is not set');
    return null;
  }
  if (!model) {
    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    } catch (e) {
      console.error('Gemini: Failed to initialize model', e);
      return null;
    }
  }
  return model;
};

export const GeminiService = {
  /**
   * Generates emotional and stylistic tags based on movie plot.
   */
  async generateTags(movieTitle: string, overview: string): Promise<string[]> {
    const aiModel = getModel();
    if (!aiModel || !overview) return [];

    const prompt = `Analysiere den Film "${movieTitle}". Plot: "${overview}". 
      Gib mir maximal 5 prägnante, emotionale oder stilistische Tags in deutscher Sprache zurück (z.B. #spannend, #melancholisch, #visuell-beeindruckend). 
      Format: Nur die Tags mit # beginnend durch Komma getrennt zurückgeben, kein weiterer Text oder Erklärungen.`;

    try {
      const result = await aiModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean up tags: find all #words and strip the # for internal storage
      const tags = text.match(/#[\w-]+/g) || [];
      return tags.map((tag: string) => tag.replace('#', '').trim()).slice(0, 6);
    } catch (error) {
      console.error("Gemini AI Tag Generation Error:", error);
      return [];
    }
  },

  /**
   * Generates a smart reasoning for a recommendation.
   */
  async getRecommendationReason(targetMovie: string, userTopGenres: string[]): Promise<string> {
    const aiModel = getModel();
    if (!aiModel) return "";

    const prompt = `Warum könnte der Film "${targetMovie}" jemandem gefallen, der gerne ${userTopGenres.join(', ')} schaut? 
      Antworte in einem kurzen, begeisterten Satz auf Deutsch (max 15 Wörter).`;

    try {
      const result = await aiModel.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      return "";
    }
  }
};
