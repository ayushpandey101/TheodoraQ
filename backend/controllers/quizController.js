/**
 * Quiz Generation Controller
 * Handles AI-powered quiz generation requests
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import Quiz from '../models/Quiz.js';

/**
 * Generate quiz based on prompt and save to database
 * POST /api/quiz/generate
 */
export const generateQuiz = async (req, res) => {
  try {
    // 1. Get the prompt and adminId from the request
    const { prompt, quizType, quizTypes, numberOfQuestions = 5 } = req.body;
    const adminId = req.user?.id || req.user?._id; // Get the Admin ID from auth middleware

    // Validate input
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required',
      });
    }

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'You must be logged in to create a quiz',
      });
    }

    // Handle both single quizType (legacy) and multiple quizTypes (new)
    let selectedTypes = [];
    if (quizTypes && Array.isArray(quizTypes) && quizTypes.length > 0) {
      selectedTypes = quizTypes;
    } else if (quizType) {
      selectedTypes = [quizType];
    } else {
      selectedTypes = ['mcq']; // Default to MCQ
    }

    // Validate selectedTypes
    const validTypes = ['mcq', 'true_false', 'short_answer'];
    selectedTypes = selectedTypes.filter(t => validTypes.includes(t));
    
    if (selectedTypes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one valid question type is required',
      });
    }

    // Validate numberOfQuestions - force to integer
    const questionCount = Math.max(1, Math.min(50, parseInt(numberOfQuestions) || 5));

    // Initialize Gemini AI with API key
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Gemini API key is not configured',
      });
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        maxOutputTokens: 8000, // Allow longer responses for more questions
        temperature: 0.7, // Balance between creativity and consistency
      }
    });

    // 2. Construct a detailed prompt for the AI with emphasis on correctness
    // Build dynamic message based on count
    let countMessage = '';
    if (questionCount === 1) {
      countMessage = 'That means ONE question only.';
    } else if (questionCount === 2) {
      countMessage = 'That means TWO questions only.';
    } else if (questionCount >= 3 && questionCount <= 5) {
      countMessage = `That means ${questionCount} questions - not 5, not 10, exactly ${questionCount}.`;
    } else if (questionCount > 5 && questionCount <= 10) {
      countMessage = `That means ${questionCount} questions total - count them carefully.`;
    } else if (questionCount > 10) {
      countMessage = `That means ${questionCount} questions - yes, ${questionCount} full questions. This is a comprehensive quiz.`;
    }

    // Build question type instructions
    let typeInstructions = '';
    let exampleQuestions = [];
    
    if (selectedTypes.length === 1) {
      const type = selectedTypes[0];
      typeInstructions = `All questions must be of type: "${type}"`;
      
      if (type === 'mcq') {
        exampleQuestions.push({
          text: "What is the capital of France?",
          type: "mcq",
          options: ["Paris", "London", "Berlin", "Madrid"],
          answer: "Paris"
        });
      } else if (type === 'true_false') {
        exampleQuestions.push({
          text: "The Earth is flat.",
          type: "true_false",
          options: ["True", "False"],
          answer: "False"
        });
      } else if (type === 'short_answer') {
        exampleQuestions.push({
          text: "What is the chemical formula for water?",
          type: "short_answer",
          options: [],
          answer: "H2O"
        });
      }
    } else {
      typeInstructions = `Generate a MIX of question types from: ${selectedTypes.map(t => `"${t}"`).join(', ')}. 
      Distribute questions evenly across these types. For ${questionCount} questions, aim for roughly ${Math.floor(questionCount / selectedTypes.length)} questions per type.`;
      
      if (selectedTypes.includes('mcq')) {
        exampleQuestions.push({
          text: "What is the capital of France?",
          type: "mcq",
          options: ["Paris", "London", "Berlin", "Madrid"],
          answer: "Paris"
        });
      }
      if (selectedTypes.includes('true_false')) {
        exampleQuestions.push({
          text: "The Earth is flat.",
          type: "true_false",
          options: ["True", "False"],
          answer: "False"
        });
      }
      if (selectedTypes.includes('short_answer')) {
        exampleQuestions.push({
          text: "What is the chemical formula for water?",
          type: "short_answer",
          options: [],
          answer: "H2O"
        });
      }
    }

    const fullPrompt = `
      You are an expert educator and quiz designer with deep knowledge across all subjects.
      Generate a high-quality, academically accurate quiz based on the following request:
      
      Topic: "${prompt}"
      Question Types Allowed: ${selectedTypes.map(t => `"${t}"`).join(', ')}
      
      ⚠️ CRITICAL: YOU MUST GENERATE EXACTLY ${questionCount} QUESTIONS ⚠️
      
      I need EXACTLY ${questionCount} questions in the JSON response.
      ${countMessage}
      ${typeInstructions}
      
      Return your response *only* as a valid JSON object in this exact format:
      {
        "title": "Quiz Title Here",
        "questions": [
          ${JSON.stringify(exampleQuestions[0], null, 2)},
          ${exampleQuestions[1] ? JSON.stringify(exampleQuestions[1], null, 2) + ',' : ''}
          ${exampleQuestions[2] ? JSON.stringify(exampleQuestions[2], null, 2) + ',' : ''}
          ... continue for all ${questionCount} questions
        ]
      }
      
      CRITICAL REQUIREMENTS:
      1. EXACT COUNT: The "questions" array MUST contain EXACTLY ${questionCount} question objects. Not ${Math.max(1, questionCount - 1)}, not ${questionCount + 1}, but EXACTLY ${questionCount}.
      2. CORRECTNESS: Every answer must be factually accurate and verifiable. Double-check all facts.
      3. UNIQUENESS: Generate diverse questions covering different aspects of the topic. No repetitive questions.
      4. CLARITY: Questions must be clear, unambiguous, and grammatically correct.
      5. ANSWER ACCURACY: The "answer" field must match EXACTLY one of the options (including case and punctuation).
      6. DISTRACTORS: For MCQ, provide plausible but clearly incorrect distractors. Avoid obvious wrong answers.
      7. DIFFICULTY: Mix difficulty levels - include both fundamental and advanced questions.
      8. TYPE MATCHING: Each question's "type" field must be one of the allowed types: ${selectedTypes.map(t => `"${t}"`).join(', ')}
      
      Format rules for each question type:
      - For "mcq": 
        * Provide exactly 4 unique, non-overlapping options
        * The "answer" must match one of the 4 options exactly
        * Options should be plausible distractors
      - For "true_false": 
        * Options must be exactly ["True", "False"] (capital T and F)
        * Answer must be either "True" or "False"
      - For "short_answer": 
        * Options should be an empty array []
        * Answer should be the most accepted correct answer (concise, 1-3 words preferred)
      - Do NOT include markdown, code blocks, or any text outside the JSON object.
      - The entire response should be ONE JSON object, nothing else
      
      STEP-BY-STEP PROCESS:
      1. Think of ${questionCount} different aspects of "${prompt}"
      2. Create one question for each aspect, varying the type according to allowed types
      3. Verify you have EXACTLY ${questionCount} questions
      4. Double-check: questions.length === ${questionCount}
      5. Validate each question has correct format for its type
      6. Return the JSON
      
      FINAL VALIDATION - Count the questions in your response:
      - Total questions in array: MUST BE ${questionCount}
      - Each answer exists in its options array (for mcq and true_false)
      - No duplicate questions
      - All facts are correct
      - Question types match allowed types: ${selectedTypes.join(', ')}
      
      START GENERATING ${questionCount} QUESTIONS NOW:
    `;

    // 3. Call the Gemini API
    
    let text;
    try {
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      text = response.text();
    } catch (apiError) {
      // DO NOT use mock data - return real error
      return res.status(500).json({
        success: false,
        message: 'Failed to connect to AI service. Please check your API key and try again.',
        error: apiError.message,
      });
    }

    // 4. Clean and parse the JSON response
    // Sometimes the AI wraps the JSON in ```json ... ```, so we strip that.
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Find the actual JSON object
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1) {
      return res.status(500).json({
        success: false,
        message: 'AI response did not contain valid JSON',
        rawText: text.substring(0, 500),
      });
    }
    
    const jsonText = text.substring(firstBrace, lastBrace + 1);

    // 5. Safely parse the JSON
    let aiJson;
    try {
      aiJson = JSON.parse(jsonText);
    } catch (parseError) {
      // DO NOT use mock data - return real error
      return res.status(500).json({
        success: false,
        message: 'AI response was not valid JSON.',
        rawText: jsonText.substring(0, 500),
        error: parseError.message,
      });
    }

    // 5.5. VALIDATION: Ensure answers match options and are correct
    
    // Check if we got the correct number of questions
    if (aiJson.questions.length !== questionCount) {
      // AI generated different number of questions than requested
    }
    
    const validatedQuestions = aiJson.questions.map((q, index) => {
      // Check if answer exists in options
      if (q.type === 'mcq' || q.type === 'true_false') {
        if (!q.options.includes(q.answer)) {
          q.answer = q.options[0] || 'No answer provided';
        }
      }
      
      // Ensure MCQ has 4 options
      if (q.type === 'mcq' && q.options.length < 4) {
        while (q.options.length < 4) {
          q.options.push(`Option ${q.options.length + 1}`);
        }
      }
      
      // Ensure true_false has correct options
      if (q.type === 'true_false' && !q.options.includes('True')) {
        q.options = ['True', 'False'];
        if (!['True', 'False'].includes(q.answer)) {
          q.answer = 'True';
        }
      }
      
      return q;
    });

    aiJson.questions = validatedQuestions;

    // Check if question count matches request
    const actualCount = aiJson.questions.length;
    let responseMessage = 'Quiz generated successfully. Review and save when ready.';
    
    if (actualCount < questionCount) {
      const difference = questionCount - actualCount;
      responseMessage = `AI generated ${actualCount} questions (requested ${questionCount}). ${difference} question${difference > 1 ? 's' : ''} short. You can add more questions manually or regenerate.`;
      } else if (actualCount > questionCount) {
      const extra = actualCount - questionCount;
      responseMessage = `AI generated ${actualCount} questions (requested ${questionCount}). ${extra} extra question${extra > 1 ? 's' : ''}. You can remove extras if needed.`;
    }

    // 6. Return the generated quiz data WITHOUT saving to database
    // The frontend will open the edit modal, and save only when user confirms
    res.status(200).json({
      success: true,
      data: {
        title: aiJson.title,
        questions: aiJson.questions,
        timeLimit: 10, // Default time limit
      },
      message: responseMessage,
      preview: true, // Flag to indicate this is a preview, not saved yet
    });

  } catch (error) {
    // This catches errors with API Key or the API call itself
    // DO NOT use mock data - return real error so we can debug
    res.status(500).json({
      success: false,
      message: 'Failed to generate quiz',
      error: error.message,
    });
  }
};

