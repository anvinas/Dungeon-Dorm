import React, { useState } from 'react';

function Login() {
  const [message, setMessage] = useState('');
  const [loginName, setLoginName] = React.useState('');
  const [loginPassword, setPassword] = React.useState('');

  // THIS IS THE CORRECTED doLogin function
  async function doLogin(event: any): Promise<void> {
    event.preventDefault(); // Prevents the default form submission behavior

    var obj = { login: loginName, password: loginPassword };
    var js = JSON.stringify(obj);

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' },
      });

      var res = JSON.parse(await response.text());

      if (res.id <= 0) {
        setMessage('User/Password combination incorrect');
      } else {
        var user = { firstName: res.firstName, lastName: res.lastName, id: res.id };
        localStorage.setItem('user_data', JSON.stringify(user));
        setMessage('');
        window.location.href = '/cards'; // Redirect to /cards on successful login
      }
    } catch (error: any) {
      alert(error.toString()); // Display error in an alert
      return;
    }
  }

  function handleSetLoginName(e: any): void {
    setLoginName(e.target.value);
  }

  function handleSetPassword(e: any): void {
    setPassword(e.target.value);
  }

  return (
    <div id="loginDiv">
      <span id="inner-title">PLEASE LOG IN</span>
      <br />
      <input
        type="text"
        id="loginName"
        placeholder="Username"
        onChange={handleSetLoginName}
      />
      <br />
      <input
        type="password"
        id="loginPassword"
        placeholder="Password"
        onChange={handleSetPassword}
      />
      <br />
      <input
        type="submit"
        id="loginButton"
        className="buttons"
        value="Do It"
        onClick={doLogin} // This now calls the full async doLogin function
      />
      <span id="loginResult">{message}</span>
    </div>
  );
}

export default Login;