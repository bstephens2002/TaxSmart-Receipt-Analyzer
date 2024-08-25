const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { createWorker } = require('tesseract.js');
const { convertHeicToJpg } = require('../utils/imageConverter');
const { processTextWithOpenAI } = require('../utils/openAiProcessor');
const { addReceiptData, getAllReceiptData, updateReceiptData, deleteReceiptData, clearAllReceiptData } = require('../utils/dataStorage');
const router = express.Router();

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Uploads directory created.');
}

// Define storage for the images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Append the date timestamp to the original filename to avoid overwriting
        cb(null, req.session.userId + '-' + file.originalname);
        // cb(null, file.originalname);
    }
});

// File filter to check and accept only JPG, PNG, and HEIC formats
const fileFilter = (req, file, cb) => {
    const allowedExtensions = /\.(jpg|jpeg|png|heic)$/i;
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/heic' || allowedExtensions.test(file.originalname)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file format. Please upload only JPG, PNG, or HEIC images.'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB max file size
    },
    fileFilter: fileFilter
});

// Route to display the upload form
router.get('/upload', (req, res) => {
    res.render('upload');
});

// Route to handle file uploads, now protected with isAuthenticated middleware
router.post('/upload', upload.array('receipts', 500), async (req, res, next) => {
    console.log(`Successfully uploaded ${req.files.length} files.`);

    // Convert HEIC files to JPG
    const conversionPromises = req.files.map(async (file) => {
        if (file.mimetype === 'image/heic' || file.originalname.endsWith('.heic') || file.originalname.endsWith('.HEIC')) {
            try {
                await convertHeicToJpg(file.path);
                const parsedPath = path.parse(file.path);
                const parsedOriginalName = path.parse(file.originalname);
                
                // Update the file.path and file.originalname with the new .jpg extension
                file.path = path.format({ ...parsedPath, base: '', ext: '.jpg' });
                file.originalname = path.format({ ...parsedOriginalName, base: '', ext: '.jpg' });
    
            } catch (err) {
                console.error(`Error during HEIC to JPG conversion for file ${file.originalname}: `, err);
            }
        }
    });

    try {
        await Promise.all(conversionPromises);
        console.log('All files uploaded and converted successfully.');

        // Initialize the Tesseract worker correctly without explicit load calls
        const worker = await createWorker('eng');


        const ocrPromises = req.files.map(async file => {
            if (['image/jpeg', 'image/png'].includes(file.mimetype) || /\.(jpg|jpeg|png)$/i.test(file.originalname)) {
                try {
                    const { path: imagePath, originalname } = file;
                    const { data: { text } } = await worker.recognize(imagePath);
                    console.log(`OCR processing complete for file ${file.originalname}.`);
                    return { imagePath, text, originalname };
                } catch (err) {
                    console.error(`Error during OCR processing for file ${file.originalname}: `, err);
                    return null;
                }
            }
        });

        const ocrResults = (await Promise.all(ocrPromises)).filter(result => result !== null);

        // Process OCR results with OpenAI
        const openAiPromises = ocrResults?.map(async (ocrResult) => {
          try {
            // const fullPath = "/home/brad/AI_Projects/ReceiptMaster4/gpt-pilot/workspace/TaxSmart-Receipt-Analyzer/uploads/1712933612233-IMG_1062.JPG";
            // const parts = fullPath.split('/');
            const fileName = req.session.userId + '-' + ocrResult.originalname;
            const processedData = await processTextWithOpenAI(ocrResult.text, fileName, req);
            console.log(`Data processed with OpenAI for file ${ocrResult.imagePath}`);
            addReceiptData(JSON.parse(processedData)); // Utilizing dataStorage for adding processed data
            return { imagePath: ocrResult.imagePath, processedData: processedData };
          } catch (err) {
            console.error(`Error processing OCR result with OpenAI for file ${ocrResult.imagePath}: `, err);
            return null;
          }
        });

        await Promise.all(openAiPromises);

        // Cleanup: Terminate the worker after processing all images
        await worker.terminate();

        // Redirect to the root page after processing
        res.redirect('/');
    } catch (error) {
        console.error(`Error during file upload, conversion, or OCR process: `, error);
        next(error);
    }
});

// Route to fetch processed receipt data for CSV export
/* router.get('/data', (req, res) => {
    const data = getAllReceiptData(); // Utilizing dataStorage to get all processed data
    if (data.length > 0) {
        res.json(data);
    } else {
        res.json([]); // Return an empty array if no data is available
    }
}); */

/* app.get('/api/receipts', (req, res) => {
    Receipt.find({}).lean().then(receipts => {
        res.json(receipts); // Send the data as JSON
    }).catch(err => {
        console.error("Failed to retrieve data", err);
        res.status(500).send("Error retrieving data");
    });
}); */

/* app.get('/data', (req, res) => {
    Receipt.find({}).lean().then(receipts => {
        res.json(receipts); // Send the data as JSON
    }).catch(err => {
        console.error("Failed to retrieve data", err);
        res.status(500).send("Error retrieving data");
    });
}); */

/* router.get('/data', (req, res) => {
    const data = getAllReceiptData(); // Utilizing dataStorage to get all processed data
    if (data.length > 0) {
        res.json(data);
    } else {
        res.json([]); // Return an empty array if no data is available
    }
});  */

const Receipt = require('../utils/Receipt');  // Import the model

// Endpoint to update receipt data
/* router.post('/update', (req, res) => {
    const { id, key, value } = req.body;
    Receipt.findByIdAndUpdate(id, { [key]: value }, { new: true }, (err, receipt) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(200).send(receipt);
    });
}); */


router.put('/update/:id', (req, res) => {
    const { id } = req.params; // Get the document ID from URL parameters
    const updateData = req.body; // Data passed in the body of PUT request
  
    updateReceiptData(id, updateData)
      .then(updatedReceipt => {
        res.json(updatedReceipt); // Send back the updated receipt data
      })
      .catch(err => {
        console.error('Failed to update receipt:', err);
        res.status(500).send({ error: 'Failed to update receipt' });
      });
  });


router.delete('/delete/:id', (req, res) => {
  const { id } = req.params; // Get the document ID from URL parameters

  deleteReceiptData(id)
    .then(() => {
      res.status(200).send({ message: 'Receipt deleted successfully' });
    })
    .catch(err => {
      console.error('Failed to delete receipt:', err);
      res.status(500).send({ error: 'Failed to delete receipt' });
    });
});


/* router.get('/data', (req, res) => {
    getAllReceiptData()
      .then(data => {
        res.json(data);  // Send data as JSON response
      })
      .catch(err => {
        console.error("Failed to retrieve data", err);
        res.status(500).send("Error retrieving data");
      });
  }); */


  router.get('/data', (req, res) => {
    if (!req.session) {
      return res.status(401).send("Not authenticated");  // Ensure the user is logged in
    }
  
    getAllReceiptData(req.session.userId)  // Pass the user ID to the function
      .then(data => {
        res.json(data);  // Send data as JSON response
      })
      .catch(err => {
        console.error("Failed to retrieve data", err);
        res.status(500).send("Error retrieving data");
      });
  });
  

module.exports = router;