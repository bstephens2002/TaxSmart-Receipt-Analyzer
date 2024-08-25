const mongoose = require('mongoose');
const Receipt = require('./Receipt'); // path to your Receipt model

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
}).then(() => {
    console.log("MongoDB connected successfully.");
}).catch(err => {
    console.error("MongoDB connection error:", err);
});

/**
 * Adds processed receipt data to the database.
 * @param {Object} data - The processed receipt data to add.
 */
function addReceiptData(data) {
  console.log('Adding receipt data to storage');
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    const newReceipt = new Receipt(data);
    newReceipt.save()
      .then(doc => {
        console.log(`Receipt data added successfully: ${JSON.stringify(doc)}`);
      })
      .catch(err => {
        console.error('Error saving receipt to database:', err);
      });
  } else {
    console.error('Invalid data format. Expected an object.');
  }
}



/**
 * Retrieves all processed receipt data from the database for a specific user.
 * @param {string} userId - The ID of the user whose receipts to retrieve.
 * @returns {Promise<Array>} A promise that resolves with an array of processed receipt data.
 */
function getAllReceiptData(userId) {
  console.log('Retrieving all receipt data from storage for user:', userId);

  // Filter receipts by user ID
  return Receipt.find({ userId: userId }).lean().then(receipts => {
    console.log(receipts);  // `receipts` now is an array of plain objects specific to the user
    return receipts;  // This return now correctly passes user-specific data back to the function caller
  }).catch(err => {
    console.error("Error retrieving data from MongoDB:", err);
    throw err;  // Rethrow or handle the error appropriately
  });
}


/**
 * Updates a specific receipt's data in the database.
 * @param {ObjectId} id - The ID of the receipt to update.
 * @param {Object} updateData - The update operations to be applied.
 */
/* function updateReceiptData(id, updateData) {
  Receipt.findByIdAndUpdate(id, updateData, { new: true })
    .then(updatedReceipt => {
      console.log(`Receipt updated successfully: ${JSON.stringify(updatedReceipt)}`);
    })
    .catch(err => {
      console.error('Error updating receipt data:', err);
    });
} */

function updateReceiptData(id, updateData) {
  return new Promise((resolve, reject) => {
      Receipt.findByIdAndUpdate(id, { $set: updateData }, { new: true })
          .then(resolve)
          .catch(reject);
  });
}

/**
 * Deletes a specific receipt from the database.
 * @param {ObjectId} id - The ID of the receipt to delete.
 * @returns {Promise<Object>} A promise that resolves with the deleted receipt object.
 */
function deleteReceiptData(id) {
  return new Promise((resolve, reject) => {
    Receipt.findByIdAndDelete(id)
      .then(deletedReceipt => {
        if (deletedReceipt) {
          console.log(`Receipt deleted successfully: ${JSON.stringify(deletedReceipt)}`);
          resolve(deletedReceipt);
        } else {
          console.log(`No receipt found with id: ${id}`);
          resolve(null);
        }
      })
      .catch(err => {
        console.error('Error deleting receipt data:', err);
        reject(err);
      });
  });
}

/**
 * Clears all processed receipt data from the database.
 */
function clearAllReceiptData() {
  console.log('Clearing all receipt data from storage');
  Receipt.deleteMany({})
    .then(() => {
      console.log('All receipt data cleared successfully');
    })
    .catch(err => {
      console.error('Error clearing receipt data:', err);
    });
}

module.exports = {
  addReceiptData,
  getAllReceiptData,
  updateReceiptData,
  deleteReceiptData,
  clearAllReceiptData
};
