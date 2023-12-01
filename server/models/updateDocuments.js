const mongoose = require('mongoose');
const Question = require('./questions'); // Adjust the path based on your project structure

async function updateExistingDocuments() {
  try {
    await Question.updateMany({}, { $set: { votes: 0 } });
    console.log('Documents updated successfully.');
  } catch (error) {
    console.error('Error updating documents:', error);
  } finally {
    mongoose.connection.close();
  }
}

mongoose.connect('mongodb://localhost:27017/fake_so', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

updateExistingDocuments();
