import "./App.css";
import ThreedimBg from "./components/threedim_bg";
import Terminal from "./components/Terminal";
import postsData from "./data/posts.json";
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <div className="relative w-full h-screen">
        <ThreedimBg />
        <Terminal posts={postsData.posts} />
      </div>
    </ErrorBoundary>
  );
}

export default App;
