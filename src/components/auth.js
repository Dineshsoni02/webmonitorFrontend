import React, { useEffect, useState } from "react";
import "./auth.css";
import toast from "react-hot-toast";

const Auth = () => {
  const [isSignUpActive, setIsSignUpActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [btnDisable, setBtnDisable] = useState(false);

  const [inputVal, setInputVal] = useState({
    name: "",
    email: "",
    pass: "",
  });

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSignUp = async () => {
    if (btnDisable) return;

    if (!inputVal?.name.trim() || !inputVal?.email.trim() || !inputVal.pass) {
      setErrorMsg("All fields are required");
      return;
    }
    if (!validateEmail(inputVal.email)) {
      setErrorMsg("Enter valid email");
      return;
    }
    if (inputVal.pass.length < 6) {
      setErrorMsg("Password must be at least of 6 characters");
      return;
    }
    setErrorMsg("");
    setBtnDisable(true);

    const res = await fetch(
      "https://webmonitor-backend.onrender.com/user/signup",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: inputVal?.name.trim(),
          email: inputVal.email,
          password: inputVal.pass,
        }),
      }
    ).catch((err) => setErrorMsg("Error in creating user" - err.message));
    setBtnDisable(false);
    if (!res) {
      setErrorMsg("Error in creating user");
    }
    const result = await res.json();
    if (!result) {
      setErrorMsg(result.message);
    }
    toast.success(result.data.name + result.message);

    const sTokens = result.data?.tokens;
    localStorage.setItem("Token", JSON.stringify(sTokens));
    
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleLogIn = async () => {
    if (btnDisable) return;

    if (!inputVal?.email.trim() || !inputVal.pass) {
      setErrorMsg("All fields are required");
      return;
    }
    if (!validateEmail(inputVal.email)) {
      setErrorMsg("Enter valid email");
      return;
    }
    if (inputVal.pass.length < 6) {
      setErrorMsg("Password must be at least of 6 characters");
      return;
    }
    setErrorMsg("");
    setBtnDisable(true);


    const res = await fetch(
      "https://webmonitor-backend.onrender.com/user/login",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email: inputVal.email,
          password: inputVal.pass,
        }),
      }
    ).catch((err) => setErrorMsg("Error in logging of user" - err.message));
    setBtnDisable(false);

    if (!res) {
      setErrorMsg("Error in Logging of user");
    }
    const result = await res.json();

    if (!result.status) {
      setErrorMsg(result.message);
    }

    toast.success(result.data.name + " " + result.message);
    const lTokens = result.data?.tokens;
    localStorage.setItem("Token", JSON.stringify(lTokens));
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  useEffect(() => {
    setInputVal({});
  }, [isSignUpActive]);

  const signUpDiv = (
    <div className="glass-panel auth-card">
      <div className="auth-header">
        <h2>Create Account</h2>
        <p className="subtitle">Start monitoring your websites today</p>
      </div>
      
      <div className="auth-form">
        <div className="input-group">
          <label>Name</label>
          <input
            type="text"
            className="input-field"
            placeholder="John Doe"
            value={inputVal.name}
            key="a"
            onChange={(e) =>
              setInputVal((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        </div>
        <div className="input-group">
          <label>E-mail</label>
          <input
            type="text"
            className="input-field"
            key="b"
            placeholder="john@example.com"
            value={inputVal.email}
            onChange={(e) =>
              setInputVal((prev) => ({ ...prev, email: e.target.value }))
            }
          />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            key="c"
            className="input-field"
            placeholder="••••••••"
            value={inputVal.pass}
            onChange={(e) =>
              setInputVal((prev) => ({ ...prev, pass: e.target.value }))
            }
          />
        </div>
        
        {errorMsg && <p className="error-msg">{errorMsg}</p>}
        
        <button className="btn btn-primary full-width" onClick={handleSignUp} disabled={btnDisable}>
          {btnDisable ? "Creating Account..." : "Sign Up"}
        </button>
        
        <div className="auth-footer">
          <p>Already have an account? <span className="link-text" onClick={() => setIsSignUpActive(false)}>Login</span></p>
        </div>
      </div>
    </div>
  );

  const logInDiv = (
    <div className="glass-panel auth-card">
      <div className="auth-header">
        <h2>Welcome Back</h2>
        <p className="subtitle">Login to access your dashboard</p>
      </div>

      <div className="auth-form">
        <div className="input-group">
          <label>E-mail</label>
          <input
            type="text"
            className="input-field"
            key="d"
            placeholder="john@example.com"
            value={inputVal.email}
            onChange={(e) =>
              setInputVal((prev) => ({ ...prev, email: e.target.value }))
            }
          />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            className="input-field"
            key="e"
            value={inputVal.pass}
            placeholder="••••••••"
            onChange={(e) =>
              setInputVal((prev) => ({ ...prev, pass: e.target.value }))
            }
          />
        </div>
        
        {errorMsg && <p className="error-msg">{errorMsg}</p>}

        <button className="btn btn-primary full-width" onClick={handleLogIn} disabled={btnDisable}>
          {btnDisable ? "Logging in..." : "Login"}
        </button>
        
        <div className="auth-footer">
          <p>New here? <span className="link-text" onClick={() => setIsSignUpActive(true)}>Create Account</span></p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="auth-container">{isSignUpActive ? signUpDiv : logInDiv}</div>
  );
};

export default Auth;
