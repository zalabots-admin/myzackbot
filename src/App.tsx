

 interface Prop {
  oSignOut: any;
  oSetShowLogo: any;
}

function App ( props:Prop ) {


  return (
    
<div onClick={props.oSignOut}>ZackBot</div>
      
  );
  
}

export default App;

