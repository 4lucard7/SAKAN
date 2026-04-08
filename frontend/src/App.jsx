import { useEffect, useState } from "react";
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
  );
}

export default App;