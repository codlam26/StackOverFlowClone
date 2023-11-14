import React, {useState} from "react";
import axios from 'axios';

function SearchBar({updatePage}){
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (event) => {
      if (event.key === 'Enter') {
        const encodedSearchTerm = encodeURIComponent(searchTerm);

        axios.get(`http://localhost:8000/questions/searched/${encodedSearchTerm}`).then((response) =>{
          updatePage('questionList', response.data);
        })
        setSearchTerm('');
      }
    };
  
    const handleInputChange = (event) => {
      setSearchTerm(event.target.value);
    };
    return(
        <div className="search-bar">
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={handleInputChange}
        onKeyDown={handleSearch}
        />
    </div>
    ); 
}

export default SearchBar