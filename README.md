# XClone

A modern Twitter/X clone application featuring a full-stack architecture with a React Native mobile app and Express.js backend API.

## 🌟 Overview

XClone is a social media application that replicates core Twitter/X functionality, built with modern web and mobile technologies. The project consists of a mobile application built with React Native and Expo, and a backend API built with Express.js and MongoDB.

**Live Demo:** [xclone-three.vercel.app](https://xclone-three.vercel.app/)

## ✨ Features

- 📱 **Mobile-First Design**: Built with React Native and Expo for cross-platform compatibility
- 🔐 **Authentication**: Secure user authentication with Clerk
- 📸 **Media Upload**: Image upload functionality with Cloudinary integration
- 💬 **Real-time Messaging**: Built-in messaging system
- ❤️ **Social Interactions**: Like, delete, and engage with posts
- 👤 **User Profiles**: Comprehensive user profile management with edit capabilities
- 🎨 **Modern UI**: Styled with TailwindCSS and NativeWind
- 🔒 **Security**: Rate limiting and security middleware with Arcjet and Helmet
- 📊 **Data Management**: MongoDB integration with Mongoose ODM

## 📁 Folder Structure

```
xclone/
├── backend/                 # Express.js API server
│   ├── src/                 # Source code
│   ├── package.json         # Backend dependencies
│   ├── vercel.json          # Vercel deployment config
│   └── .gitignore           # Backend git ignore rules
├── mobile/                  # React Native Expo app
│   ├── app/                 # App screens and navigation
│   ├── components/          # Reusable UI components
│   ├── assets/              # Images, fonts, and static assets
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   ├── data/                # Static data and constants
│   ├── package.json         # Mobile app dependencies
│   ├── app.json             # Expo configuration
│   ├── tailwind.config.js   # TailwindCSS configuration
│   └── tsconfig.json        # TypeScript configuration
└── .qoder/                  # Documentation and wiki files
```

## 🚀 Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB instance
- Expo CLI (for mobile development)
- Android Studio / Xcode (for mobile development)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file in the backend directory with the following variables:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   PORT=3000
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

### Mobile App Setup

1. **Navigate to mobile directory:**
   ```bash
   cd mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start Expo development server:**
   ```bash
   npx expo start
   ```

4. **Run on device/emulator:**
   - For Android: `npx expo start --android`
   - For iOS: `npx expo start --ios`
   - For Web: `npx expo start --web`

## 📱 Usage

### Mobile App
- Open the Expo Go app on your device or use an emulator
- Scan the QR code displayed in the terminal
- Sign up or log in using Clerk authentication
- Start posting, liking, and messaging with other users

### Backend API
The backend provides RESTful API endpoints for:
- User authentication and management
- Post creation, retrieval, and interactions
- Media upload and processing
- Real-time messaging
- User profile management

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Clerk
- **File Upload**: Cloudinary
- **Security**: Helmet, CORS, Arcjet
- **Deployment**: Vercel

### Mobile
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Styling**: TailwindCSS with NativeWind
- **Navigation**: Expo Router
- **State Management**: TanStack React Query
- **Authentication**: Clerk Expo
- **HTTP Client**: Axios

## 🤝 Contributing

We welcome contributions to XClone! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes:**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch:**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Add appropriate tests for new features
- Update documentation as needed
- Ensure all CI checks pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

**Mubarek Hassen Buli**
- GitHub: [@mubarek-hassen-buli](https://github.com/mubarek-hassen-buli)
- Project Link: [https://github.com/mubarek-hassen-buli/xclone](https://github.com/mubarek-hassen-buli/xclone)

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) for the amazing React Native framework
- [Clerk](https://clerk.com/) for authentication services
- [Cloudinary](https://cloudinary.com/) for media management
- [TailwindCSS](https://tailwindcss.com/) for styling utilities
- All contributors and open-source maintainers

---

⭐ If you found this project helpful, please give it a star!
