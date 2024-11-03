import "./App.css";
import ThreedimBg from "./components/threedim_bg";
import Terminal from "./components/Terminal";
import postsData from "./data/posts.json";

function App() {
  return (
    <div className="relative w-full h-screen">
      <ThreedimBg />
      <Terminal posts={postsData.posts} />
    </div>
  );
}

export default App;
