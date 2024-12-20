const express = require("express");
const profiles = express.Router();
require("dotenv").config();
// Package to generate tokens to authenticate users(profiles) when sending requests
const jwt = require("jsonwebtoken");
const secret = process.env.SECRET;

const {
  createProfile,
  getProfiles,
  logInProfile,
  updateProfile,
  deleteProfile,
  getProfile,
  getAcceptedProfiles,
  getConnectedProfiles,
  getSingleConnectedProfiles,
  updateConnectionStatus,
  sendFriendRequest
} = require("../queries/profiles");

const { checkFirstName, checkLastName } = require("../validations/checkName");

const goalsController = require("./goalsController");
profiles.use("/:userprofile_id/goals", goalsController);

const userPostsController = require("./userPostsController")
profiles.use("/:userprofile_id/posts", userPostsController)

const { authenticateToken } = require("../auth/auth");

// Get ALL profiles
profiles.get("/", async (req, res) => {
  try {
    const profiles = await getProfiles();
    res.status(200).json(profiles);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});



// Create a new profile(signup)
profiles.post("/signup", async (req, res) => {
  console.log(req.body)
  try {
    const newProfile = await createProfile(req.body);
    
    // console.log("new profile: ", newProfile);
    const token = jwt.sign(
      { userId: newProfile.userprofile_id, username: newProfile.username },
      secret
    );

    res.status(201).json({ user: newProfile, token });
  } catch (error) {
    res.status(500).json({ error: "Invalid Information", info: error });
  }
});

// Log into a profile
profiles.post("/login", async (req, res) => {
  try {
    const profileLogin = await logInProfile(req.body);
    if (!profileLogin) {
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }

    const token = jwt.sign(
      { userId: profileLogin.userprofile_id, username: profileLogin.username },
      secret
    );
    res.status(200).json({
      user: {
        userprofile_id: profileLogin.userprofile_id,
        username: profileLogin.username,
        email: profileLogin.email,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update Profile
profiles.put(
  "/:userprofile_id",
  authenticateToken,
  checkFirstName,
  checkLastName,
  async (req, res) => {
    try {
      const { userprofile_id } = req.params;
      const body = req.body;
      // console.log(userprofile_id);
      // console.log(req.user);
      if (userprofile_id !== req.user.userId.toString()) {
        return res
          .status(403)
          .json({ error: "Forbidden - You can only acess your own profile" });
      }
      const updatedProfile = await updateProfile(userprofile_id, body);

      res.status(200).json(updatedProfile);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Delete Profile
profiles.delete("/:userprofile_id", async (req, res) => {
  try {
    const { userprofile_id } = req.params;
    const deletedProfile = await deleteProfile(userprofile_id);
    res.status(200).json({ success: "Successfully deleted profile" });
  } catch (error) {
    res.status(404).json({ error: "error" });
  }
});
profiles.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const profile = await getProfile(id);
    res.status(200).json(profile);
  } catch (error) {
    res.status(404).json({ error: error });
  }
});



//show pending friend requests
profiles.get("/:receiver_user_profile_id/connections", async (req, res) => {
  try {
    const { receiver_user_profile_id } = req.params;
    const result = await getConnectedProfiles(receiver_user_profile_id);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error getting connection requests:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//Route to get your friend requests
// profiles.get("/true/connections/:receiver_user_profile_id", async (req, res) => {
//   try {
//     const {  receiver_user_profile_id} = req.params;
//     const result = await getAcceptedProfiles( receiver_user_profile_id);
//     res.status(200).json(result);
//   } catch (error) {
//     console.error('Error getting connection requests:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });
//show accepted friend request
profiles.get("/:receiver_user_profile_id/connections/accepted", async (req, res) => {
  try {
    const {  receiver_user_profile_id ,status} = req.params;
    // const values = [id];
    const result = await getAcceptedProfiles( receiver_user_profile_id,status);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error getting connection requests:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
//show pending friend request
profiles.get("/:receiver_user_profile_id/connections/:sender_user_profile_id", async (req, res) => {
  try {
    const {  receiver_user_profile_id ,sender_user_profile_id,status} = req.params;
    // const values = [id];
    const result = await getSingleConnectedProfiles( receiver_user_profile_id,sender_user_profile_id,status);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error getting connection requests:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
//update friend request status
profiles.put("/:receiver_user_profile_id/connections/:sender_user_profile_id", async (req, res) => {
  try {
    const { receiver_user_profile_id, sender_user_profile_id } = req.params;
    const { status } = req.body;

    // Update the connection status
    await updateConnectionStatus(receiver_user_profile_id, sender_user_profile_id, status);

    res.status(200).json({ message: 'Connection status updated successfully' });
  } catch (error) {
    console.error('Error updating connection status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
profiles.post("/:receiver_user_profile_id/connections/", async (req, res) => {
  try {
    const { receiver_user_profile_id } = req.params;
    const { sender_user_profile_id, status } = req.body;

    const friendRequestData = {
      sender_user_profile_id: parseInt(sender_user_profile_id),
      receiver_user_profile_id: parseInt(receiver_user_profile_id),
      status
    };

    const newFriendRequest = await sendFriendRequest(friendRequestData);

    res.status(200).json(newFriendRequest);
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = profiles;
