
import { useState } from 'react';
import { ThemeProvider, createTheme, Authenticator } from "@aws-amplify/ui-react";
import Logo from '../images/Logo_Default_White.png'
import MobileLogo from '../images/ZBT_Logo_Default.png'
import ZackBot from "./ZackBot";


import '../styles/Main.css'
import '../styles/Buttons.css'
import '../styles/Objects.css'
import '@aws-amplify/ui-react/styles.css';

const theme = createTheme({
  name: 'custom-auth-theme',
  tokens: {
    components: {
      card: {
        outlined: {
          borderWidth: '0',
          boxShadow: 'none',
        },
      },
      button: {
        primary: {
          backgroundColor: '#EB7100',
          color: '#FFFFFF',
          _hover: {
            backgroundColor: '#3F5A4C',
          },
          _focus: {
            backgroundColor: '#3F5A4C',
          },
          _active: {
            backgroundColor: '#2F4338',
          },
        },
        link: {
          backgroundColor: '#FFFFFF',
          color: '#4E6E5D',
          _hover: {
            backgroundColor: '#FFFFFF',
          },
          _focus: {
            backgroundColor: '#FFFFFF',
          },
          _active: {
            backgroundColor: '#FFFFFF',
          },
        },
      },

    },
  },
});

function Login (  ) {

  const [showLogIn, setShowLogIn] = useState( true );
  const [mainLayout, setMainLayout] = useState( 'lg:w-[40%] lg:h-full h-1/2 flex items-center justify-center' );

  return (

    <div className="flex flex-col lg:flex-row items-center justify-center h-dvh w-full overflow-hidden">
      { showLogIn &&  
        <>
      <div className="hidden lg:flex w-[60%] h-full flex items-center justify-center bg-[#EB7100]">
        <img src={Logo} alt="Zalabots Logo" className="w-1/5"/>
        <div className="text-white ml-5 mt-8">
          <p className="text-8xl">ZACK<span className="font-bold">BOT</span></p>
          <p className="text-4xl">The Information Request Concierge</p>
        </div>
      </div>
      <div className="lg:hidden flex flex-col items-center justify-center w-full bg-white mb-10">
        <img src={MobileLogo} alt="Zalabots Logo" className="w-1/4"/>
        <p className="text-[#EB7100] text-4xl ml-3">ZACK<span className="font-bold">BOT</span></p>
        <p className="text-gray-500 text-lg mt-2">The Information Request Concierge</p>
      </div>     
      </>   
      }

      <div className={mainLayout}>
        <ThemeProvider theme={theme}>
          <Authenticator 
            hideSignUp>
            {({ signOut }) => (
              <ZackBot 
                oSignOut={signOut}
                oSetShowLogIn={setShowLogIn}
                oSetMainLayout={setMainLayout}
              />
            )}
          </Authenticator>
        </ThemeProvider>
      </div>
    </div>
        
  );

};

export default Login;