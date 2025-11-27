import { useEffect, useState } from "react";
import "./App.css";

import { Toaster, toast } from "react-hot-toast";
import Auth from "./components/auth";

function App() {
  const [pageLoaded, setPageLoaded] = useState(false);
  const [showAuth, setShowAuth] = useState(true);
  const [loadingWebsites, setLoadingWebsites] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const [websiteData, setWebsiteData] = useState([]);
  const [delWeb, setDelWeb] = useState("");
  const [addWeb, setAddWeb] = useState(false);


  function validateUrl(value) {
    return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
      value
    );
  }

  

  const addWebsite = async () => {
    if (addWeb) return;
    const rawToken = localStorage.getItem("Token");
    const tokens = JSON.parse(rawToken);
    const accessToken = tokens.accessToken.token;
    if (!inputUrl.trim()) {
      setErrMsg("Enter URL");
      return;
    }
    if (!validateUrl(inputUrl)) {
      setErrMsg("Enter Valid URL");
      return;
    }
    setErrMsg("");
    setAddWeb(true);

      const res = await fetch("https://webmonitor-backend.onrender.com/website", {
      method: "POST",
      headers: {
        Authorization: accessToken,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        url: inputUrl,
      }),
    }).catch((err) => void err);
    setInputUrl('');
    setAddWeb(false);
    console.log(inputUrl)
    const result = await res.json();
    if (!result || !result.status) {
      setErrMsg(result.message);
    }
    toast.success(result.message);
    allWebsite();
  };

  const allWebsite = async () => {
    if (loadingWebsites) return;
    const rawToken = localStorage.getItem("Token");
    const tokens = JSON.parse(rawToken);
    const accessToken = tokens.accessToken.token;
    setLoadingWebsites(true);

    const res = await fetch("https://webmonitor-backend.onrender.com/website", {
      method: "GET",
      headers: {
        Authorization: accessToken,
      },
    }).catch((err) => void err);
    setLoadingWebsites(false);
    const result = await res.json();
    if (!result || !result.status) {
      setErrMsg(result.message);
    }
    setWebsiteData(result?.data);
  };


  const handleDelete = async (id) => {
    if (delWeb) return;
    const rawToken = localStorage.getItem("Token");
    const tokens = JSON.parse(rawToken);
    const accessToken = tokens.accessToken.token;
    setDelWeb(id);

    const res = await fetch(`https://webmonitor-backend.onrender.com/website/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: accessToken,
      },
    }).catch((err) => void err);
    const result = await res.json();
    setDelWeb("");
    if (!result || !result.status) {
      setErrMsg(result.message);
    }
    toast.success(result.message);
    allWebsite();
  };

  const init = async () => {
    const rawToken = localStorage.getItem("Token");
    if (!rawToken) {
      setShowAuth(true);
      setPageLoaded(true);
      return;
    }
    const tokens = JSON.parse(rawToken);
    const accessToken = tokens.accessToken;
    const aExpiry = new Date(accessToken.expireAt);
    if (new Date() > aExpiry) {

      const res = await fetch("https://webmonitor-backend.onrender.com/user/new-token", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: tokens.refreshToken.token,
        }),
      }).catch((err) => void err);
      if (!res) {
        setShowAuth(true);
        setPageLoaded(true);
        localStorage.removeItem("Token");
        return;
      }
      const data = await res.json();
      if (!data || !data.status) {
        setShowAuth(true);
        setPageLoaded(true);
        localStorage.removeItem("Token");
        return;
      }
      const newTokens = data?.data.tokens;
      localStorage.setItem("Token", JSON.stringify(newTokens));
      setPageLoaded(true);
      setShowAuth(false);
    } else {
      setPageLoaded(true);
      setShowAuth(false);
    }
    allWebsite();
  };

  useEffect(() => {
    init();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("Token");
    window.location.reload();
  };

  return (
    <div className="App">
      <div className="grid-background"></div>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
          },
        }}
      />

      {pageLoaded ? (
        showAuth ? (
          <Auth />
        ) : (
          <div className="main-container">
            <header className="glass-panel app-header">
              <div className="logo-section">
                <h1>WebWatch</h1>
                <p className="subtitle">Monitor your websites in real-time</p>
              </div>
              <button className="btn btn-outline" onClick={handleLogout} style={{color: 'var(--text-muted)', border: '1px solid var(--border)'}}>
                Logout
              </button>
            </header>

            <div className="content-grid">
              <div className="glass-panel add-section">
                <h2>Add New Website</h2>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="https://example.com"
                    className="input-field"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                  />
                  <button className="btn btn-primary" onClick={addWebsite} disabled={addWeb}>
                    {addWeb ? "Adding..." : "Monitor Website"}
                  </button>
                </div>
                {errMsg && <p className="error-msg" style={{color: 'var(--danger)', marginTop: '10px'}}>{errMsg}</p>}
              </div>

              <div className="glass-panel list-section">
                <div className="section-header">
                  <h2>Monitored Websites</h2>
                  <span className="badge">{websiteData?.length || 0} Active</span>
                </div>

                {loadingWebsites ? (
                  <div className="loading-state">
                    <p>Syncing data...</p>
                  </div>
                ) : (
                  <div className="website-grid">
                    {websiteData?.length ? (
                      websiteData.map((item) => (
                        <div className="website-card" key={item._id}>
                          <div className="card-status">
                            <span className={`status-dot ${item.isActive ? "active" : "inactive"}`}></span>
                            <span className="status-text">{item.isActive ? "Operational" : "Down"}</span>
                          </div>
                          <p className="card-url" title={item.url}>{item.url}</p>
                          <div className="card-actions">
                            <button 
                              className="btn-icon delete-btn"
                              onClick={() => handleDelete(item._id)}
                              disabled={delWeb === item._id}
                            >
                              {delWeb === item._id ? "..." : "Delete"}
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <p>No websites being monitored yet.</p>
                        <p className="sub-text">Add your first website above to get started.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="loading-container">
          <p className="loading-text">WebWatch</p>
        </div>
      )}
    </div>
  );
}

export default App;
