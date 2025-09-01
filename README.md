# CommenZu | FE

A post and comment system with nested replies, reactions (like/dislike), with real time streaming.

## 🔗 Important Links

- Frontend Repository: https://github.com/sharifmrahat/commenzu-fe
- Backend Repository: https://github.com/sharifmrahat/commenzu-api
- API Documentation: https://documenter.getpostman.com/view/21772045/2sB3HhsMxT

## 🛠️ Setup Instructions

#### Step-1: Clone the repo

```bash
git clone https://github.com/sharifmrahat/commenzu-fe.git
cd commenzu-fe
```

#### Step-2: Install dependencies

```bash
npm install
```

#### Step-3: Setup environment variables

Create a .env.local file and configure your database + JWT secret:

```bash
VITE_API_URL=http://localhost:5000/api/v1
```

#### Step-4: Start the frontend

```bash
npm run dev
```

Server will run at `http://localhost:3000`

## 📑 API Endpoints

App Url: `http://localhost:5000/api/v1`

| Method | Endpoint            | Description                 | Auth / Role            |
| ------ | ------------------- | --------------------------- | ---------------------- |
| POST   | `/auth/signup`      | Sign up new user            | Public                 |
| POST   | `/auth/login`       | Login with credentials      | Public                 |
| GET    | `/users`            | Get All Users               | Admin                  |
| GET    | `/users/:id`        | Find one user               | Admin, Moderator       |
| GET    | `/users/profile`    | Get Profile with token      | Admin, Moderator, User |
| PATCH  | `/users/profile`    | Update Profile with token   | Admin, Moderator, User |
| GET    | `/posts`            | Get all posts               | Public                 |
| POST   | `/posts`            | Create post                 | Admin, Moderator, User |
| POST   | `/posts`            | Create post                 | Admin, Moderator, User |
| GET    | `/posts/:id`        | Get post by ID              | Public                 |
| POST   | `/posts/:id`        | Update post status          | Admin, Moderator, User |
| PATCH  | `/posts/:id`        | Update post approval status | Admin, Moderator       |
| DELETE | `/posts/:id`        | Delete post by ID           | Admin, Moderator       |
| POST   | `/comments`         | Write comment               | Admin, Moderator, User |
| POST   | `/comments/:id`     | Edit comment                | Admin, Moderator, User |
| GET    | `/comments?postId=` | Get all comments by Post ID | Admin, Moderator, User |
| POST   | `/comments/reply`   | Create reply                | Admin, Moderator, User |
| POST   | `/comments/react`   | Add/Update react            | Admin, Moderator, User |
| DELETE | `/comments/:id`     | Delete comment by ID        | Admin, Moderator, User |

## ✨ Features

- Create and manage posts
- Nested comments and threaded replies
- Like/Dislike reactions (1 reaction per user per comment)
- Auto-updated like/dislike counts
- Secure APIs with JWT Bearer token authentication
- Real time streaming with Web Socket

## 🚀 Technology Used

- React
- React Router
- Axios
- Redux
- TypeScript
- Tailwind
- Shadcn
- Socket

## 🔮 Areas of Enhancement

- Support hashtags and mentions in posts
- Implement notifications for replies & reactions
- Build a user role based dashboard
- Add analytics (most liked, most commented posts)
- Add text-to-speech and voice search
- Implement AI powered summary
