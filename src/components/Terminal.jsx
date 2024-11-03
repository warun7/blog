import { useState, useEffect, useRef } from "react";
import "./Terminal.css";

const Terminal = ({ posts }) => {
  const [commandHistory, setCommandHistory] = useState([]);
  const [currentCommand, setCurrentCommand] = useState("");
  const [showSystemInfo, setShowSystemInfo] = useState(true);
  const [pastCommands, setPastCommands] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef(null);
  const contentRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileInput, setShowMobileInput] = useState(false);
  const mobileInputRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [commandHistory, currentCommand]);

  useEffect(() => {
    const handleClick = () => {
      terminalRef.current?.focus();
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    if (posts && posts.length > 0) {
      const latestPost = posts[posts.length - 1];
      const output = (
        <div className="post-content">
          <h2>{latestPost.title}</h2>
          <div className="post-meta">
            <span className="date">[{latestPost.date}]</span>
            <span className="tags">{latestPost.tags.join(", ")}</span>
          </div>
          <p>{latestPost.content}</p>
        </div>
      );
      setCommandHistory([
        {
          command: `cat ${latestPost.filename}`,
          output,
        },
      ]);
    }
  }, [posts]);

  const clearTerminal = () => {
    setCommandHistory([]);
    setShowSystemInfo(false);
    setCurrentCommand("");
    setPastCommands([]);
    setHistoryIndex(-1);
  };

  const handleCommand = (command) => {
    const cmd = command.toLowerCase().trim();
    let output = "";

    if (cmd !== "") {
      setPastCommands((prev) => [...prev, cmd]);
      setHistoryIndex(-1);
    }

    switch (cmd) {
      case "ls":
      case "ls posts":
        output = (
          <div className="ls-output">
            {posts.map((post) => (
              <div key={post.id} className="file">
                <span className="file-name">{post.filename}</span>
                <span className="file-date">{post.date}</span>
              </div>
            ))}
          </div>
        );
        break;

      case "clear":
      case "cls":
        clearTerminal();
        return;

      case "whoami":
        output = (
          <div className="whoami-output">
            <span className="user-info">cydef plaksha</span>
          </div>
        );
        break;

      case "help":
        output = (
          <div className="help-output">
            Available commands:
            <br />
            ls - List all posts
            <br />
            cat [filename] - Read specific post
            <br />
            clear/cls - Clear terminal
            <br />
            whoami - Display user information
            <br />
            help - Show this help message
            <br />
            neofetch - Show system info
            <br />
            <br />
            Use ↑/↓ arrows to navigate command history
          </div>
        );
        break;

      case "neofetch":
        if (!showSystemInfo) {
          setShowSystemInfo(true);
        } else {
          output = (
            <span className="error">System info is already displayed</span>
          );
        }
        break;

      default:
        if (cmd.startsWith("cat ")) {
          const filename = cmd.split(" ")[1];
          const post = posts.find((p) => p.filename === filename);
          if (post) {
            output = (
              <div className="post-content">
                <h2>{post.title}</h2>
                <div className="post-meta">
                  <span className="date">[{post.date}]</span>
                  <span className="tags">{post.tags.join(", ")}</span>
                </div>
                <p>{post.content}</p>
              </div>
            );
          } else {
            output = <span className="error">File not found: {filename}</span>;
          }
        } else if (cmd !== "") {
          output = <span className="error">Command not found: {cmd}</span>;
        }
    }

    if (output || cmd !== "") {
      setCommandHistory((prev) => [...prev, { command, output }]);
    }
    setCurrentCommand("");
  };

  const handleKeyDown = (e) => {
    switch (e.key) {
      case "Enter":
        handleCommand(currentCommand);
        break;
      case "ArrowUp":
        e.preventDefault();
        if (pastCommands.length > 0) {
          const newIndex = historyIndex + 1;
          if (newIndex < pastCommands.length) {
            setHistoryIndex(newIndex);
            setCurrentCommand(pastCommands[pastCommands.length - 1 - newIndex]);
          }
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          setCurrentCommand(pastCommands[pastCommands.length - 1 - newIndex]);
        } else if (historyIndex === 0) {
          setHistoryIndex(-1);
          setCurrentCommand("");
        }
        break;
      default:
        // Handle printable characters
        if (e.key.length === 1) {
          setCurrentCommand((prev) => prev + e.key);
        } else if (e.key === "Backspace") {
          setCurrentCommand((prev) => prev.slice(0, -1));
        }
    }
  };

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle mobile input focus
  const handleTerminalClick = () => {
    if (isMobile) {
      setShowMobileInput(true);
      setTimeout(() => {
        mobileInputRef.current?.focus();
      }, 100);
    } else {
      terminalRef.current?.focus();
    }
  };

  // Handle mobile input submission
  const handleMobileSubmit = (e) => {
    e.preventDefault();
    handleCommand(currentCommand);
    setCurrentCommand('');
    // Keep the input visible and focused after submission
    mobileInputRef.current?.focus();
  };

  return (
    <div className="terminal-container">
      <div
        className="terminal"
        ref={terminalRef}
        tabIndex={0}
        onClick={handleTerminalClick}
        onKeyDown={!isMobile ? handleKeyDown : undefined}
      >
        <div className="terminal-header">
          <span className="terminal-title">[user@arch ~]$</span>
        </div>
        <div className="terminal-content" ref={contentRef}>
          {showSystemInfo && (
            <div className="neofetch-info">
              <pre className="arch-logo">
                {`
                     /\\
                    /  \\
                   /\\   \\
                  /  __  \\
                 /  (  )  \\
                / __|  |__\\\\
               /.\'        \\.\\
                `}
              </pre>
              <div className="system-info">
                <span className="user-host">user@arch</span>
                <span className="separator">-----------------</span>
                <span>OS: Arch Linux x86_64</span>
                <span>Shell: zsh 5.9</span>
                <span>Blog Posts: {posts.length}</span>
              </div>
            </div>
          )}

          {commandHistory.map((entry, index) => (
            <div key={index}>
              <div className="terminal-prompt">
                <span className="prompt">[user@arch ~]$</span>
                <span className="command"> {entry.command}</span>
              </div>
              {entry.output}
            </div>
          ))}

          <div className="terminal-prompt">
            <span className="prompt">[user@arch ~]$</span>
            <span className="command"> {currentCommand}</span>
            <span className="cursor">█</span>
          </div>
        </div>

        {isMobile && (
          <div className="mobile-input-container">
            <input
              ref={mobileInputRef}
              type="text"
              className="mobile-input"
              value={currentCommand}
              onChange={(e) => setCurrentCommand(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleMobileSubmit(e);
                }
              }}
              placeholder="Type command..."
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
            />
          </div>
        )}
      </div>
      <div className="terminal-hint">
        Note: Interactive shell. Type <span className="command-hint">help</span>{" "}
        for more info.
        {isMobile && <div>Tap terminal to start typing</div>}
      </div>
    </div>
  );
};

export default Terminal;
