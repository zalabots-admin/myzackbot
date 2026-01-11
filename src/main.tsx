

import * as React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ReactDOM from "react-dom/client";
//import ZackBot from "./assets/pages/ZackBot"
import LogIn from "./assets/pages/LogIn"
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import Task from "../src/assets/pages/Task";

import './assets/styles/ZackBot.css'

Amplify.configure(outputs);

function MyRoutes() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/request/:requestId/task/:taskId" element={<Task />}></Route>
        <Route path="/" element={<LogIn/>}></Route>
      </Routes>
    </BrowserRouter>
  );

}

ReactDOM.createRoot(document.getElementById("root")!).render(

  <React.StrictMode>
    <MyRoutes />
  </React.StrictMode>
  
);