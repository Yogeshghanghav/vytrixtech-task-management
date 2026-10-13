# Team Project & Task Management Web Application

A full-stack web application for teams to organize projects, assign
tasks, track progress, and collaborate.

> **Project status:** Update this README to match the features that are
> actually implemented in your repository. Do not claim a feature is
> complete until you have tested it.

## Technology Stack

-   **Frontend:** React.js
-   **Backend:** Node.js, Express.js
-   **Database:** MongoDB / MongoDB Atlas
-   **Authentication:** JSON Web Tokens (JWT)
-   **Real-time collaboration:** Socket.IO (if implemented)
-   **UI:** Tailwind CSS or Bootstrap, depending on the project setup

## Core Features

The assignment calls for the following features. Keep only the items
that are implemented and working:

-   User registration, login, and logout
-   Password hashing and JWT-protected routes
-   Role-based access for Admin, Project Manager, and Developer
-   Dashboard with project and task statistics
-   Create, view, edit, and delete projects
-   Add team members and track project progress
-   Create, edit, and delete tasks
-   Assign tasks to developers
-   Task priority: Low, Medium, High
-   Due dates and task descriptions
-   Task status: Todo, In Progress, Completed
-   Comments and task activity history
-   Real-time task updates and notifications using Socket.IO
-   Responsive desktop and mobile interface

## Project Structure

``` text
VytrixTech-Task/
├── client/        # React frontend
├── server/        # Express backend
├── .gitignore
└── README.md
```

Your actual folder structure may differ; update this section if needed.

## Prerequisites

Install the following before running the application:

-   Node.js (LTS recommended)
-   npm
-   MongoDB locally or a MongoDB Atlas connection
-   Git

## Getting Started

### 1. Clone the repository

``` bash
git clone https://github.com/Yogeshghanghav/vytrixtech-task-management.git
cd vytrixtech-task-management
```

### 2. Install frontend dependencies

``` bash
cd client
npm install
```

### 3. Install backend dependencies

Open a second terminal from the project root:

``` bash
cd server
npm install
```

### 4. Configure environment variables

Create a `.env` file in the `server/` directory (or the location
expected by your backend). Example:

``` env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

Use the variable names your code actually reads. Never commit `.env`
files, passwords, database credentials, or API keys. Keep a sanitized
`.env.example` in the repository.

### 5. Run the application

Start the backend in one terminal:

``` bash
cd server
npm run dev
```

Start the frontend in another terminal:

``` bash
cd client
npm run dev
```

These commands assume the `server/package.json` and
`client/package.json` define a `dev` script. If they do not, check each
package's `scripts` section and use the correct command.

Open the frontend URL printed in the terminal, commonly
`http://localhost:5173`.

## Environment Variables

  Variable        Purpose
  --------------- ----------------------------------------
  `PORT`          Port used by the backend
  `MONGODB_URI`   MongoDB connection string
  `JWT_SECRET`    Secret used to sign JWTs
  `CLIENT_URL`    Frontend origin allowed by the backend

Rename or remove variables in this table to match the application code.
Do not put real values in this README.

## API Endpoints

Document the endpoints implemented by your server. Example categories
from the assignment:

  Category         Purpose
  ---------------- ------------------------------------------
  Authentication   Register, login, logout/session handling
  Users            User details and team members
  Projects         Create and manage projects
  Tasks            Create, assign, update, and delete tasks
  Comments         Add and retrieve task comments
  Notifications    Retrieve or mark notifications as read

Add the exact HTTP methods, paths, authentication requirements, request
examples, and response examples once verified in the code. A Postman
collection or Swagger/OpenAPI documentation can be linked here when
available.

## Scripts

Check `client/package.json` and `server/package.json` for the exact
scripts available in this repository. Common examples include:

-   `npm run dev` --- start a development server
-   `npm start` --- start a production server
-   `npm run build` --- build the frontend

Only use the commands that are actually defined in the respective
`package.json` files.

## Security Notes

-   Never commit `.env` files or secrets.
-   Hash passwords before storing them.
-   Validate and sanitize incoming input.
-   Protect private routes and verify user permissions on the server.
-   Return appropriate HTTP status codes and avoid exposing sensitive
    error details.

## Deployment

Add the deployed frontend URL, backend/API URL, and deployment
instructions here after deployment.

-   **Frontend URL:** *Add after deployment*
-   **Backend/API URL:** *Add after deployment*
-   **API documentation:** *Add when available*

## Submission Checklist

-   [ ] GitHub repository link
-   [ ] Live application URL
-   [ ] Live API URL
-   [ ] README updated to reflect implemented functionality
-   [ ] Database schema / ER diagram
-   [ ] API documentation or Postman collection
-   [ ] `.env.example` with placeholder values only
-   [ ] 5--10 minute demo video

## License

Add a license if one is selected for this project.
