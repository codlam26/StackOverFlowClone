import React, { useEffect } from "react";
import axios from "axios";

function updateTagCount(){
    return model.getAllTags().length;
}

function TagsList({onTagClick, onAskQuestion}){
    const [tags, setTags] = useState([]);
    useEffect(() => {
        axios.get('https//localhost:8000/api/tags/').then((response) =>{
        setTags(response.data);
    })
    })

    return(
        <div className="tagsPage">
            <div className="flex-container">
                <h2 id="tagsHeader">{updateTagCount()} Tags</h2>
                <h1>All Tags</h1>
                <button id="askQuestionButtonTag" onClick= {() => onAskQuestion('questionForm')}>Ask Question</button>
            </div>
            
            <div id="tagList" className="tag-container">
                {tags.map((tagEntry) =>
                    <div className="tagBox" key={tagEntry.name}>
                        <a href="#" key={tagEntry.tid} onClick={() => onTagClick(tagEntry.tid)}>
                            {tagEntry.name} {console.log(tagEntry)}
                        </a>
                        <div>{model.TagQuestionCount(tagEntry.tid)} Questions</div>
                    </div>
                )}
            </div>  
        </div>
    );
}

export default TagsList;