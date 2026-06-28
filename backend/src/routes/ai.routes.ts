import express from 'express';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const router = express.Router();

import { authMiddleware } from '../middleware/auth';

router.use(authMiddleware);

// Stub endpoint for AI Task Generation
router.post('/generate-task', async (req: any, res) => {
  try {
    const { prompt } = req.body;
    // In production, call OpenAI or Gemini API here
    
    // Mock response
    res.json({
      title: "Generated Task from AI",
      description: `AI understood your request: "${prompt}"`,
      priority: "High",
      estimatedTime: "30m"
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Stub endpoint for Note Summarization
router.post('/summarize-note', async (req: any, res) => {
  try {
    const { content } = req.body;
    // Mock response
    res.json({
      summary: "This is an AI generated summary of your note. The key points are scalability and independent deployment."
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Stub endpoint for Note Enhancement
router.post('/enhance-note', async (req: any, res) => {
  try {
    const { content } = req.body;
    
    // Simulate AI processing delay
    await new Promise(r => setTimeout(r, 1500));

    // Simple mock enhancement logic for now
    let enhanced = content + "\n\n---\n✨ *Enhanced by AI*: I have reviewed this note and corrected any grammatical issues. I also suggest breaking down complex paragraphs into bullet points for better readability.";
    
    // In production, we'd call an LLM here
    res.json({ enhancedContent: enhanced });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
// Stub endpoint for Code Review
router.post('/review-code', async (req: any, res) => {
  try {
    const { code, problemTitle, language } = req.body;
    
    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash", 
          generationConfig: { responseMimeType: "application/json" } 
        });
        
        const prompt = `You are an expert AI Coding Tutor. Review the following ${language || 'JavaScript'} code for the problem "${problemTitle || 'Unknown'}".
          
          Code:
          ${code}
          
          Return a JSON object with exactly these fields:
          "overall": A short, encouraging summary of how they did (string)
          "explanation": A detailed explanation of what the code does well and where it can improve (string)
          "rating": A score from 1 to 10 (number)
          "timeComplexity": An analysis of the time complexity, e.g. O(N) (string)
          "spaceComplexity": An analysis of the space complexity, e.g. O(1) (string)
          "suggestions": An array of 2-3 specific suggestions for improvement (array of strings)`;
          
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const feedback = JSON.parse(cleanedText);
        
        return res.json(feedback);
      } catch (apiErr) {
        console.error("Gemini API Error, falling back to mock review:", apiErr);
      }
    }

    // Simulate AI processing delay
    await new Promise(r => setTimeout(r, 2000));

    // Mock AI Code Review Response
    const feedback = {
      overall: `Great start using ${language || 'JavaScript'}! The logic is generally sound, but there are a few optimizations and edge cases you should consider.`,
      explanation: `This ${language || 'JavaScript'} code sets up a solid foundational approach. It correctly identifies the core requirements of the problem. However, there's a nested iteration pattern that causes it to run a bit slower than necessary on large datasets.`,
      rating: 8,
      timeComplexity: "O(N^2) - Consider using a Hash Map to reduce this to O(N).",
      spaceComplexity: "O(1) - Excellent, you are doing this in-place.",
      suggestions: [
        "What happens if the input is empty?",
        "Use more descriptive variable names.",
        "Consider extracting the inner loop into a helper function for readability."
      ]
    };
    
    res.json(feedback);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Stub endpoint for generating a problem
router.post('/generate-problem', async (req: any, res) => {
  try {
    const { topic } = req.body;
    
    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Use gemini-1.5-flash for fast, JSON-structured responses
        const model = genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash", 
          generationConfig: { responseMimeType: "application/json" } 
        });
        
        const prompt = `Generate a coding interview problem about ${topic && topic !== 'Random' ? topic : "a random data structure and algorithm topic"}. 
          Return a JSON object with exactly these fields:
          "title": A catchy title (string)
          "topic": The core topic (string, e.g. "Arrays", "Dynamic Programming", "Trees")
          "difficulty": Either "Easy", "Medium", or "Hard" (string)
          "description": The full problem statement formatted in Markdown. It must include an overarching story/context, Example 1, Example 2, and Constraints.`;
          
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        // Strip out potential markdown formatting that Gemini sometimes wraps JSON in
        const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const problem = JSON.parse(cleanedText);
        
        return res.json(problem);
      } catch (apiErr) {
        console.error("Gemini API Error, falling back to local file:", apiErr);
      }
    }
    
    // Fallback: Read from the dynamically generated problems dataset
    await new Promise(r => setTimeout(r, 1000));
    const problemsPath = path.join(__dirname, '../../data/problems.json');
    let problems = [];
    if (fs.existsSync(problemsPath)) {
      problems = JSON.parse(fs.readFileSync(problemsPath, 'utf-8'));
    } else {
      problems = [{ title: "Fallback Problem", topic: "Arrays", difficulty: "Easy", description: "This is a fallback problem because data/problems.json was not found." }];
    }
    
    let filteredProblems = problems;
    if (topic && topic !== "Random") {
      filteredProblems = problems.filter((p: any) => p.topic === topic);
    }
    if (filteredProblems.length === 0) filteredProblems = problems;
    
    const randomProblem = filteredProblems[Math.floor(Math.random() * filteredProblems.length)];
    res.json(randomProblem);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Stub endpoint for simulating execution of non-JS code
router.post('/simulate-execution', async (req: any, res) => {
  try {
    const { code, language } = req.body;
    await new Promise(r => setTimeout(r, 1500));
    
    let output = [`> Initializing ${language} runtime environment...`, "> Executing code..."];
    
    if (code.includes('print(') || code.includes('System.out.println') || code.includes('cout')) {
      output.push("Hello from AI simulated terminal!");
      output.push("Execution completed successfully.");
    } else {
      output.push("Execution completed. (No output)");
    }
    
    res.json({ output });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
