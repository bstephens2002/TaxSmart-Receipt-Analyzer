# TaxSmart Receipt Analyzer: AI-Powered Expense Management

![TaxSmart Logo](assets/TaxSmart.jpg)

[![AI-Enhanced](https://img.shields.io/badge/AI-Enhanced-blue.svg)](https://github.com/bstephens2002/TaxSmart-Receipt-Analyzer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-14.x-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.x-green.svg)](https://www.mongodb.com/)

TaxSmart Receipt Analyzer is an innovative Node.js/Express.js application that simplifies expense management for small business owners and self-employed individuals. By leveraging advanced AI technologies, TaxSmart streamlines the process of categorizing business expenses according to IRS Schedule C categories.

Our application combines the power of Optical Character Recognition (OCR) with state-of-the-art Language Models to automate receipt analysis and categorization. TaxSmart is designed to make optimal use of configurable AI services, providing efficient and accurate expense categorization.

## 🚀 Key Features

- Automates the tedious process of expense categorization
- Utilizes advanced OCR for accurate receipt text extraction
- Leverages configurable Language Models for intelligent expense analysis
- Generates context-aware subject lines for each expense
- Adaptable to different AI services, with default setup for high-speed inference
- Secure data storage using MongoDB

## 🤖 AI-Powered Features

TaxSmart Receipt Analyzer leverages cutting-edge AI technologies to provide an advanced expense management experience:

- **Intelligent OCR**: Utilizes Tesseract.js, an advanced OCR engine, to accurately extract text from receipt images.
- **AI-Driven Categorization**: Employs a configurable Language Model (LLM), set up for high-speed inference through Groq, to categorize expenses according to IRS Schedule C categories.
- **Smart Subject Line Generation**: Uses natural language processing capabilities of the configured LLM to automatically create concise, context-aware subject lines for each expense.
- **Adaptable AI Integration**: The project is designed to work with various LLMs, with default configuration for Groq's high-performance inference.

## 🧠 How It Works

1. **Image Upload**: User uploads a receipt image through the web interface.
2. **OCR Processing**: Tesseract.js extracts text from the image using advanced optical character recognition.
3. **Text Preparation**: The extracted text is processed and formatted for optimal AI analysis.
4. **AI Analysis**: The prepared text is sent to the configured Language Model (default setup uses Groq for high-speed inference) for analysis.
5. **Smart Categorization**: Based on the AI analysis, the expense is categorized according to IRS Schedule C guidelines.
6. **Subject Line Generation**: The AI generates a concise, relevant subject line for the expense.
7. **User Verification**: Results, including the category and subject line, are presented for user review and adjustment if necessary.
8. **Data Storage**: Confirmed data is securely stored in MongoDB for future reference and reporting.

## 🛠️ Installation

1. Clone the repository:
   ```
   git clone https://github.com/bstephens2002/TaxSmart-Receipt-Analyzer.git
   ```
2. Navigate to the project directory:
   ```
   cd TaxSmart-Receipt-Analyzer
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Set up Tesseract.js (see Tesseract Setup section below)
5. Set up MongoDB (see MongoDB Setup section below)
6. Configure environment variables (see Configuration section below)

## 📊 Usage

1. Start the server:
   ```
   npm start
   ```
2. Open your browser and navigate to `http://localhost:3000`
3. Upload a receipt image and watch the magic happen!

## 🔧 Tesseract.js Setup

To set up Tesseract.js for OCR functionality:

1. Download the English trained data file:
   - Go to https://github.com/tesseract-ocr/tessdata
   - Download the `eng.traineddata` file
2. Place the downloaded file:
   - Create a `tessdata` directory in your project root if it doesn't exist
   - Move `eng.traineddata` into the `tessdata` directory

## 🍃 MongoDB Setup

1. Install MongoDB on your system if you haven't already. Follow the official MongoDB installation guide for your operating system.
2. Start the MongoDB service on your machine.

Note: The application will automatically create the necessary database and collections when it first runs, so you don't need to manually create them.

## ⚙️ Configuration

Create a `.env` file in the project root and add the following variables:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/taxsmart
AI_SERVICE_API_KEY=your_ai_service_api_key
AI_SERVICE_URL=https://api.groq.com/openai/v1/chat/completions
```

Replace the `MONGODB_URI` with your actual MongoDB connection string and `AI_SERVICE_API_KEY` with your AI service API key.

## 🔮 Future Enhancements

- Anomaly detection to flag unusual expenses
- Predictive analytics for expense forecasting
- Multi-language receipt support
- Integration with popular accounting software

## 🛡️ Technologies Used

- Node.js
- Express.js
- MongoDB
- Tesseract.js for OCR
- Configurable Language Model (default setup for Groq)
- React.js for the frontend (if applicable)

## 🤝 Contributing

We welcome contributions to TaxSmart Receipt Analyzer! If you have suggestions for improvements or encounter any issues, please feel free to open an issue or submit a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

Brad Stephens - braddstephens@gmail.com

Project Link: [https://github.com/bstephens2002/TaxSmart-Receipt-Analyzer](https://github.com/bstephens2002/TaxSmart-Receipt-Analyzer)

---

TaxSmart Receipt Analyzer: Empowering your business with AI-driven expense management.
