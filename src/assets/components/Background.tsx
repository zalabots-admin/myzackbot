

import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { type ISourceOptions } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import HeaderLogo from '../images/Logo_Default_Orange.png'


function ParticleBackground  (  ) {

  const [init, setInit] = useState(false);

  const options: ISourceOptions = useMemo(
    () => ({
        fullScreen: { enable: true, zIndex: -10 },
        background: {
            color: {
            value: '#FFFFFF',
            },
        },
        particles: {
            shape: {
                type: "circle"
            },
            number: {
                value: 25
            },
            color: {
                value: [ "#D58936", "#003399", "#005566" ]
            },
            opacity: {
                value: .3
            },
            size: {
                value: {min: 5, max: 100}
            },
            move: {
                enable: true,
                speed: .5,
                random: false,
                outModes: "bounce",
            }
        },
    }),
    [],
  );


  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

if (init) {
    return (
        <>
      {/*<Particles
        id="tsparticles"
        particlesLoaded={particlesLoaded}
        options={options}
      />*/}
      <Particles
        id="tsparticles"
        options={options}
      />
      <div style={{height:'200px', zIndex:-10}}>
        <div className='col12 align-center-left flex-row'>
          <img src={HeaderLogo} alt='ZackBot Logo' style={{height:80, paddingRight:20}} />
          <div>
            <h1>My ZackBot</h1>
            <h3>The Information Request Concierge</h3>
          </div>
        </div>
        
      </div></>
    );
  }

  
  return (

      <></>
        
  );

};

export default ParticleBackground ;