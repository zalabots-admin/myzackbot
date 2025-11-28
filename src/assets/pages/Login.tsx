

import { useState } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import App from "./App";
import ParticleBackground from "../components/Background";

import '../styles/Main.css'
import '../styles/Buttons.css'
import '../styles/Objects.css'
import '@aws-amplify/ui-react/styles.css';

function Login (  ) {

  const [showLogo, setShowLogo] = useState( true );

 
  return (

    <div className='col12 align-center-center flex-column' style={{height:'100vh'}}>
      { showLogo ? (
        <ParticleBackground />
      ) : (
        <></>
      )}
      <Authenticator 
        hideSignUp>
        {({ signOut }) => (
          <App 
            oSignOut={signOut}
            oSetShowLogo={setShowLogo}
          />
        )}
      </Authenticator>
    </div>
        
  );

};

export default Login;