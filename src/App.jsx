import { useEffect, useState } from "react";
import { BrowserRouter ,Route,Routes } from "react-router-dom";
import RegisterPage from "./components/register";



function App() {
  

  return (

    <BrowserRouter>
      <Routes>
        
        <Route path="/register" element={<RegisterPage/>}/>
    
          
        

      </Routes>
    </BrowserRouter>
      
   
  );
}

export default App;