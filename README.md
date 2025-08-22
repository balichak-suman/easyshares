# EasyShares

A modern, secure platform for sharing code snippets and files with optional password protection and expiration dates.

## Features

- **Code Sharing**: Share code with syntax highlighting for 15+ programming languages
- **File Sharing**: Upload and share files securely
- **Password Protection**: Optional password protection for both codes and files
- **Custom URLs**: Create custom shareable URLs
- **Expiration**: Automatic cleanup of expired shares
- **Modern UI**: Beautiful, responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Vercel KV (Redis)
- **Editor**: Monaco Editor (VS Code editor)
- **Deployment**: Vercel

## Getting Starteddern, secure code sharing platform built with Next.js and TypeScript. Share code snippets with password protection - only you can edit, others can view.

## Features

- 🔒 **Password Protected Editing** - Only the creator can edit with their secret password
- 👀 **Public Viewing** - Anyone with the link can view the code
- 🎨 **Beautiful UI** - Clean, modern interface with responsive design
- 🌈 **Syntax Highlighting** - Support for 15+ programming languages
- 📋 **Easy Copying** - One-click copy functionality for code and URLs
- ⚡ **Real-time Editing** - Monaco Editor with full IDE features
- 🔗 **Title-Based URLs** - Your title becomes the URL: `codeshare.io/my-awesome-code`
- ✅ **URL Availability Check** - Real-time validation of title availability

## Supported Languages

- JavaScript
- TypeScript
- Python
- Java
- C++
- C#
- Go
- Rust
- PHP
- Ruby
- HTML
- CSS
- JSON
- XML
- Markdown

## How to Use

1. **Create** - Click "Create New Code Share" to start
2. **Write** - Add your code and give it a descriptive title
3. **Automatic URL** - Your title becomes the URL (e.g., "My React Component" → `my-react-component`)
4. **Save** - Save your code share to get a clean URL
5. **Share** - Copy and share the URL with anyone
6. **Edit** - Use your password to make changes anytime

### Title-Based URLs

Your title automatically becomes a clean URL:

- ✅ **Title**: "My React Component" → **URL**: `codeshare.io/my-react-component`
- ✅ **Title**: "API Helper Functions" → **URL**: `codeshare.io/api-helper-functions`
- ✅ **No title** → **Random URL**: `codeshare.io/abc123xyz`

Titles are automatically:
- Converted to lowercase
- Special characters removed
- Spaces replaced with hyphens
- Checked for availability in real-time

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd codeshare
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── codeshare/     # CodeShare API endpoints
│   ├── create/[id]/       # Create new code share page
│   ├── share/[id]/        # View shared code page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
└── lib/
    └── dataStore.ts       # In-memory data storage
```

## API Endpoints

- `POST /api/codeshare` - Create a new code share (supports custom slugs)
- `GET /api/codeshare/[id]` - Get a code share by ID or custom slug
- `PUT /api/codeshare/[id]` - Update a code share (requires password)
- `POST /api/codeshare/[id]/auth` - Authenticate for editing
- `GET /api/codeshare/check-slug` - Check custom slug availability

## Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Monaco Editor** - VS Code editor in the browser
- **Lucide React** - Beautiful icons
- **bcryptjs** - Password hashing
- **UUID** - Unique ID generation

## Security Features

- Password hashing with bcrypt
- No password storage in client-side code
- Server-side authentication for all edit operations
- Read-only access by default for shared links
- Data persistence with local JSON file storage
- Automatic data backup on every save/update

## Production Deployment

For production use, replace the in-memory `dataStore` with a proper database:

- MongoDB
- PostgreSQL
- SQLite
- Any database of your choice

Update the API routes in `src/app/api/codeshare/` to use your database instead of the in-memory store.

## Data Persistence

Your code shares are **automatically saved and persist between restarts**! 

- ✅ **Persistent Storage** - Data saved to `codeshare-data.json` file
- ✅ **Survives Restarts** - All your code shares remain after stopping/starting the server
- ✅ **Automatic Backup** - No manual saving required
- 🔒 **Local Only** - Data stays on your machine (not shared with anyone)

### Storage Details

- **File Location**: `codeshare-data.json` in the project root
- **Format**: Human-readable JSON format
- **Security**: Passwords are hashed with bcrypt (never stored in plain text)
- **Git Ignored**: Data file is automatically ignored by git

### Production Note

For production deployment, replace the JSON file storage with a proper database:
- **PostgreSQL** (recommended for production)
- **MongoDB** (good for document-based storage)
- **SQLite** (simple file-based database)
- **MySQL/MariaDB** (traditional relational database)

---

Built with ❤️ using Next.js and TypeScript
