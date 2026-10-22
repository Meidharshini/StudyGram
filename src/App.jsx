
import { Link } from 'react-router-dom'
import { Routes, Route } from 'react-router-dom'
import Signup from './pages/Signup'
import Login from './pages/Login'
import './App.css'
import Dashboard from "./pages/Dashboard";

import ProtectedRoute from "./components/ProtectedRoute";


import Profile from "./pages/Profile";


import Feed from "./pages/Feed";

import StudyMaterials from "./pages/StudyMaterials";


import Reels from "./pages/Reels";

import Quiz from "./pages/Quiz";
import Doubts from "./pages/Doubts";

function Home() {
  return (
    <main className="welcome-page">
      <section className="welcome-content">
        <h1 className="brand-name">
          STUDY<span>GRAM</span>
        </h1>

        <p className="tagline">Connect. Learn. Grow.</p>

        <p className="description">
          Your space to share knowledge, discover ideas,
          and grow together.
        </p>

        <div className="welcome-actions">
          <Link to="/signup" className="signup-button">
            Sign Up
          </Link>

          <Link to="/login" className="login-button">
            Login
          </Link>
        </div>

        <p className="welcome-footer">
          A community where learning never stops.
        </p>
      </section>
    </main>
  )
}

function App() {
  return (
   
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/signup" element={<Signup />} />
  <Route path="/login" element={<Login />} />

 <Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/quiz" element={<Quiz />} />
</Route>

  <Route path="/profile" element={<Profile />} />

<Route path="/feed" element={<Feed />} />


<Route
  path="/study-materials"
  element={<StudyMaterials />}
/>


<Route path="/reels" element={<Reels />} />

<Route path="/doubts" element={<Doubts />} />



</Routes>

  )
}

export default App
