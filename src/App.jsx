// App.jsx

import React from 'react';
import Home from './home';
import { Routes, Route} from 'react-router-dom';
import CreateCard from './components/CreateCard';
import ViewCards from './components/ViewCards';


function App() {
  return (

    
    
      <Routes>
          <Route path = "/" element={<Home/>} />
          <Route path = "/create" element={<CreateCard/>} />
          <Route path = "/view-cards" element={<ViewCards/>} />
          
      </Routes>
    
  )
}

export default App;
