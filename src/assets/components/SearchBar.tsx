

import '../styles/Search.css'

interface Prop {
    oSearchedValue: string;
    oSetSearchedValue: any;
}

function SearchBar ( props:Prop ) {

    return (

        <div className='search-bar'>
          <i className={"fa-sharp fa-thin fa-magnifying-glass search-bar-icon"}></i>
          <input className='search-bar-input' onChange={(e) => props.oSetSearchedValue(e.target.value)} placeholder='Enter Search Value...' value={props.oSearchedValue}/>
          {props.oSearchedValue.valueOf().length > 0 && <i className="fa-sharp fa-thin fa-xmark search-bar-icon cancel-icon" onClick={() => {props.oSetSearchedValue("")}}></i>}
        </div>

    );

};

export default SearchBar;