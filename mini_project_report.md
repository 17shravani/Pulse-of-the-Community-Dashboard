# Mini Project Report

## 1. Title of the Mini Project
**Pulse of the Community**: A Modern Citizen Issue Reporting & Resolution Platform.

## 2. Abstract
* **The Problem**: Communities often struggle with a lack of transparency and a slow process when reporting civic issues (like potholes, broken streetlights, or water leakage) to local authorities. 
* **The Solution**: "Pulse of the Community" is a web-based platform that empowers citizens to easily report local issues, track their progress in real-time, and view civic data through an interactive dashboard.
* **Key Outcome**: The system bridges the gap between citizens and municipal authorities, ensuring faster resolutions, data-driven decisions, and increased community engagement.

## 3. Introduction
* **Background**: Modern smart cities require digital infrastructure for civic management. Traditional methods of complaint registration are tedious and lack visibility to the public.
* **Objectives**: 
  * To create a user-friendly web application for reporting civic issues.
  * To visualize reported data using a live map and interactive dashboard.
  * To provide real-time status tracking for submitted complaints.
  * To incorporate specialized sections, such as Animal Rescue coordination.
* **Scope**: The project is primarily designed for local community members and governing bodies to log, track, and analyze community issues visually.

## 4. Software Requirement Specification (SRS)
**Functional Requirements:**
* Users must be able to submit issues with categories, location, and severity.
* Users must be able to track their issues using a unique Ticket ID.
* The system should generate visual statistics and charts on a Dashboard.
* The system should feature a map displaying issue locations.

**Non-Functional Requirements:**
* **Performance**: The application should load quickly and handle interactions smoothly.
* **Usability**: The User Interface (UI) must be mobile-responsive and intuitive.
* **Security**: User data and tracking IDs must be securely handled.

**System Requirements:**
* **Hardware Requirements:**
  * Processor: Intel Core i3 (or equivalent) and above.
  * RAM: 4 GB (minimum).
  * Storage: 500 MB of free space.
* **Software Requirements:**
  * Operating System: Windows 10/11, macOS, or Linux.
  * Frontend Framework: React.js (with Vite) and TypeScript.
  * Styling: Tailwind CSS & Framer Motion (for smooth animations).
  * Environment: Node.js.
  * Web Browser: Google Chrome, Mozilla Firefox, or Webkit Equivalent.

## 5. Graphical User Interface (GUI)
The application utilizes a professional "glass-morphism" aesthetic with vibrant color coding. The key functional screens include:
* **Home Page**: A welcoming landing page outlining the features of the platform.
* **Dashboard**: Displays visual statistics (Total Issues, Resolved, In Progress) and interactive charts (Pie chart for categories, Bar chart for Ward-wise data).
* **Report Issue**: A clean form allowing users to select an issue category, pin a location, and submit details.
* **Live Map**: A visual map interface pointing out the geographic spread of open community issues.
* **Track Complaint**: A search interface where users enter their Ticket ID to view a timeline of their issue's resolution.
* **Animal Rescue**: A dedicated module specifically for reporting stray or injured animals.

*(Note for the student: In your hardcopy, you should take screenshots of these pages from the localhost link we set up and paste them under this section!)*

## 6. Source Code
*(Note for the student: You will need to print the actual code files for your hardcopy, but here is the essential folder structure and a core code snippet to include in the report text).*

**Project Architecture Structure:**
* `src/pages/` - Contains main screen UI layouts (Dashboard.tsx, ReportIssue.tsx, etc.)
* `src/components/` - Contains reusable components (Navbar.tsx, StatCard.tsx, etc.)
* `src/lib/` - Contains application data models and utility functions.
* `src/App.tsx` - The primary routing file mapping URLs to pages.

**Core Code Snippet (Application Routing):**
```tsx
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ReportIssue from "./pages/ReportIssue";
import LiveMap from "./pages/LiveMap";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/report" element={<ReportIssue />} />
      <Route path="/map" element={<LiveMap />} />
      {/* Additional application routes */}
    </Routes>
  </BrowserRouter>
);
export default App;
```

## 7. Testing Document
The project underwent manual functional testing. Below are the key test cases executed:

| Test ID | Module | Test Description | Expected Output | Actual Output | Status |
|---------|---------|------------------|-----------------|---------------|--------|
| TC01 | Navigation | Click on 'Dashboard' link in navbar | Should redirect to Dashboard page | Redirected to Dashboard | **Pass** |
| TC02 | Report Issue | Submit form with empty mandatory fields | System should block submission and prompt user | Blocked and prompted | **Pass** |
| TC03 | Report Issue | Submit form with valid data | Should generate and display a Ticket ID | Ticket ID generated | **Pass** |
| TC04 | Tracking | Enter valid Ticket ID in tracking bar | Should display issue details and timeline | Details displayed | **Pass** |
| TC05 | Tracking | Enter invalid Ticket ID | Should display "Issue not found" message | Error message displayed | **Pass** |
| TC06 | UI Layout | View application on a mobile screen | Layout should stack elements vertically | Layout scales properly | **Pass** |

## 8. Conclusion
* **Summary**: The "Pulse of the Community" project successfully implements a digital, interactive platform that bridges the communication gap between citizens and civic authorities. It modernizes the tracking mechanism and introduces data transparency using rich, data-driven dashboards.
* **Future Scope**: As a future enhancement, the system could be upgraded to integrate automated SMS/Email notifications, directly connect to live municipal backend databases, and utilize AI to automatically categorize issues based on user-uploaded images.
