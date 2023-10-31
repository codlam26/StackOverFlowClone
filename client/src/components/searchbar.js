import React, {useState} from "react";

function SearchBar({onSearch}){
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (event) => {
      if (event.key === 'Enter') {
        onSearch(searchTerm);
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

export default SearchBar;