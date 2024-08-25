const axios = require('axios');
require('dotenv').config();

const OpenAI = require('openai');
// import OpenAI from "openai";
const Groq = require("groq-sdk");
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

/**
 * Processes OCR'd text with OpenAI API to extract structured data.
 * @param {string} receiptText - The OCR'd text to process.
 * @returns {Promise<Object>} - Promise resolving to an object containing extracted data.
 */
async function processTextWithOpenAI(receiptText, fileName, req, businessCategory, businessDescription) {

  try {
    
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });


    class ReceiptInfo {
      /**
       * Creates an instance of StockInfo.
       * @param {string} date - Date of receipt.
       * @param {string} subject - subject of receipt.
       * @param {string} total - total of receipt.
       * @param {string} category - category of receipt.
       */
      constructor(date, subject, total, category) {
        if (typeof date !== 'string' || typeof subject !== 'string' || typeof total !== 'string' || typeof category !== 'string') {
          throw new Error('Invalid type for date or subjects. Both must be strings.');
        }

        this.date = date;
        this.subject = subject;
        this.total = total;
        this.category = category;
      }


    }


    //--------------------------------------------------------------------------
    // Groq function calling might work better funkycall library. See https://www.youtube.com/watch?v=twcGOdOMwzk&t=272s
    schema = {
      "date": "date (Date of purchase on the receipt formatted as 00/00/0000)",
      "subject": "string (Summary of what business receipt is for. Business is a " + businessCategory + " described as " + businessDescription + ")",
      "total": "string (Total dollar amount on receipt like $25.00)",
      "category": "string (Select from only one of these categories: Contract Labor, Commissions and Fees, Repairs and Maintenance, Supplies, Advertising, Office Expense, Utilities, Equipment Rent, Other Rent, Mortgage Interest, Business Travel.)"
    }
      console.log('Sending text to Groq for processing.');
      const completion = await groq.chat.completions.create({
        model: "mixtral-8x7b-32768",
        messages: [
          { 
            role: "system", 
            content: `You are a helpful AI assistant that responds in JSON only. Do not return additional commentary. The user will enter text from a receipt and the assistant will return the date, subject, total, and category even if they are NULL. Select from only one of these categories: Contract Labor, 
            Commissions and Fees, Repairs and Maintenance, Supplies, Advertising, Office Expense, Utilities, 
            Equipment Rent, Other Rent, Mortgage Interest, Business Travel. The JSON schema should include "${JSON.stringify(schema)}".`
          },
          {role: "user", content: receiptText}
          ]
      });

      //----------------------------
      console.log('Successfully processed text with Groq.');
      console.log(completion.choices[0]?.message?.content || "");
      let content = completion.choices[0]?.message?.content || "";

      let jsonObject = JSON.parse(content);
      jsonObject.filename = fileName;
      jsonObject.userId = req.session.userId;
      let updatedContent = JSON.stringify(jsonObject);

      return updatedContent;
      // return completion.choices[0]?.message?.content;
} catch (error) {
  console.error('Error processing text with Groq:', error.message);
  console.error(error.stack);
  throw error; // Rethrow to handle it in the calling context
}

//--------------------------------------------------------------------------


/*
schema = {
  "date": {
      "type": "string",
      "description": "Date of purchase on the receipt formatted as 00/00/0000"
  },
  "subject": {
      "type": "string",
      "description": "Summary of what business receipt is for. Business is an AirBnb"
  },
  "category": {
      "type": "string",
      "description": "Select from only one of these categories: Contract Labor, Commissions and Fees, Repairs and Maintenance, Supplies, Advertising, Office Expense, Utilities, Equipment Rent, Other Rent, Mortgage Interest, Business Travel."
  },
    "total": {
      "type": "string",
      "description": "Total dollar amount on receipt"
  },
}


console.log('Sending text to OpenAI for processing.');

const completion = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [
    { 
      role: "system", 
      content: `You are a helpful AI assistant. The user will enter text from a receipt and the assistant will return the date, subject, total, and category even if they are NULL. Select from only one of these categories: Contract Labor, 
      Commissions and Fees, Repairs and Maintenance, Supplies, Advertising, Office Expense, Utilities, 
      Equipment Rent, Other Rent, Mortgage Interest, Business Travel. Output in JSON using the schema defined here: "${JSON.stringify(schema)}".`
    },
    {role: "user", content: receiptText},
    {role: "assistant", content: JSON.stringify({date: "01/2/2024", subject: "Linens from Standard Textile", total: "25.99", category: "Repairs and Maintenance"})},
    ],
    format: "json"
});



    //----------------------------
    console.log('Successfully processed text with OpenAI.');
    console.log(completion.choices[0]?.message?.content || "");
    let returnValue = completion.choices[0]?.message?.content || "";
    return { returnValue };
  } catch (error) {
    console.error('Error processing text with OpenAI:', error.message);
    console.error(error.stack);
    throw error; // Rethrow to handle it in the calling context
  }
  */






}module.exports = { processTextWithOpenAI };