const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

// Check if API key is provided, if not warn and run in fallback mode
const isAIActive = !!apiKey;
if (!isAIActive) {
  console.log('⚠️  Warning: GEMINI_API_KEY is not defined in backend/.env.');
  console.log('🔌 AI integrations will run in graceful fallback mode.');
}

/**
 * Spawns the native curl CLI subprocess to request Google Gemini REST API
 */
const runGeminiCLI = (payload) => {
  // Create a unique temporary file path for the payload to avoid shell-escaping double quote issues on Windows Command Prompt / PowerShell
  const tempFile = path.join(__dirname, `temp_payload_${Date.now()}_${Math.floor(Math.random() * 1000)}.json`);
  
  try {
    // Write the JSON payload to the temp file
    fs.writeFileSync(tempFile, JSON.stringify(payload, null, 2), 'utf8');
    
    // Construct and execute the curl CLI command
    // Note: We use curl.exe directly on Windows to bypass powershell custom alias mappings (like Invoke-WebRequest)
    const curlCommand = `curl.exe -s -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}" -H "Content-Type: application/json" -d "@${tempFile.replace(/\\/g, '/')}"`;
    
    console.log(`🤖 Spawning Gemini API CLI subprocess: curl.exe`);
    const output = execSync(curlCommand, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    
    // Parse the output JSON
    const resObj = JSON.parse(output);
    
    // Extract generated text
    if (resObj.candidates && resObj.candidates[0] && resObj.candidates[0].content && resObj.candidates[0].content.parts && resObj.candidates[0].content.parts[0]) {
      return resObj.candidates[0].content.parts[0].text.trim();
    } else {
      console.error('Gemini CLI Response Format Error:', output);
      throw new Error('Unexpected response format from Gemini CLI');
    }
  } catch (err) {
    console.error('Gemini CLI Subprocess Execution Failed:', err.message);
    throw new Error(`AI CLI agent execution failed: ${err.message}`);
  } finally {
    // Clean up temporary payload file
    if (fs.existsSync(tempFile)) {
      try {
        fs.unlinkSync(tempFile);
      } catch (cleanupErr) {
        console.error('Failed to clean up temporary payload file:', cleanupErr.message);
      }
    }
  }
};

/**
 * Generate product description using Gemini API CLI
 */
const generateProductDescription = async (productName, categoryName) => {
  if (!isAIActive) {
    return `Discover the exceptional ${productName}. Crafted with precision and premium materials, this top-tier item in our ${categoryName || 'General'} collection offers unmatched reliability and a sleek aesthetic. Perfect for daily use and designed to elevate your lifestyle. Order yours today! (Mock description - plug in GEMINI_API_KEY for authentic AI generation)`;
  }

  try {
    const prompt = `Generate a compelling, professional, search-engine optimized product description for a product named "${productName}" under the "${categoryName || 'General'}" category. Focus on premium qualities, technical specifications placeholder space, target benefits, and keep it under 150 words. Do not include price details or headers, start writing the description directly.`;

    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }]
    };

    return runGeminiCLI(payload);
  } catch (error) {
    console.error('Gemini CLI Error (Product Description):', error.message);
    throw new Error(`AI Description Generator CLI failed: ${error.message}`);
  }
};

/**
 * Generate sales insights based on structured analytics data using Gemini API CLI
 */
const generateSalesInsights = async (analyticsData) => {
  if (!isAIActive) {
    return `### 📈 E-Commerce Business Performance Summary (Mock Brief)

* **Key Takeaway**: Overall monthly revenues are showing steady growth across product categories.
* **Top Performance**: Our best-selling products continue to generate highly consistent volumes.
* **Strategic Recommendations**:
  1. **Stock Optimization**: Increase inventory thresholds for high-velocity items to avoid potential out-of-stock bottlenecks.
  2. **Campaigning**: Launch focused promotional discounts on slower categories to liquidate warehouse holdings.
  3. **Customer Retention**: Leverage order status notifications and chatbot recommendations to boost return purchases.

*(Enable live AI insights by configuring the GEMINI_API_KEY inside your environment settings).*`;
  }

  try {
    const prompt = `
      You are a highly analytical Business Intelligence Consultant for a premium e-commerce platform.
      Analyze the following sales dashboard metrics and compile a professional executive brief (in markdown format) containing:
      1. A short analysis of performance (based on monthly trends and category distributions).
      2. Clear insights on what products/categories are driving growth.
      3. Three actionable business recommendations to optimize sales and operations.

      Platform Sales Data Context:
      ${JSON.stringify(analyticsData, null, 2)}
      
      Keep the brief professional, sharp, and structured with clear markdown headings and bullet points.
    `;

    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }]
    };

    return runGeminiCLI(payload);
  } catch (error) {
    console.error('Gemini CLI Error (Sales Insights):', error.message);
    throw new Error(`AI Sales Analyst CLI failed: ${error.message}`);
  }
};

