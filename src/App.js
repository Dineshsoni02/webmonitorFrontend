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
  //add websites to database
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
    // const res = await fetch("http://localhost:5000/website", {
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
  //fetch all websites from database
  const allWebsite = async () => {
    if (loadingWebsites) return;
    const rawToken = localStorage.getItem("Token");
    const tokens = JSON.parse(rawToken);
    const accessToken = tokens.accessToken.token;
    setLoadingWebsites(true);
    // const res = await fetch("http://localhost:5000/website", {
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
  //deletes websites from database

  const handleDelete = async (id) => {
    if (delWeb) return;
    const rawToken = localStorage.getItem("Token");
    const tokens = JSON.parse(rawToken);
    const accessToken = tokens.accessToken.token;
    setDelWeb(id);
    // const res = await fetch(`http://localhost:5000/website/${id}`, {
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
  //init function for user validation
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
      // const res = await fetch("http://localhost:5000/user/new-token", {
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

  return (
    <div className="App">
      <Toaster />

      {pageLoaded ? (
        showAuth ? (
          <Auth />
        ) : (
          <div className="inner-app">
            <div className="app-header">
              <p className="heading">Add Website for monitoring</p>
              <div className="elem">
                <label>Enter website URL</label>
                <input
                  type="text"
                  placeholder="https://google.com"
                  className="web_input"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                />
              </div>
              {errMsg && <p className="error">{errMsg}</p>}
              <button onClick={addWebsite} disabled={addWeb}>
                {addWeb ? "Adding..." : "Add"}
              </button>
            </div>

            <div className="body">
              <p className="heading">Your Websites</p>

              {loadingWebsites ? (
                <p>LOADING...</p>
              ) : (
                <div className="cards">
                  {websiteData?.length ? (
                    websiteData.map((item) => (
                      <div className="card" key={item._id}>
                        <div className="left">
                          <p
                            className={`link ${
                              item.isActive ? "green" : "red"
                            }`}
                          >
                            {item.isActive ? "ACTIVE" : "DOWN"}
                          </p>
                          <p className="url">{item.url}</p>
                        </div>

                        <div className="right">
                          <p
                            className="link red"
                            onClick={() => handleDelete(item._id)}
                          >
                            {delWeb == item._id ? "Deleting..." : "Delete"}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="avail">
                      No websites are added. Add some websites...
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      ) : (
        <div className="loading">
          <p>Loading...</p>
        </div>
      )}
    </div>
  );
}

export default App;
