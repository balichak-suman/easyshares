# EasyShares

EasyShares is a simple, secure, and beautiful platform for sharing code snippets and files. It's built with modern web technologies to provide a seamless experience for developers and anyone needing to share content quickly and securely.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Configuration](#configuration)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Development Server](#running-the-development-server)
- [Deployment](#deployment)
- [Data Management](#data-management)
- [Future Improvements](#future-improvements)

## Features

- **Code Sharing**: Share code snippets with syntax highlighting for various languages.
- **File Sharing**: Upload and share files up to 10MB.
- **Password Protection**: Secure your code snippets with a password. Only those with the password can edit.
- **Custom URLs**: Use a custom title for your code share, which becomes part of the URL for easy access.
- **View-Only Links**: Share links that allow others to view the code without editing capabilities.
- **Auto-Deletion**: For security and privacy, code shares are automatically deleted after 14 days, and files after 3 days.
- **Online Code Compiler**: A simple code execution environment to run and test code snippets.
- **Responsive Design**: A clean, modern, and dark-themed UI that works on all devices.

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Code Editor**: [@monaco-editor/react](https://www.npmjs.com/package/@monaco-editor/react)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: [Vercel](https://vercel.com/)

## Project Structure

The project follows the standard Next.js App Router structure.

```
.
├── data/
│   ├── codeshares.json   # Stores code share data
│   └── files.json        # Stores file metadata
├── public/               # Static assets
├── src/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── [title]/      # Dynamic route for viewing shares
│   │   ├── create/[id]/  # Page for creating new code shares
│   │   ├── execute/      # Online code compiler page
│   │   ├── share/[id]/   # Page for viewing file shares
│   │   ├── upload/[id]/  # Page for uploading files
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx      # Home page
│   ├── components/
│   │   └── Footer.tsx
│   └── lib/
│       ├── dataStore.ts            # Data access logic (development)
│       └── productionDataStore.ts  # Data access logic (production)
├── next.config.ts
├── package.json
└── tsconfig.json
```

## API Endpoints

The application uses several API endpoints to manage code and file shares.

### Code Sharing

- **`POST /api/codeshare`**: Creates a new code share.
- **`GET /api/codeshare/[id]`**: Retrieves a code share by its ID.
- **`PUT /api/codeshare/[id]`**: Updates an existing code share.
- **`DELETE /api/codeshare/[id]`**: Deletes a code share.
- **`POST /api/codeshare/[id]/auth`**: Authenticates a user with a password to allow editing.
- **`POST /api/codeshare/check-slug`**: Checks if a custom URL slug is already taken.

### File Sharing

- **`POST /api/files`**: Handles file uploads. It saves the file to the `uploads/` directory and its metadata to `data/files.json`.
- **`GET /api/files?id=[id]`**: Downloads a file based on its ID.

### Compiler

The project uses a simple API endpoint for code execution, which is handled by the `/api/execute` route. This is a placeholder and can be integrated with a more robust code execution engine.

## Configuration

- **`next.config.ts`**: Standard Next.js configuration.
- **`tsconfig.json`**: TypeScript compiler options.
- **`postcss.config.mjs`**: PostCSS configuration, primarily for Tailwind CSS.
- **`eslint.config.mjs`**: ESLint configuration for code linting.

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/balichak-suman/easyshares.git
    cd easyshares
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Development Server

Start the development server by running:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment

The application is configured for easy deployment on [Vercel](https://vercel.com/).

- **Production Domain**: [https://shareit-csomzn1jt-balichak-sumans-projects.vercel.app/](https://shareit-csomzn1jt-balichak-sumans-projects.vercel.app/)

To deploy your own instance, you can use the Vercel CLI:

1.  Install the Vercel CLI:
    ```bash
    npm i -g vercel
    ```
2.  Deploy to production:
    ```bash
    vercel --prod
    ```

## Data Management

The application uses a simple file-based database for storing data.

- **`data/codeshares.json`**: Stores all code snippets as an array of JSON objects.
- **`data/files.json`**: Stores metadata for all uploaded files.
- **`uploads/`**: This directory (created automatically) stores the actual uploaded files.

**Note**: This data storage method is not suitable for large-scale production use. For a more robust solution, consider migrating to a database like PostgreSQL, MongoDB, or a serverless option like Vercel Postgres.

## Future Improvements

- **Database Migration**: Replace the JSON file database with a scalable SQL or NoSQL database.
- **User Accounts**: Implement user authentication to allow users to manage their shares.
- **Enhanced Compiler**: Integrate a more powerful and secure code execution engine.
- **Team Collaboration**: Add features for teams to share and collaborate on code snippets.
- **Analytics**: Provide view counts and other analytics for shared links.
