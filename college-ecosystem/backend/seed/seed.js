/**
 * Database Seeder
 * Populates the database with sample data for testing/development
 * Run with: npm run seed
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const User = require("../models/User");
const MarketplaceItem = require("../models/MarketplaceItem");
const Note = require("../models/Note");
const Event = require("../models/Event");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/college_ecosystem";

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB for seeding...");

    // Clear existing data
    await Promise.all([
      User.deleteMany(),
      MarketplaceItem.deleteMany(),
      Note.deleteMany(),
      Event.deleteMany(),
    ]);
    console.log("🧹 Cleared existing data");

    // ─── Create Users ────────────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash("password123", 10);

    const users = await User.insertMany([
      {
        name: "Aryan Sharma",
        email: "aryan@college.edu",
        password: passwordHash,
        college: "IIT Delhi",
        department: "Computer Science",
        year: 3,
        bio: "Full-stack developer | Open source contributor | Coffee addict ☕",
        skills: ["React", "Node.js", "Python", "MongoDB"],
        socialLinks: {
          github: "https://github.com/aryan",
          linkedin: "https://linkedin.com/in/aryan",
        },
        avatar: "",
      },
      {
        name: "Priya Mehta",
        email: "priya@college.edu",
        password: passwordHash,
        college: "IIT Delhi",
        department: "Electronics Engineering",
        year: 2,
        bio: "ECE student | IoT enthusiast | Badminton player 🏸",
        skills: ["Arduino", "Python", "MATLAB", "Circuit Design"],
        avatar: "",
      },
      {
        name: "Rahul Kumar",
        email: "rahul@college.edu",
        password: passwordHash,
        college: "IIT Delhi",
        department: "Mechanical Engineering",
        year: 4,
        bio: "Mechanical engineer | CAD design | Final year project on renewable energy",
        skills: ["AutoCAD", "SolidWorks", "MATLAB", "3D Printing"],
        avatar: "",
      },
      {
        name: "Sneha Patel",
        email: "sneha@college.edu",
        password: passwordHash,
        college: "IIT Delhi",
        department: "Computer Science",
        year: 1,
        bio: "Fresher | Machine learning enthusiast | Coding every day 💻",
        skills: ["Python", "C++", "Machine Learning"],
        avatar: "",
      },
      {
        name: "Dev Gupta",
        email: "dev@college.edu",
        password: passwordHash,
        college: "IIT Delhi",
        department: "Mathematics",
        year: 2,
        bio: "Math + CS double major | Competitive programmer | Gaming in free time 🎮",
        skills: ["C++", "Competitive Programming", "Data Structures", "Algorithms"],
        avatar: "",
      },
    ]);
    console.log(`✅ Created ${users.length} users`);

    // ─── Create Marketplace Items ─────────────────────────────────────────────
    const items = await MarketplaceItem.insertMany([
      {
        title: "Data Structures & Algorithms - Cormen (CLRS)",
        description:
          "The classic algorithms textbook in excellent condition. Used for just one semester. Hardcover edition with some highlighting in chapters 1-5 only.",
        price: 350,
        category: "Books",
        condition: "Good",
        images: [],
        seller: users[0]._id,
        status: "available",
        tags: ["algorithms", "programming", "CS", "CLRS"],
        location: "Hostel Block A",
      },
      {
        title: "Casio Scientific Calculator FX-991EX",
        description:
          "Used for 2 years, works perfectly. All buttons functional. Comes with the original cover. Great for exams and engineering calculations.",
        price: 800,
        category: "Electronics",
        condition: "Like New",
        images: [],
        seller: users[1]._id,
        status: "available",
        tags: ["calculator", "casio", "engineering", "math"],
        location: "Hostel Block C",
      },
      {
        title: "Operating Systems - Galvin Textbook",
        description:
          "9th edition OS textbook, all pages intact. Minimal writing. Perfect for OS course next semester.",
        price: 280,
        category: "Books",
        condition: "Good",
        images: [],
        seller: users[2]._id,
        status: "available",
        tags: ["OS", "operating systems", "CS", "textbook"],
        location: "Library Gate",
      },
      {
        title: 'MacBook Pro M1 14" (2021)',
        description:
          "Selling my M1 MacBook Pro as I'm graduating. 8GB RAM, 256GB SSD. Battery health at 92%. Minor scratch on lid. Comes with original charger.",
        price: 75000,
        category: "Electronics",
        condition: "Good",
        images: [],
        seller: users[2]._id,
        status: "available",
        tags: ["macbook", "laptop", "apple", "M1"],
        location: "Main Gate",
      },
      {
        title: "Engineering Drawing Kit (Complete Set)",
        description:
          "Full drafting kit: T-square, set squares, compass, protractor, drawing board. Perfect condition, used only in first year.",
        price: 450,
        category: "Other",
        condition: "Like New",
        images: [],
        seller: users[0]._id,
        status: "available",
        tags: ["engineering", "drawing", "drafting", "first year"],
        location: "Academic Block",
      },
      {
        title: "Physics by H.C. Verma (Vol 1 & 2)",
        description:
          "Both volumes in one set. Essential for JEE and first-year physics. Some solved examples are highlighted. Very helpful for competitive exams.",
        price: 200,
        category: "Books",
        condition: "Fair",
        images: [],
        seller: users[3]._id,
        status: "available",
        tags: ["physics", "HC Verma", "JEE", "first year"],
        location: "Girls Hostel",
      },
      {
        title: "Arduino Mega + Sensor Kit",
        description:
          "Arduino Mega 2560 with 37-sensor starter kit. All sensors working. Used for IoT project. Great for learning embedded systems.",
        price: 1200,
        category: "Electronics",
        condition: "Good",
        images: [],
        seller: users[1]._id,
        status: "available",
        tags: ["arduino", "IoT", "embedded", "sensors"],
        location: "Electronics Lab",
      },
      {
        title: "Organic Chemistry by Morrison Boyd",
        description:
          "7th edition, complete book. No torn pages. Useful for chemistry courses and pharmacy students.",
        price: 300,
        category: "Books",
        condition: "Good",
        images: [],
        seller: users[4]._id,
        status: "available",
        tags: ["chemistry", "organic", "pharmacy", "textbook"],
        location: "Science Block",
      },
    ]);
    console.log(`✅ Created ${items.length} marketplace items`);

    // ─── Create Notes ─────────────────────────────────────────────────────────
    // (No actual files since this is seed data; fileUrl points to placeholder)
    const notes = await Note.insertMany([
      {
        title: "Complete Data Structures Notes - Arrays to Graphs",
        description:
          "Comprehensive notes covering arrays, linked lists, stacks, queues, trees, and graphs with visual diagrams and complexity analysis.",
        subject: "Data Structures",
        semester: 3,
        year: 2,
        department: "Computer Science",
        college: "IIT Delhi",
        tags: ["DSA", "arrays", "trees", "graphs", "algorithms"],
        fileUrl: "/uploads/notes/placeholder.pdf",
        fileName: "DSA_Complete_Notes.pdf",
        fileSize: 2048576,
        fileType: "application/pdf",
        uploader: users[0]._id,
        downloads: 124,
        likes: [users[1]._id, users[2]._id, users[3]._id],
      },
      {
        title: "Digital Electronics - Boolean Algebra & Logic Gates",
        description:
          "Detailed notes on Boolean algebra, Karnaugh maps, logic gates, flip-flops, and sequential circuits.",
        subject: "Digital Electronics",
        semester: 2,
        year: 1,
        department: "Electronics Engineering",
        college: "IIT Delhi",
        tags: ["digital electronics", "boolean", "logic gates", "EE"],
        fileUrl: "/uploads/notes/placeholder.pdf",
        fileName: "Digital_Electronics_Notes.pdf",
        fileSize: 1536000,
        fileType: "application/pdf",
        uploader: users[1]._id,
        downloads: 87,
        likes: [users[0]._id, users[4]._id],
      },
      {
        title: "Thermodynamics - First & Second Law with Examples",
        description:
          "Complete thermodynamics notes with solved problems, P-V diagrams, Carnot cycle, entropy explanations.",
        subject: "Thermodynamics",
        semester: 3,
        year: 2,
        department: "Mechanical Engineering",
        college: "IIT Delhi",
        tags: ["thermodynamics", "mechanical", "physics", "carnot"],
        fileUrl: "/uploads/notes/placeholder.pdf",
        fileName: "Thermodynamics_Notes.pdf",
        fileSize: 3145728,
        fileType: "application/pdf",
        uploader: users[2]._id,
        downloads: 56,
        likes: [users[0]._id, users[1]._id],
      },
      {
        title: "Machine Learning - Linear to Neural Networks",
        description:
          "Notes from Andrew Ng's course + college lectures. Covers regression, classification, clustering, and intro to neural networks.",
        subject: "Machine Learning",
        semester: 5,
        year: 3,
        department: "Computer Science",
        college: "IIT Delhi",
        tags: ["ML", "machine learning", "neural networks", "AI", "python"],
        fileUrl: "/uploads/notes/placeholder.pdf",
        fileName: "ML_Complete_Notes.pdf",
        fileSize: 4194304,
        fileType: "application/pdf",
        uploader: users[0]._id,
        downloads: 203,
        likes: [users[1]._id, users[3]._id, users[4]._id],
      },
      {
        title: "Engineering Mathematics - Calculus & Differential Equations",
        description:
          "First year engineering mathematics: limits, derivatives, integrals, differential equations with step-by-step solutions.",
        subject: "Engineering Mathematics",
        semester: 1,
        year: 1,
        department: "All Branches",
        college: "IIT Delhi",
        tags: ["mathematics", "calculus", "differential equations", "first year"],
        fileUrl: "/uploads/notes/placeholder.pdf",
        fileName: "Engg_Maths_Notes.pdf",
        fileSize: 2621440,
        fileType: "application/pdf",
        uploader: users[4]._id,
        downloads: 312,
        likes: [users[0]._id, users[1]._id, users[2]._id, users[3]._id],
      },
    ]);
    console.log(`✅ Created ${notes.length} notes`);

    // ─── Create Events ────────────────────────────────────────────────────────
    const futureDate = (daysFromNow) => {
      const d = new Date();
      d.setDate(d.getDate() + daysFromNow);
      return d;
    };

    const events = await Event.insertMany([
      {
        title: "HackFest 2025 - 24 Hour Hackathon",
        description:
          "Join us for IIT Delhi's biggest annual hackathon! Build innovative solutions for real-world problems. Prizes worth ₹1,50,000. Open to all departments. Team size: 2-4 members.",
        category: "Technical",
        date: futureDate(15),
        time: "10:00 AM",
        venue: "Computer Science Auditorium",
        club: "Coding Club IIT Delhi",
        maxAttendees: 200,
        organizer: users[0]._id,
        tags: ["hackathon", "coding", "innovation", "prizes"],
        status: "upcoming",
        isFeatured: true,
        contactEmail: "hackfest@iitd.ac.in",
        attendees: [
          { user: users[1]._id, rsvpStatus: "going" },
          { user: users[2]._id, rsvpStatus: "maybe" },
          { user: users[3]._id, rsvpStatus: "going" },
        ],
      },
      {
        title: "Annual Cultural Fest - Rendezvous 2025",
        description:
          "IIT Delhi's premier cultural festival is back! 3 days of music, dance, drama, and art. Star night performances, competitions, and more!",
        category: "Cultural",
        date: futureDate(30),
        endDate: futureDate(33),
        time: "5:00 PM",
        venue: "Main Ground, IIT Delhi",
        club: "Cultural Council",
        maxAttendees: 5000,
        organizer: users[1]._id,
        tags: ["cultural", "music", "dance", "fest", "Rendezvous"],
        status: "upcoming",
        isFeatured: true,
        contactEmail: "rendezvous@iitd.ac.in",
        attendees: [
          { user: users[0]._id, rsvpStatus: "going" },
          { user: users[4]._id, rsvpStatus: "going" },
        ],
      },
      {
        title: "Machine Learning Workshop - Hands-on Python",
        description:
          "A practical 3-hour workshop on machine learning using Python and scikit-learn. Bring your laptop! We'll build a real ML model from scratch. Free for all students.",
        category: "Workshop",
        date: futureDate(7),
        time: "2:00 PM",
        venue: "Computer Lab 101",
        club: "AI/ML Club",
        maxAttendees: 40,
        organizer: users[0]._id,
        tags: ["ML", "Python", "workshop", "AI", "hands-on"],
        status: "upcoming",
        isOnline: false,
        attendees: [
          { user: users[3]._id, rsvpStatus: "going" },
          { user: users[4]._id, rsvpStatus: "going" },
        ],
      },
      {
        title: "Inter-College Football Tournament",
        description:
          "Annual football tournament open to all IIT Delhi students. Form your team of 11 and compete for the championship trophy! Registration deadline: 3 days before event.",
        category: "Sports",
        date: futureDate(21),
        time: "8:00 AM",
        venue: "Sports Ground, IIT Delhi",
        club: "Sports Council",
        maxAttendees: 100,
        organizer: users[2]._id,
        tags: ["football", "sports", "tournament", "inter-college"],
        status: "upcoming",
        attendees: [{ user: users[0]._id, rsvpStatus: "going" }],
      },
      {
        title: "Entrepreneurship Talk: From Campus to Company",
        description:
          "Alumni panel discussion featuring successful IIT Delhi entrepreneurs. Learn about their startup journeys, fundraising, and building products. Q&A session included.",
        category: "Seminar",
        date: futureDate(10),
        time: "3:00 PM",
        venue: "LHC Lecture Hall 121",
        maxAttendees: 150,
        organizer: users[4]._id,
        tags: ["startup", "entrepreneurship", "alumni", "talk"],
        status: "upcoming",
        attendees: [
          { user: users[0]._id, rsvpStatus: "going" },
          { user: users[1]._id, rsvpStatus: "going" },
        ],
      },
      {
        title: "Robotics Club Weekly Meeting",
        description:
          "Weekly robotics club meeting. This week: working on our autonomous line-following robot. Newcomers welcome! No experience needed.",
        category: "Club",
        date: futureDate(3),
        time: "6:00 PM",
        venue: "Robotics Lab, Block 5",
        club: "Robotics Club",
        maxAttendees: 30,
        organizer: users[1]._id,
        tags: ["robotics", "club", "weekly", "hardware"],
        status: "upcoming",
        attendees: [{ user: users[2]._id, rsvpStatus: "going" }],
      },
    ]);
    console.log(`✅ Created ${events.length} events`);

    // ─── Link data to users ───────────────────────────────────────────────────
    await User.findByIdAndUpdate(users[0]._id, {
      $set: {
        marketplaceListings: [items[0]._id, items[4]._id],
        uploadedNotes: [notes[0]._id, notes[3]._id],
        joinedEvents: [events[0]._id, events[1]._id, events[2]._id, events[4]._id],
      },
    });
    await User.findByIdAndUpdate(users[1]._id, {
      $set: {
        marketplaceListings: [items[1]._id, items[6]._id],
        uploadedNotes: [notes[1]._id],
        joinedEvents: [events[0]._id, events[1]._id, events[4]._id],
      },
    });
    await User.findByIdAndUpdate(users[2]._id, {
      $set: {
        marketplaceListings: [items[2]._id, items[3]._id],
        uploadedNotes: [notes[2]._id],
        joinedEvents: [events[0]._id, events[3]._id],
      },
    });
    await User.findByIdAndUpdate(users[3]._id, {
      $set: {
        marketplaceListings: [items[5]._id],
        uploadedNotes: [],
        joinedEvents: [events[2]._id],
      },
    });
    await User.findByIdAndUpdate(users[4]._id, {
      $set: {
        marketplaceListings: [items[7]._id],
        uploadedNotes: [notes[4]._id],
        joinedEvents: [events[1]._id, events[2]._id],
      },
    });

    console.log("\n🌱 Database seeded successfully!");
    console.log("\n📋 Test Credentials:");
    console.log("─────────────────────────────────");
    users.forEach((u) => console.log(`  📧 ${u.email} | 🔑 password123`));
    console.log("─────────────────────────────────\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seed();
