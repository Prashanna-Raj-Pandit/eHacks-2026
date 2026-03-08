import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
// import Messages from './pages/Messages'
import Upload from "./pages/Upload";
import Profile from "./pages/Profile/Profile";
import CVGenerator from "./pages/CVGenerator";
import Portfolio from './pages/Portfolio/Portfolio'

function Nav() {
  const { pathname } = useLocation();
  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-8 py-4 flex gap-6">
      <span className="text-white font-bold mr-auto">eHacks</span>
      <Link
        to="/"
        className={`text-sm ${pathname === "/" ? "text-white" : "text-gray-400 hover:text-white"} transition`}
      >
        Profile
      </Link>
      <Link
        to="/documents"
        className={`text-sm ${pathname === "/documents" ? "text-white" : "text-gray-400 hover:text-white"} transition`}
      >
        Documents
      </Link>
      <Link className={`text-sm ${pathname === "/portfolio" ? "text-white" : "text-gray-400 hover:text-white"} transition`}
       to="/portfolio">Portfolio</Link>
      <Link className={`text-sm ${pathname === "/cv" ? "text-white" : "text-gray-400 hover:text-white"} transition`}
      to="/cv">CV Generator</Link>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Portfolio - no nav */}
        <Route path="/portfolio" element={<Portfolio />} />

        {/* App - with nav */}
        <Route path="/*" element={
          <>
            <Nav />
            <Routes>
              <Route path="/profile" element={<Profile />} />
              <Route path="/documents" element={<Upload />} />
              <Route path="/cv" element={<CVGenerator />} />
              <Route path="/" element={<Profile />} />
            </Routes>
          </>
        } />
      </Routes>
    </BrowserRouter>
  )
}
