# 🎓 College Ecosystem App

A complete, production-ready full-stack college companion app that connects students through a marketplace, notes sharing, events, and real-time chat.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🛒 **Marketplace** | Buy & sell books, electronics, notes, and more with search/filter |
| 📖 **Notes Sharing** | Upload/download PDFs with likes, comments, and search |
| 🎉 **Events & Clubs** | Create events, RSVP (Going/Maybe), manage attendees |
| 👤 **Student Profiles** | Full profiles with skills, bio, listings, and notes history |
| 💬 **Real-time Chat** | Socket.io powered DMs with typing indicators and online status |
| 🔔 **Notifications** | In-app notification system for all activities |
| 🔐 **Authentication** | JWT-based secure login/register with protected routes |

---

## 🛠️ Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS (dark theme, custom design system)
- React Router v6
- Axios (with interceptors)
- Socket.io Client
- React Hot Toast
- date-fns

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Socket.io
- Multer (file uploads)
- bcryptjs
- express-validator

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

---

### 1. Clone or unzip the project

```bash
cd college-ecosystem
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your MongoDB URI:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/college_ecosystem
JWT_SECRET=your_super_secret_key_here_make_it_long
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

Seed the database with sample data:
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev
```

The API will be running at **http://localhost:5000**

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create your `.env` file:
```bash
cp .env.example .env
```

The default `.env` works out of the box:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

Start the frontend:
```bash
npm run dev
```

The app will be running at **http://localhost:5173**

---

### 4. Login with Demo Accounts

After running the seed script, use any of these accounts (password: `password123`):

| Name | Email | Department |
|---|---|---|
| Aryan Sharma | aryan@college.edu | Computer Science |
| Priya Mehta | priya@college.edu | Electronics Engineering |
| Rahul Kumar | rahul@college.edu | Mechanical Engineering |
| Sneha Patel | sneha@college.edu | Computer Science |
| Dev Gupta | dev@college.edu | Mathematics |

Or click **"Try Demo Account"** on the login page.

---

## 📁 Project Structure

```
college-ecosystem/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Auth logic
│   │   ├── marketplaceController.js
│   │   ├── notesController.js
│   │   ├── eventController.js
│   │   ├── chatController.js
│   │   ├── profileController.js
│   │   └── notificationController.js
│   ├── middleware/
│   │   ├── auth.js               # JWT middleware
│   │   └── upload.js             # Multer file upload
│   ├── models/
│   │   ├── User.js
│   │   ├── MarketplaceItem.js
│   │   ├── Note.js
│   │   ├── Event.js
│   │   └── Message.js            # Chat messages + conversations
│   ├── routes/
│   │   ├── auth.js
│   │   ├── marketplace.js
│   │   ├── notes.js
│   │   ├── events.js
│   │   ├── chat.js
│   │   ├── profile.js
│   │   └── notifications.js
│   ├── seed/
│   │   └── seed.js               # Sample data seeder
│   ├── uploads/                  # Uploaded files (gitignored)
│   ├── server.js                 # Main entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── common/
    │   │       └── Navbar.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx   # Global auth state
    │   │   └── SocketContext.jsx # Socket.io context
    │   ├── pages/
    │   │   ├── Home.jsx          # Dashboard
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Marketplace.jsx
    │   │   ├── Notes.jsx
    │   │   ├── Events.jsx
    │   │   ├── Chat.jsx
    │   │   ├── Profile.jsx
    │   │   └── NotFound.jsx
    │   ├── utils/
    │   │   └── api.js            # Axios instance + all API calls
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css             # Global styles + Tailwind
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── .env.example
    └── package.json
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/change-password` | Change password |

### Marketplace
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/marketplace` | Get all listings (search, filter, paginate) |
| GET | `/api/marketplace/:id` | Get single item |
| POST | `/api/marketplace` | Create listing (auth) |
| PUT | `/api/marketplace/:id` | Update listing (auth, owner) |
| DELETE | `/api/marketplace/:id` | Delete listing (auth, owner) |
| PUT | `/api/marketplace/:id/toggle-save` | Save/unsave item (auth) |

### Notes
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notes` | Get all notes (search, filter) |
| POST | `/api/notes` | Upload note PDF (auth) |
| GET | `/api/notes/:id/download` | Download PDF (auth) |
| PUT | `/api/notes/:id/like` | Like/unlike note (auth) |
| POST | `/api/notes/:id/comment` | Add comment (auth) |
| DELETE | `/api/notes/:id` | Delete note (auth, owner) |

### Events
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/events` | Get all events |
| POST | `/api/events` | Create event (auth) |
| PUT | `/api/events/:id` | Update event (auth, organizer) |
| DELETE | `/api/events/:id` | Delete event (auth, organizer) |
| POST | `/api/events/:id/rsvp` | RSVP to event (auth) |

### Chat
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/chat/conversations` | Get all conversations |
| GET | `/api/chat/conversations/:userId` | Get/create conversation |
| GET | `/api/chat/messages/:conversationId` | Get messages |
| POST | `/api/chat/messages` | Send message |
| GET | `/api/chat/users` | Get all users to chat |

---

## 🔮 Future Improvements

- [ ] **Group chat** for clubs and events
- [ ] **Cloudinary** integration for images/PDFs
- [ ] **Email verification** on registration
- [ ] **Password reset** via email
- [ ] **Comment threads** on marketplace items
- [ ] **Push notifications** (PWA)
- [ ] **Dark/light mode** toggle
- [ ] **Admin dashboard** for moderation
- [ ] **Payment integration** (Razorpay/UPI) for marketplace
- [ ] **AI study assistant** powered by LLMs
- [ ] **College verification** via .edu email check
- [ ] **Rate limiting** and advanced security
- [ ] **Unit + integration tests**
- [ ] **Docker** containerization
- [ ] **CI/CD** pipeline

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

---

## 📄 License

MIT — Free to use for your startup MVP!

---

Built with ❤️ for college students, by college students.
