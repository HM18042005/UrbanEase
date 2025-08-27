const User = require('../models/user');

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update current user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, address, city, state, zipCode, dateOfBirth, bio } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (city !== undefined) user.city = city;
    if (state !== undefined) user.state = state;
    if (zipCode !== undefined) user.zipCode = zipCode;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    const updatedUser = await User.findById(user.id).select('-password');
    res.json({ user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
