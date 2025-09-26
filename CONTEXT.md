This document provides a detailed component-level and feature-level outline for the patient-facing mobile application.

1. Project Setup & Core Dependencies
Initialize Project:

npx create-expo-app@latest health-app --template

Install Core Dependencies:

# Navigation
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs

# UI & Styling
npm install nativewind
npm install --dev tailwindcss

# Data Fetching & State Management
npm install @tanstack/react-query

# Forms
npm install react-hook-form zod @hookform/resolvers

# Secure Storage & Utilities
npx expo install expo-secure-store expo-dev-client expo-haptics

Configuration:

Tailwind CSS: Initialize Tailwind by running npx tailwindcss init and configure the tailwind.config.js file to include nativewind/preset and scan all relevant files.

TanStack Query: Wrap the entire application in a <QueryClientProvider> in your root App.js file.

2. Recommended Folder Structure
A clean structure is key to a maintainable application.

/health-app
|-- /app                        # Main app screens (using Expo's file-based routing)
|   |-- /_layout.js             # Root layout, QueryClientProvider
|   |-- /(auth)                 # Group for authentication screens
|   |   |-- _layout.js
|   |   |-- login.js
|   |   |-- signup.js
|   |-- /(tabs)                 # Group for main app screens (bottom tabs)
|   |   |-- _layout.js          # Defines the tab navigator
|   |   |-- dashboard.js
|   |   |-- metrics.js
|   |   |-- prescriptions.js
|   |   |-- profile.js
|   |-- index.js                # Logic to redirect to (auth) or (tabs)
|
|-- /components                 # Reusable UI components
|   |-- /core                   # Basic elements (Button, Input, Card)
|   |-- /forms                  # Form-specific components
|   |-- /metrics                # Metric charts, list items
|
|-- /hooks                      # Custom hooks
|   |-- useAuth.js              # Manages auth state, login/logout functions
|   |-- useHealthMetrics.js     # TanStack Query hooks for health metrics
|   |-- usePrescriptions.js     # TanStack Query hooks for prescriptions
|
|-- /lib                        # Core logic and utilities
|   |-- api.js                  # Central API client (e.g., configured fetch/axios)
|   |-- secureStore.js          # Helper functions for Expo SecureStore
|   |-- validators.js           # Zod schemas for form validation
|
|-- /constants                  # App-wide constants (colors, styles, etc.)

3. Screen-by-Screen Breakdown
Group: (auth) - Authentication Flow
login.js (Login Screen)

UI: App logo, "Welcome Back" text, Email/Password inputs, "Login" button, "Don't have an account? Sign Up" link.

Logic:

Uses React Hook Form and a Zod schema (loginSchema from /lib/validators.js) for validation.

On submit, calls a login mutation from the useAuth hook.

Displays a loading spinner while the mutation is in progress.

Shows error messages for failed login attempts.

On success, saves the JWT via secureStore.js and navigates to the (tabs) layout.

signup.js (Sign Up Screen)

UI: Similar to login, but with "Full Name" and "Confirm Password" fields.

Logic:

Uses React Hook Form with signupSchema.

Calls a signup mutation from the useAuth hook.

On success, it can either auto-log in the user or navigate them to the login screen with a "Registration successful!" message.

Group: (tabs) - Main Application (Bottom Tab Navigator)
dashboard.js (Dashboard Screen)

UI: A summary view.

"Good morning, [User Name]!" greeting.

A card showing the latest health metric entry (e.g., "Latest Weight: 75kg").

A card for "Today's Medications" listing prescriptions for the day.

A prominent "Add New Metric" button.

Maybe a simple line chart showing weight trend over the last 7 days.

Logic:

Uses useHealthMetrics and usePrescriptions from TanStack Query to fetch data.

Displays loading skeletons while data is being fetched.

metrics.js (Health Metrics Screen)

UI:

A segmented control/tabs to filter by metric type (Weight, Blood Sugar, Cholesterol).

A detailed list of all historical entries for the selected metric, sorted by date.

Each list item shows value, unit, and date.

A floating action button (+) to open the "Add Metric" modal.

Logic:

Fetches all data with useHealthMetrics.

Uses component state to manage the active filter.

prescriptions.js (Prescriptions Screen)

UI:

Two sections: "Active" and "Past" prescriptions.

Each prescription is a card showing: medication name, dosage, and start/end dates.

A toggle switch on each active prescription to enable/disable reminders.

Logic:

Fetches data with usePrescriptions.

Handles the logic for toggling reminders (calls a mutation to update the backend).

profile.js (Profile & Settings Screen)

UI:

Displays user's full name and email.

Lists basic profile info (Date of Birth, Blood Type).

"Share Data with Doctor" Button: The entry point for the verification flow.

"Logout" button.

Logic:

Pressing "Share Data" navigates to a modal or new screen.

Logout button clears the JWT from SecureStore and navigates back to the (auth) flow.

4. Modals & Special Flows
Add Health Metric Modal

UI: A form with fields for "Metric Type" (Picker), "Value" (Input), "Unit" (pre-filled or Picker), and a "Save" button.

Logic:

Uses React Hook Form.

On submit, calls the addMetric mutation from the useHealthMetrics hook.

Shows an optimistic update in the UI while the request is in flight.

Closes the modal on success.

Doctor Verification Modal

UI:

Opened from the profile.js screen.

Initial state: Explains the process and has a "Generate Secure PIN" button.

When clicked: The button becomes disabled, and a loading state appears.

On success: Displays the 6-digit PIN in large, clear text. Shows a message like "This PIN is valid for 5 minutes. Share it with your doctor." A countdown timer is displayed.

Logic:

Uses a useGeneratePin mutation hook to call the /api/verify/generate-pin endpoint.

Manages the loading, success, and error states of the PIN generation process.

5. Core Logic & Services (/lib)
api.js (API Client)

A centralized fetch or axios instance.

Sets the baseURL to https://your-domain.com/api.

Uses an interceptor to automatically retrieve the JWT from secureStore.js and add the Authorization: Bearer <token> header to every outgoing request.

secureStore.js

Exports async functions: saveToken(token), getToken(), and deleteToken().

These functions are simple wrappers around Expo.SecureStore to provide a clean interface for the rest of the app.