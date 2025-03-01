# FMD User App API Documentation

This document provides detailed information about all API endpoints with examples.

## Table of Contents
- [Authentication](#authentication)
- [User Routes](#user-routes)
  - [Register User](#register-user)
  - [Login User](#login-user)
  - [Get Current User](#get-current-user)
  - [Update User Details](#update-user-details)
  - [Update Password](#update-password)
  - [Update Profile Picture](#update-profile-picture)
- [Project Routes](#project-routes)
  - [Create Project](#create-project)
  - [Get All User Projects](#get-all-user-projects)
  - [Get Single Project](#get-single-project)
  - [Update Project](#update-project)
  - [Delete Project](#delete-project)
  - [Upload Project Zip](#upload-project-zip)
  - [Download Project Zip](#download-project-zip)

## Authentication

All protected routes require a valid JWT token in the request header:

```
Authorization: Bearer <token>
```

## User Routes

### Register User

Creates a new user account.

- **URL**: `/api/v1/users/register`
- **Method**: `POST`
- **Auth required**: No

**Request Body:**

| Parameter | Type   | Required | Description              |
|-----------|--------|----------|--------------------------|
| name      | string | Yes      | User's full name         |
| email     | string | Yes      | User's email address     |
| password  | string | Yes      | Password (min 6 chars)   |

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "password123"
  }'
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "bio": "",
    "profilePic": "/uploads/default-profile.png",
    "createdAt": "2023-08-15T14:30:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields or invalid data
- `409 Conflict`: Email already exists

### Login User

Authenticates a user and returns a token.

- **URL**: `/api/v1/users/login`
- **Method**: `POST`
- **Auth required**: No

**Request Body:**

| Parameter | Type   | Required | Description          |
|-----------|--------|----------|----------------------|
| email     | string | Yes      | User's email address |
| password  | string | Yes      | User's password      |

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "password123"
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "bio": "",
    "profilePic": "/uploads/default-profile.png",
    "createdAt": "2023-08-15T14:30:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields
- `401 Unauthorized`: Invalid credentials

### Get Current User

Returns the currently logged-in user's profile.

- **URL**: `/api/v1/users/me`
- **Method**: `GET`
- **Auth required**: Yes

**Example Request:**
```bash
curl -X GET http://localhost:5000/api/v1/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "bio": "Software developer with 5 years of experience",
    "profilePic": "/uploads/550e8400-e29b-41d4-a716-446655440000/profiles/profile_1629037800000.jpg",
    "createdAt": "2023-08-15T14:30:00.000Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: No token provided or invalid token

### Update User Details

Updates the user's basic profile information.

- **URL**: `/api/v1/users/update`
- **Method**: `PUT`
- **Auth required**: Yes

**Request Body:**

| Parameter | Type   | Required | Description              |
|-----------|--------|----------|--------------------------|
| name      | string | No       | User's full name         |
| bio       | string | No       | User's biography         |

**Example Request:**
```bash
curl -X PUT http://localhost:5000/api/v1/users/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "name": "John Smith",
    "bio": "Full-stack developer with expertise in React and Node.js"
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Smith",
    "email": "john.doe@example.com",
    "bio": "Full-stack developer with expertise in React and Node.js",
    "profilePic": "/uploads/550e8400-e29b-41d4-a716-446655440000/profiles/profile_1629037800000.jpg",
    "createdAt": "2023-08-15T14:30:00.000Z",
    "updatedAt": "2023-08-16T10:15:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid data
- `401 Unauthorized`: No token provided or invalid token

### Update Password

Updates the user's password.

- **URL**: `/api/v1/users/update-password`
- **Method**: `PUT`
- **Auth required**: Yes

**Request Body:**

| Parameter       | Type   | Required | Description               |
|----------------|--------|----------|---------------------------|
| currentPassword | string | Yes      | User's current password    |
| newPassword     | string | Yes      | User's new password        |

**Example Request:**
```bash
curl -X PUT http://localhost:5000/api/v1/users/update-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newSecurePassword456"
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password updated successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400 Bad Request`: Invalid data or new password too short
- `401 Unauthorized`: Incorrect current password or invalid token

### Update Profile Picture

Updates the user's profile picture.

- **URL**: `/api/v1/users/update-profile-pic`
- **Method**: `PUT`
- **Auth required**: Yes
- **Content-Type**: `multipart/form-data`

**Request Body:**

| Parameter | Type | Required | Description         |
|-----------|------|----------|---------------------|
| profilePic | File | Yes      | Profile image file  |

**Example Request:**
```bash
curl -X PUT http://localhost:5000/api/v1/users/update-profile-pic \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "profilePic=@/path/to/image.jpg"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Smith",
    "email": "john.doe@example.com",
    "bio": "Full-stack developer with expertise in React and Node.js",
    "profilePic": "/uploads/550e8400-e29b-41d4-a716-446655440000/profiles/profile_1629124200000.jpg",
    "createdAt": "2023-08-15T14:30:00.000Z",
    "updatedAt": "2023-08-17T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: No file uploaded or invalid file type
- `401 Unauthorized`: No token provided or invalid token
- `413 Payload Too Large`: File exceeds size limit (5MB)

## Project Routes

### Create Project

Creates a new project.

- **URL**: `/api/v1/projects`
- **Method**: `POST`
- **Auth required**: Yes

**Request Body:**

| Parameter    | Type     | Required | Description                 |
|-------------|----------|----------|-----------------------------|
| title        | string   | Yes      | Project title               |
| description  | string   | Yes      | Project description         |
| tags         | string[] | No       | Array of project tags       |

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/v1/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "title": "React Portfolio",
    "description": "A portfolio website built with React",
    "tags": ["react", "portfolio", "frontend"]
  }'
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "project": {
    "id": "7f9c82e0-8beC-4ab8-8984-98f86346985f",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "title": "React Portfolio",
    "description": "A portfolio website built with React",
    "tags": ["react", "portfolio", "frontend"],
    "status": "draft",
    "zipFilePath": null,
    "createdAt": "2023-08-18T09:45:00.000Z",
    "updatedAt": "2023-08-18T09:45:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields or invalid data
- `401 Unauthorized`: No token provided or invalid token

### Get All User Projects

Retrieves all projects belonging to the logged-in user.

- **URL**: `/api/v1/projects`
- **Method**: `GET`
- **Auth required**: Yes

**Query Parameters:**

| Parameter | Type   | Required | Description                                     |
|-----------|--------|----------|-------------------------------------------------|
| status    | string | No       | Filter by status (draft, published)             |
| tag       | string | No       | Filter by tag                                   |
| sort      | string | No       | Sort field (createdAt, updatedAt, title)        |
| order     | string | No       | Sort order (asc, desc) default: desc            |

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/v1/projects?status=published&tag=react&sort=createdAt&order=desc" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 2,
  "projects": [
    {
      "id": "7f9c82e0-8beC-4ab8-8984-98f86346985f",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "title": "React Portfolio",
      "description": "A portfolio website built with React",
      "tags": ["react", "portfolio", "frontend"],
      "status": "published",
      "zipFilePath": "/uploads/550e8400-e29b-41d4-a716-446655440000/7f9c82e0-8beC-4ab8-8984-98f86346985f/project_1629210600000.zip",
      "createdAt": "2023-08-18T09:45:00.000Z",
      "updatedAt": "2023-08-18T10:30:00.000Z"
    },
    {
      "id": "3e7c92d1-9bfC-5cd9-9185-87f97456876g",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "title": "React Weather App",
      "description": "A weather application built with React",
      "tags": ["react", "weather", "api"],
      "status": "published",
      "zipFilePath": "/uploads/550e8400-e29b-41d4-a716-446655440000/3e7c92d1-9bfC-5cd9-9185-87f97456876g/project_1629124200000.zip",
      "createdAt": "2023-08-17T09:30:00.000Z",
      "updatedAt": "2023-08-17T11:20:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized`: No token provided or invalid token

### Get Single Project

Retrieves details for a specific project.

- **URL**: `/api/v1/projects/:projectId`
- **Method**: `GET`
- **Auth required**: Yes

**Path Parameters:**

| Parameter | Type   | Required | Description      |
|-----------|--------|----------|------------------|
| projectId | string | Yes      | Project's UUID   |

**Example Request:**
```bash
curl -X GET http://localhost:5000/api/v1/projects/7f9c82e0-8beC-4ab8-8984-98f86346985f \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "project": {
    "id": "7f9c82e0-8beC-4ab8-8984-98f86346985f",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "title": "React Portfolio",
    "description": "A portfolio website built with React",
    "tags": ["react", "portfolio", "frontend"],
    "status": "published",
    "zipFilePath": "/uploads/550e8400-e29b-41d4-a716-446655440000/7f9c82e0-8beC-4ab8-8984-98f86346985f/project_1629210600000.zip",
    "createdAt": "2023-08-18T09:45:00.000Z",
    "updatedAt": "2023-08-18T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: No token provided or invalid token
- `403 Forbidden`: Project belongs to another user
- `404 Not Found`: Project with the specified ID does not exist

### Update Project

Updates an existing project.

- **URL**: `/api/v1/projects/:projectId`
- **Method**: `PUT`
- **Auth required**: Yes

**Path Parameters:**

| Parameter | Type   | Required | Description      |
|-----------|--------|----------|------------------|
| projectId | string | Yes      | Project's UUID   |

**Request Body:**

| Parameter    | Type     | Required | Description                              |
|-------------|----------|----------|------------------------------------------|
| title        | string   | No       | Project title                            |
| description  | string   | No       | Project description                      |
| tags         | string[] | No       | Array of project tags                    |
| status       | string   | No       | Project status (draft, published)        |

**Example Request:**
```bash
curl -X PUT http://localhost:5000/api/v1/projects/7f9c82e0-8beC-4ab8-8984-98f86346985f \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "title": "React Developer Portfolio",
    "description": "An updated portfolio website built with React and Tailwind CSS",
    "tags": ["react", "portfolio", "tailwind", "frontend"],
    "status": "published"
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "project": {
    "id": "7f9c82e0-8beC-4ab8-8984-98f86346985f",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "title": "React Developer Portfolio",
    "description": "An updated portfolio website built with React and Tailwind CSS",
    "tags": ["react", "portfolio", "tailwind", "frontend"],
    "status": "published",
    "zipFilePath": "/uploads/550e8400-e29b-41d4-a716-446655440000/7f9c82e0-8beC-4ab8-8984-98f86346985f/project_1629210600000.zip",
    "createdAt": "2023-08-18T09:45:00.000Z",
    "updatedAt": "2023-08-19T15:20:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid data
- `401 Unauthorized`: No token provided or invalid token
- `403 Forbidden`: Project belongs to another user
- `404 Not Found`: Project with the specified ID does not exist

### Delete Project

Deletes a project and its associated files.

- **URL**: `/api/v1/projects/:projectId`
- **Method**: `DELETE`
- **Auth required**: Yes

**Path Parameters:**

| Parameter | Type   | Required | Description      |
|-----------|--------|----------|------------------|
| projectId | string | Yes      | Project's UUID   |

**Example Request:**
```bash
curl -X DELETE http://localhost:5000/api/v1/projects/7f9c82e0-8beC-4ab8-8984-98f86346985f \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

**Error Responses:**
- `401 Unauthorized`: No token provided or invalid token
- `403 Forbidden`: Project belongs to another user
- `404 Not Found`: Project with the specified ID does not exist

### Upload Project Zip

Uploads a ZIP file for a project.

- **URL**: `/api/v1/projects/:projectId/upload`
- **Method**: `POST`
- **Auth required**: Yes
- **Content-Type**: `multipart/form-data`

**Path Parameters:**

| Parameter | Type   | Required | Description      |
|-----------|--------|----------|------------------|
| projectId | string | Yes      | Project's UUID   |

**Request Body:**

| Parameter  | Type | Required | Description      |
|------------|------|----------|------------------|
| projectZip | File | Yes      | ZIP file upload  |

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/v1/projects/7f9c82e0-8beC-4ab8-8984-98f86346985f/upload \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "projectZip=@/path/to/project.zip"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "project": {
    "id": "7f9c82e0-8beC-4ab8-8984-98f86346985f",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "title": "React Developer Portfolio",
    "description": "An updated portfolio website built with React and Tailwind CSS",
    "tags": ["react", "portfolio", "tailwind", "frontend"],
    "status": "published",
    "zipFilePath": "/uploads/550e8400-e29b-41d4-a716-446655440000/7f9c82e0-8beC-4ab8-8984-98f86346985f/project_1629297000000.zip",
    "createdAt": "2023-08-18T09:45:00.000Z",
    "updatedAt": "2023-08-20T15:30:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: No file uploaded or invalid file type
- `401 Unauthorized`: No token provided or invalid token
- `403 Forbidden`: Project belongs to another user
- `404 Not Found`: Project with the specified ID does not exist
- `413 Payload Too Large`: File exceeds size limit (50MB)

### Download Project Zip

Downloads the ZIP file for a project.

- **URL**: `/api/v1/projects/:projectId/download`
- **Method**: `GET`
- **Auth required**: Yes

**Path Parameters:**

| Parameter | Type   | Required | Description      |
|-----------|--------|----------|------------------|
| projectId | string | Yes      | Project's UUID   |

**Example Request:**
```bash
curl -X GET http://localhost:5000/api/v1/projects/7f9c82e0-8beC-4ab8-8984-98f86346985f/download \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  --output project.zip
```

**Success Response:**
- The server will send the file directly as a download response with appropriate headers
- Content-Type: application/zip
- Content-Disposition: attachment; filename="project_name.zip"

**Error Responses:**
- `401 Unauthorized`: No token provided or invalid token
- `403 Forbidden`: Project belongs to another user
- `404 Not Found`: Project with the specified ID does not exist or no ZIP file has been uploaded
