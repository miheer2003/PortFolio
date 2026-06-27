# Miheer Jangale - Portfolio Website

Welcome to my personal portfolio website! This project is designed to showcase my skills, experience, and projects through an interactive, visually engaging, and 3D-enhanced experience.

## 🚀 Product Description (PRD)
The goal of this portfolio is to create a memorable and premium user experience that goes beyond a standard static resume. It serves as a centralized hub for my career journey, highlighting my technical skills, professional work, and certifications. The core requirements for this product include:
- **Immersive 3D Experience**: Utilizing 3D objects and physics to create a dynamic environment.
- **Smooth Animations**: High-quality, performant animations for page transitions and element interactions.
- **Responsive Design**: Ensuring the experience is seamless across desktops, tablets, and mobile devices.
- **Performance**: Fast loading times despite heavy 3D assets and animations.

## 🛠️ Tech Stack
This project is built using modern web technologies to ensure performance and maintainability:
- **Core**: React 18, TypeScript, Vite
- **3D & Canvas**: Three.js, React Three Fiber (@react-three/fiber), React Three Drei (@react-three/drei), React Three Cannon & Rapier (for 3D physics)
- **Animations**: GSAP (GreenSock Animation Platform) via `@gsap/react`
- **Styling**: Custom Vanilla CSS with responsive design principles
- **Utilities**: `react-fast-marquee` for scrolling text, `react-icons` for scalable vector icons
- **Analytics**: Vercel Analytics

## 🏗️ How the Site is Made
The website is structured as a Single Page Application (SPA) using **React** and built with **Vite** for fast HMR and optimized production builds. 
- **Component-Based Architecture**: The UI is broken down into modular components (`Navbar`, `About`, `Work`, `TechStack`, etc.) found in the `src/components` directory.
- **3D Integration**: React Three Fiber is used to render a 3D canvas seamlessly alongside standard HTML elements. The 3D elements are managed as declarative React components.
- **State Management**: React Hooks are utilized for managing application state, such as loading phases.
- **Deployment**: The site is configured for easy deployment via GitHub Pages (`gh-pages`) and is also setup with Vercel Analytics.

## ✨ How Animations are Used
Animations play a critical role in the user experience of this portfolio:
- **GSAP (GreenSock)**: Used for complex, timeline-based animations. This includes text reveal effects, scroll-triggered animations, and smooth transitions between sections.
- **React Three Fiber (R3F)**: Handles the 3D physics and animations within the WebGL canvas. Components like the 3D Tech Stack use physical properties (via Cannon/Rapier) to allow users to interact with 3D objects (e.g., throwing or dragging tech icons).
- **Custom Cursor**: A custom animated cursor (`Cursor.tsx`) replaces the default browser pointer to enhance the immersive feel.
- **Micro-interactions**: Hover effects on links and buttons are styled with CSS transitions and GSAP to provide immediate visual feedback.

## 🗺️ What's in the Website
The portfolio is divided into several key sections to provide a comprehensive overview of my profile:
- **Loading Screen (`Loading.tsx`)**: An initial loading state to ensure all 3D assets and fonts are ready before the user enters the site.
- **Landing / Hero (`Landing.tsx`)**: The first impression, featuring a strong headline and an interactive 3D character or scene.
- **About (`About.tsx`)**: A brief introduction to who I am and my background.
- **What I Do (`WhatIDo.tsx`)**: An overview of my core competencies and services.
- **Tech Stack (`TechStack.tsx`)**: An interactive, physics-based 3D playground showcasing the technologies I work with.
- **Work / Projects (`Work.tsx` & `WorkImage.tsx`)**: A gallery of my past projects and professional experience.
- **Career Journey (`Career.tsx`)**: A timeline or summary of my professional roles and growth.
- **Certifications (`Certifications.tsx`)**: Highlights of my professional certifications and continuous learning.
- **Contact (`Contact.tsx`)**: A section providing links to my social profiles (via `SocialIcons.tsx`) and ways to reach out.

## 💻 Running Locally

To run this project on your local machine:

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

---
*Built with ❤️ by Miheer Jangale.*
