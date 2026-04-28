const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const User = require("../models/User");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/college_ecosystem";

const DEMO_USER = {
  name: "Aryan Sharma",
  email: "aryan@college.edu",
  password: "password123",
  college: "IIT Delhi",
  department: "Computer Science",
  year: 3,
  bio: "Full-stack developer | Open source contributor | Coffee addict",
  skills: ["React", "Node.js", "Python", "MongoDB"],
  socialLinks: {
    github: "https://github.com/aryan",
    linkedin: "https://linkedin.com/in/aryan",
  },
  avatar: "",
};

const createDemoUser = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    let user = await User.findOne({ email: DEMO_USER.email }).select("+password");

    if (!user) {
      user = new User(DEMO_USER);
    } else {
      user.name = DEMO_USER.name;
      user.email = DEMO_USER.email;
      user.password = DEMO_USER.password;
      user.college = DEMO_USER.college;
      user.department = DEMO_USER.department;
      user.year = DEMO_USER.year;
      user.bio = DEMO_USER.bio;
      user.skills = DEMO_USER.skills;
      user.socialLinks = DEMO_USER.socialLinks;
      user.avatar = DEMO_USER.avatar;
    }

    await user.save();

    console.log("Demo user is ready:");
    console.log("Email: aryan@college.edu");
    console.log("Password: password123");
  } catch (error) {
    console.error("Failed to create demo user:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

createDemoUser();
