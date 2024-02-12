// App.jsx

import React from 'react';
import Home from './home';
import { Routes, Route} from 'react-router-dom';
import CreateCard from './components/CreateCard';


function App() {
  return (

    
    
      <Routes>
          <Route path = "/" element={<Home/>} />
          <Route path = "/create" element={<CreateCard/>} />
          
      </Routes>
    
  )
}

export default App;
