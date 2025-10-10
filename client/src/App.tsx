import { BrowserRouter, Route, Routes } from "react-router";
import { Home } from "./presentation/Home";
import { Login } from "./presentation/Login";

import { Signup } from "./presentation/Signup";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
