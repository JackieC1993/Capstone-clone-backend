const db = require("../db/dbConfig");

// Get All profiles
const getProfiles = async () => {
  try {
    const profiles = await db.any("SELECT * FROM user_profiles");
    return profiles;
  } catch (error) {
    return error;
  }
};

// Get a single profile
const getProfile = async (id) => {
  try {
    const profile = db.one(
      "SELECT * FROM user_profiles WHERE account_id=$1",
      id
    );
    return profile;
  } catch (error) {
    return error;
  }
};

// Create NEW profile
const createProfile = async (profile) => {
  try {
    const { username, firstname, lastname, age, gender, bio, account_id } =
      profile;
    const newProfile = await db.one(
      "INSERT INTO user_profiles (firstname, lastname, user_profile_img, age, gender, bio, last_login, active_status, account_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
      [
        profile.firstname,
        profile.lastname,
        profile.user_profile_img,
        profile.age,
        profile.gender,
        profile.bio,
        profile.last_login,
        profile.active_status,
        profile.account_id,
      ]
    );
    return newProfile;
  } catch (error) {
    return error;
    // throw new Error("Error creating profile: " + err.message);
  }
};

/*
const updateProfile = async (id, profile) => {
  try {
    // const { firstname, lastname, age, gender, bio } = profile;
    const updatedProfile = await db.one(
      "UPDATE user_profiles SET firstname=$1, lastname=$2, user_profile_img=$3, age=$4, gender=$5, bio=$6 WHERE id=$7 RETURNING *",
      [
        profile.firstname,
        profile.lastname,
        profile.user_profile_img,
        profile.age,
        profile.gender,
        profile.bio,
        id,
      ]
    );
    return updatedProfile;
  } catch (error) {
    throw new Error("Error updating profile: " + err.message);
  }
};

const deleteProfile = async (id) => {
  try {
    const deletedProfile = await db.none(
      "DELETE FROM user_profiles WHERE id=$1 RETURNING *",
      id
    );
    return deletedProfile;
  } catch (error) {
    throw new Error("Error deleting profile: " + err.message);
  }
};
*/
module.exports = {
  getProfiles,
  getProfile,
  createProfile,
  // updateProfile,
  // deleteProfile,
};