/**
 * Get all quizzes created by the authenticated admin
 * GET /api/quiz
 * Supports optional ?limit=N query parameter to limit results
 */
export const getQuizzes = async (req, res) => {
  try {
    const adminId = req.user?.id || req.user?._id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'You must be logged in to view quizzes',
      });
    }

    // Get the 'limit' from the query string (e.g., /api/quiz?limit=5)
    const limit = req.query.limit ? parseInt(req.query.limit) : null;

    // Prepare the query
    let query = Quiz.find({ adminId })
      .select('title questions createdAt updatedAt') // Select specific fields
      .sort({ createdAt: -1 }); // Most recent first

    // Apply the limit if it exists
    if (limit) {
      query = query.limit(limit);
    }

    // Execute the query
    const quizzes = await query;

    res.status(200).json({
      success: true,
      data: quizzes,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quizzes',
      error: error.message,
    });
  }
};

/**
 * Get a single quiz by ID
 * GET /api/quiz/:id
 */
export const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id || req.user?._id;

    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    // Security check: Only the creator can view the full quiz details
    if (quiz.adminId.toString() !== adminId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this quiz',
      });
    }

    res.status(200).json({
      success: true,
      data: quiz,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz',
      error: error.message,
    });
  }
};

/**
 * Delete a quiz
 * DELETE /api/quiz/:id
 */
