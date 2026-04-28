/**
 * Profile Controller
 * Handles user profile management
 */

const User = require("../models/User");
const MarketplaceItem = require("../models/MarketplaceItem");
const Note = require("../models/Note");

const extractSocialLinks = (body) => {
  const socialLinks = {};
  const rawLinkedin = body["socialLinks[linkedin]"] ?? body.socialLinks?.linkedin;
  const rawGithub = body["socialLinks[github]"] ?? body.socialLinks?.github;

  if (rawLinkedin !== undefined) socialLinks.linkedin = rawLinkedin;
  if (rawGithub !== undefined) socialLinks.github = rawGithub;

  return Object.keys(socialLinks).length > 0 ? socialLinks : undefined;
};

// ─── @route   GET /api/profile/:userId ───────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select("-password -notifications")
      .populate("marketplaceListings", "title price status images category")
      .populate("uploadedNotes", "title subject downloads likes semester")
      .populate("joinedEvents", "title date venue status category");

    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching profile." });
  }
};

// ─── @route   PUT /api/profile/update ────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name, bio, college, department, year, skills } = req.body;
    const socialLinks = extractSocialLinks(req.body);

    const updateData = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (college) updateData.college = college;
    if (department) updateData.department = department;
    if (year) updateData.year = Number(year);
    if (skills !== undefined) {
      updateData.skills = Array.isArray(skills)
        ? skills
        : skills.split(",").map((s) => s.trim()).filter(Boolean);
    }
    if (socialLinks !== undefined) updateData.socialLinks = socialLinks;

    // Handle avatar upload if file provided
    if (req.file) {
      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json({ success: true, message: "Profile updated!", user });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ success: false, message: "Error updating profile." });
  }
};

// ─── @route   GET /api/profile/search ────────────────────────────────────────
const searchUsers = async (req, res) => {
  try {
    const { q, department, year } = req.query;

    let query = { _id: { $ne: req.user._id } };

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { college: { $regex: q, $options: "i" } },
        { department: { $regex: q, $options: "i" } },
        { skills: { $in: [new RegExp(q, "i")] } },
      ];
    }
    if (department) query.department = { $regex: department, $options: "i" };
    if (year) query.year = Number(year);

    const users = await User.find(query)
      .select("name avatar college department year bio skills isOnline")
      .limit(20);

    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error searching users." });
  }
};

module.exports = { getProfile, updateProfile, searchUsers };
