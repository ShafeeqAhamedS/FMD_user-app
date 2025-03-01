# FMD User App Backend API

This is the Express backend for the FMD User Application. It handles user authentication, user management, and project uploads using a local JSON file-based database.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add the following variables:
```
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
```

3. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Database Structure

This application uses a file-based JSON database instead of MongoDB. The data is stored in:

- `/data/db/users.json` - Stores user information
- `/data/db/projects.json` - Stores project information

The JSON files are automatically created when the server starts if they don't exist.

## File Storage Structure

The backend organizes uploaded files in a user-specific directory structure:

```
/uploads/
  ├── <userId>/
  │    ├── profiles/
  │    │    └── profile_<timestamp>.jpg  # User profile pictures
  │    │
  │    ├── <projectId>/
  │    │    └── project_<timestamp>.zip  # Project zip files
  │    │
  │    └── ...other projects
  │
  ├── <anotherUserId>/
  │    └── ...
  │
  └── default-profile.png               # Default profile image
```

This structure provides better organization and access control as each user's files are isolated in their own directory.

## API Endpoints

### User Routes

#### Public Routes

- **Register User**
  - **POST** `/api/v1/users/register`
  - Body: `{ "name": "User Name", "email": "user@example.com", "password": "password123" }`
  - Response: User object with JWT token

- **Login User**
  - **POST** `/api/v1/users/login`
  - Body: `{ "email": "user@example.com", "password": "password123" }`
  - Response: User object with JWT token

#### Protected Routes (require Bearer token)

- **Get Current User**
  - **GET** `/api/v1/users/me`
  - Headers: `Authorization: Bearer <token>`
  - Response: User object

- **Update User Details**
  - **PUT** `/api/v1/users/update`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "name": "Updated Name", "bio": "Updated bio" }`
  - Response: Updated user object

- **Update Password**
  - **PUT** `/api/v1/users/update-password`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "currentPassword": "password123", "newPassword": "newpassword123" }`
  - Response: Success message with new token

- **Update Profile Picture**
  - **PUT** `/api/v1/users/update-profile-pic`
  - Headers: `Authorization: Bearer <token>`
  - Body: FormData with `profilePic` file
  - Response: Updated user object

### Project Routes (all require Bearer token)

- **Create Project**
  - **POST** `/api/v1/projects`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "title": "Project Title", "description": "Project Description", "tags": ["tag1", "tag2"] }`
  - Response: Created project object

- **Get All User Projects**
  - **GET** `/api/v1/projects`
  - Headers: `Authorization: Bearer <token>`
  - Response: Array of project objects

- **Get Single Project**
  - **GET** `/api/v1/projects/:projectId`
  - Headers: `Authorization: Bearer <token>`
  - Response: Project object

- **Update Project**
  - **PUT** `/api/v1/projects/:projectId`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "title": "Updated Title", "description": "Updated Description", "tags": ["tag1", "tag2"], "status": "published" }`
  - Response: Updated project object

- **Delete Project**
  - **DELETE** `/api/v1/projects/:projectId`
  - Headers: `Authorization: Bearer <token>`
  - Response: Success message

- **Upload Project Zip**
  - **POST** `/api/v1/projects/:projectId/upload`
  - Headers: `Authorization: Bearer <token>`
  - Body: FormData with `projectZip` file
  - Response: Updated project object

- **Download Project Zip**
  - **GET** `/api/v1/projects/:projectId/download`
  - Headers: `Authorization: Bearer <token>`
  - Response: Zip file download

## File Structure

```
/backend
├── controllers/              # Request handlers
│   ├── user.controller.js
│   └── project.controller.js
├── middleware/               # Custom middleware functions
│   ├── auth.middleware.js
│   └── upload.middleware.js
├── models/                   # Database models
│   ├── user.model.js
│   └── project.model.js
├── routes/                   # API routes
│   ├── userRoute.js
│   └── projectsRoute.js
├── data/                     # Data and database files
│   ├── userData.js           # Sample user data
│   ├── projectData.js        # Sample project data
│   └── db/                   # JSON database files
│       ├── users.json
│       └── projects.json
├── uploads/                  # Uploaded files (created at runtime)
│   └── <userId>/             # User-specific directories
│       ├── profiles/         # User profile pictures
│       └── <projectId>/      # Project files
├── utils/                    # Utility functions
│   └── db.js                 # Database operations
├── .env                      # Environment variables
├── package.json
├── app.js                    # Entry point
└── README.md
```

## API Documentation

The API is documented using Swagger UI. You can access the interactive documentation at:

```
http://localhost:5000/api-docs
```

## Error Handling

The API uses consistent error response format:

```json
{
  "success": false,
  "message": "Error message description",
  "error": "Detailed error information (only in development)"
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## File Uploads

- Project zip files are stored in: `/uploads/<userId>/<projectId>/`
- Profile pictures are stored in: `/uploads/<userId>/profiles/`
- Maximum file sizes:
  - Project zip: 50MB
  - Profile picture: 5MB

## JSON File Database

The application uses a simple JSON file-based database system that:

- Automatically creates necessary database files on startup
- Handles CRUD operations through the utils/db.js utility
- Uses UUID for generating unique IDs for new records
- Persists data between server restarts
- Performs basic data validation and relationships

For development purposes, you can directly inspect and modify the JSON files in the `/data/db/` directory.
