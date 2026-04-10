import { useEffect, useState } from "react";
<<<<<<< HEAD:frontend/src/App.jsx
import axios from "axios";

function App() {
  const [data, setData] = useState("");

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/test")
      .then(res => {
        setData(res.data.message);
      })
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-blue-600">
        {data}
      </h1>
    </div>
=======
import { BrowserRouter ,Route,Routes } from "react-router-dom";
import RegisterPage from "./components/register";



function App() {
  

  return (

    <BrowserRouter>
      <Routes>
        
        <Route path="/register" element={<RegisterPage/>}/>
    
          
        

      </Routes>
    </BrowserRouter>
      
   
>>>>>>> 36c14119c264e108cccbdfe4ead065d1a7302823:src/App.jsx
  );
}

export default App;