/**
 * Handle floating customer chatbot queries using live store catalog and order context using Gemini API CLI
 */
const chatCustomerSupport = async (userMessage, chatHistory, storeContext) => {
  if (!isAIActive) {
    // Basic mock answering system
    const msg = userMessage.toLowerCase();
    if (msg.includes('order') || msg.includes('track') || msg.includes('status')) {
      return `Based on my current records, you have active orders. You can track their status in the "My Orders" panel. Is there a specific order number you need help with?`;
    }
    if (msg.includes('shipping') || msg.includes('delivery')) {
      return `Our standard FedEx shipping takes 3 business days. Once an order is marked as 'shipped', you can track its transit timeline here or on the Orders page.`;
    }
    if (msg.includes('recommend') || msg.includes('buy') || msg.includes('suggest')) {
      return `I highly recommend our Vortex X1 Mechanical Keyboard or the Aura 4 Pro ANC Headphones in our Electronics collection! What categories are you browsing today?`;
    }
    return `Hello! I am your AI E-Commerce Assistant. (Mock mode - configure GEMINI_API_KEY for full conversational AI). I can help answer queries about order tracking, catalog products, and shipping times. Ask me about our popular products!`;
  }

  try {
    // Prepare system instructions with database products and order status
    const systemInstruction = `
      You are "Aura", a highly helpful, professional, and friendly customer support chatbot for our premium e-commerce platform.
      You have real-time access to the customer's account and the active store products.
      
      Live Customer and Store Database Context:
      - Active Customer Name: ${storeContext.userName || 'Guest'}
      - Active Customer email: ${storeContext.userEmail || 'N/A'}
      - Customer's Orders History: ${JSON.stringify(storeContext.userOrders || [])}
      - Store Product Catalog (Available items for recommendation): ${JSON.stringify(storeContext.catalog || [])}
      
      Guidelines:
      - Always check the Customer's Orders History if the customer asks "Where is my order?", "Track order", or about order statuses/tracking numbers. Cite their order ID and delivery status directly.
      - If they ask for recommendations or what to buy, check the Store Product Catalog and recommend 1-2 active items, describing their features and price.
      - Be polite, concise, and helpful. Keep responses under 3-4 sentences when possible.
      - Never hallucinate tracking numbers or orders that do not exist in the context; if they have no orders, tell them gently.
    `;

    // Map custom history array to Gemini Content structure
    const contents = [];
    
    // Add system context as user/model priming inside contents
    contents.push({
      role: 'user',
      parts: [{ text: `${systemInstruction}\n\nInitialize chat conversation.` }]
    });
    
    contents.push({
      role: 'model',
      parts: [{ text: "Hello! I am Aura, your Smart E-Commerce Assistant. I have accessed your account context and our product catalog. How can I help you today?" }]
    });

    // Append prior chat history (must alternate user and model)
    const activeHistory = chatHistory || [];
    for (const message of activeHistory) {
      contents.push({
        role: message.sender === 'user' ? 'user' : 'model',
        parts: [{ text: message.text }]
      });
    }

    // Append new user message
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const payload = { contents };

    return runGeminiCLI(payload);
  } catch (error) {
    console.error('Gemini CLI Error (Chatbot):', error.message);
    return `I apologize, I am experiencing a brief communication latency. (Error: ${error.message}). However, I can confirm your account details are safe. Please check your Orders page for live shipping tracking!`;
  }
};

module.exports = {
  isAIActive,
  generateProductDescription,
  generateSalesInsights,
  chatCustomerSupport
};
