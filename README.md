# UniClub - University Club Management Platform

UniClub is a comprehensive web application designed to streamline the management of university clubs, and events. It provides a robust platform for students to discover clubs, join communities, and stay updated with campus activities.

## 🚀 Features

-   **Club Management**: Create and manage clubs with detailed pages, members lists, and role assignments.
-   **Event Scheduling & Visibility**: Organize events with date, time, location, and visibility privacy settings (Public/Members-only).
-   **Event Coordinators**: Assign specific club members or admins to act as coordinators for individual events.
-   **Announcements**: Post global or club-specific announcements to keep members informed.
-   **Role-Based Access Control (RBAC)**:
    -   **Platform Admin**: Complete control over the system, manages all clubs, can post global announcements, and sees all private events.
    -   **Club Admin**: Manage specific club details, members, events, and assign event coordinators.
    -   **Member**: Participate in club activities, view private events for their clubs, and serve as event coordinators.
    -   **Viewer**: Explore public clubs and public events before joining.
-   **Rich UI & Dashboards**: Dedicated dashbaords for different roles, categorized event tabs (Upcoming, Ongoing, Completed, All), and premium card layouts.
-   **Authentication & Password Recovery**: Secure sign up, login, and forgot/reset password flows.
-   **Responsive Design**: Built with a mobile-first approach for easy access on any device.

## 🛠️ Technology Stack

-   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
-   **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL & Auth)
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
    git clone https://github.com/shashankbaheti8/College-Event-Management.git
    cd College-Event-Management
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
    Ensure your Supabase database has the required tables and RLS policies. The schema includes `clubs`, `events`, `club_members`, `announcements`, and `event_coordinators`.

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📂 Project Structure

-   `src/app`: Next.js App Router pages and layouts.
    -   `(auth)`: Authentication routes (Login, Signup, Forgot Password, Reset Password).
    -   `(dashboard)`: Main application interface (Dashboards, Clubs directory, Events directory).
-   `src/components`: Reusable UI components (Dashboards, Modals, Cards, Buttons).
-   `src/lib`: Utility functions, Supabase client, RBAC checks, and event helpers.

## 🔒 Permissions Overview

-   **Create Club**: Platform Admins only.
-   **Create Event**: Club Admins (for their clubs).
-   **Manage Event Coordinators**: Club Admins.
-   **View Private Events**: Club Members, Club Admins, and Platform Admins.
-   **Delete Announcement**: 
    -   Platform Admins (Any).
    -   Club Admins (Their own club's).
-   **Join Club**: Available to authenticated users (Viewer becomes Member).

---
