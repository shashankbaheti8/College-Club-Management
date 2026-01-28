# UniClub - University Club Management Platform

UniClub is a comprehensive web application designed to streamline the management of university clubs, and events. It provides a robust platform for students to discover clubs, join communities, and stay updated with campus activities.

## 🚀 Features

-   **Club Management**: Create and manage clubs with details, members, and roles.
-   **Event Scheduling**: Organize events with date, time, location, and visibility settings (Public/Private).
-   **Announcements**: Post global or club-specific announcements to keep members informed.
-   **Role-Based Access Control (RBAC)**:
    -   **Platform Admin**: Complete control over the system (Manage all clubs, global announcements).
    -   **Club Admin**: Manage specific club details, members, and events.
    -   **Member**: Participate in club activities and view private events.
    -   **Viewer**: Explore public clubs and events.
-   **Responsive Design**: Built with a mobile-first approach for easy access on any device.

## 🛠️ Technology Stack

-   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
-   **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)

## ⚙️ Getting Started

### Prerequisites

-   Node.js 18+ installed.
-   A Supabase project created.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/shashankbaheti8/College-Club-Management.git
    cd College-Club-Management
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Setup:**
    Create a `.env.local` file in the root directory and add your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Database Migration:**
    Ensure your Supabase database has the required tables and RLS policies. Run the migration scripts provided in `supabase/migrations` via your Supabase SQL Editor.

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📂 Project Structure

-   `src/app`: Next.js App Router pages and layouts.
    -   `(auth)`: Authentication routes (Login, Signup).
    -   `(dashboard)`: Main application interface (Dashboard, Clubs, Events).
-   `src/components`: Reusable UI components (Modals, Cards, Buttons).
-   `src/lib`: Utility functions, Supabase client, and helper scripts.

## 🔒 Permissions Overview

-   **Create Club**: Platform Admins only.
-   **Create Event**: Club Admins (for their clubs).
-   **Delete Announcement**: 
    -   Platform Admins (Any).
    -   Club Admins (Their own club's).
-   **Join Club**: Admin-invite only (Direct join disabled for security).

---