export const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id || req.user?._id;

    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    // Security check: Only the creator can delete
    if (quiz.adminId.toString() !== adminId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this quiz',
      });
    }

    // TODO: Also delete all assignments linked to this quiz
    // const Assignment = require('../models/Assignment');
    // await Assignment.deleteMany({ quizId: id });

    await Quiz.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully',
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete quiz',
      error: error.message,
    });
  }
};

/**
 * Update a quiz
 * PUT /api/quiz/:id
 */
export const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, questions, timeLimit } = req.body;
    const adminId = req.user?.id || req.user?._id;

    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    // Security check: Only the creator can edit
    if (quiz.adminId.toString() !== adminId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this quiz',
      });
    }

    // TODO: Add check to prevent editing assigned quizzes
    // const Assignment = require('../models/Assignment');
    // const assignmentCount = await Assignment.countDocuments({ quizId: id });
    // if (assignmentCount > 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Cannot edit a quiz that has been assigned to students',
    //   });
    // }

    // Update the fields
    if (title !== undefined) quiz.title = title;
    if (questions !== undefined) quiz.questions = questions;
    if (timeLimit !== undefined) quiz.timeLimit = timeLimit;

    await quiz.save();

    res.status(200).json({
      success: true,
      data: quiz,
      message: 'Quiz updated successfully',
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update quiz',
      error: error.message,
    });
  }
};

/**
 * Create a quiz manually
 * POST /api/quiz/manual
 */
export const createManualQuiz = async (req, res) => {
  try {
    const { title, questions, timeLimit, subgroup } = req.body;
    
    // Get adminId from authenticated user
    const adminId = req.user?._id || req.user?.id;
    
    console.log('CreateManualQuiz - User:', req.user);
    console.log('CreateManualQuiz - AdminId:', adminId);

    // Validation
    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title and at least one question are required',
      });
    }

    if (!adminId) {
      console.error('CreateManualQuiz - No adminId found in request');
      return res.status(401).json({
        success: false,
        message: 'You must be logged in to create a quiz',
      });
    }

    // Create new quiz
    const newQuiz = new Quiz({
      title,
      questions,
      timeLimit: timeLimit || 10,
      subgroup: subgroup || null,
      adminId,
    });

    await newQuiz.save();
    console.log('CreateManualQuiz - Quiz created successfully:', newQuiz._id);

    res.status(201).json({
      success: true,
      data: newQuiz,
      message: 'Quiz created successfully',
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create quiz',
      error: error.message,
    });
  }
};

