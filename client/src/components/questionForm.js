import React, {useState} from 'react';
import axios from 'axios';

function QuestionForm({updatePage}){
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [tags, setTags] = useState('');
    const [username, setUserName] = useState('');
    const [textError, setTexterror] = useState(null);
    const [tagError, setTagerror] = useState(null);

    const extractHyperlinks = (text) => {
      const regex_pattern = /\[([^\]]+)\]\(([^)]+)\)/g;
      const matches = [];
      
      let match;
      while ((match = regex_pattern.exec(text))) {
        const name = match[1];
        const link = match[2];
        matches.push({ name, link });
      }
  
      return matches;
    };

    const validateHyperlinks = (hyperlinks) => {
      for (const hyperlink of hyperlinks) {
        if (hyperlink.name.trim() === "" || !hyperlink.link.match(/^https?:\/\//)) {
          return false;
        }
      }
      return true;
    };
    
    const handlePostQuestion = (event) => {
      event.preventDefault();
      
      if(title.trim() === '' || text.trim() === '' || tags.trim() === '' || username.trim() === ''){
        alert('All fields are required');
        return;
      }

      let tagslist = tags.toLowerCase().split(' ');
      if(tagslist.length > 5){
        setTagerror("The question cannot have more than 5 tags")
        return;
      }
      else{
        for(const tag of tagslist){
          if(tag.length > 10){
            setTagerror("Tags cannot have more than 10 characters.")
            return;
          }
        }
      }
  
      const hyperlinks = extractHyperlinks(text);
        if (!validateHyperlinks(hyperlinks)) {
          const errorMessage = "Invalid hyperlink format. Hyperlinks must be in the format [name](https://example.com)";  
          setTexterror(errorMessage);
          return;
        }

      const newQuestion = {
        title,
        text : text,
        tags,
        username
      };

      axios.post('http://localhost:8000/api/questions/askQuestion', newQuestion,)
      .then(() => {
        axios.get('http://localhost:8000/questions/newest').then(response => {
          updatePage('questionList', response.data);
        })
        .catch(error => {
          console.error('Error fetching updated question:', error);
        });
      })
      .catch(error => {
        console.error('Error posting question:', error);
      });

      setTitle('');
      setText('');
      setTags('');
      setUserName('');
      setTexterror(null);
      setTagerror(null);
    }

    return(
        <form id="question-form" onSubmit={handlePostQuestion}>
              <div>
                <label htmlFor="questionTitle">Question Title*</label>
                <br/>
                <p className="questionReq">Limit title to 100 characters or less</p>
                <input 
                 type="text" 
                 id="questionTitle" 
                 name="QuestionTitle" 
                 maxLength={100}
                 value={title}
                 onChange={(e)=> setTitle(e.target.value)}
                 />
                <br/>
              </div>

              <div>  
                <label htmlFor="questionText">Question Text*</label>
                <br />
                <p className="questionReq">Details</p>
                <textarea 
                id="questionText" 
                name="questionText" 
                rows = "10" 
                cols="50" required
                value={text}
                onChange={(e)=> setText(e.target.value)}
                ></textarea>
                <br/>
              </div>
              <div id="errorMessage" style={{color: 'red'}}>{textError === null ? '': textError }</div>
              
              <div>
                <label htmlFor="tags">Tags*</label>
                <br/>
                <p className="questionReq">Add keywords seperated by whitespace</p>
                <input 
                  type="text" 
                  id="tags" 
                  name="tags" 
                  maxLength={50}
                  value={tags}
                  onChange={(e)=> setTags(e.target.value)}
                  />
                <br/>
              </div>
              <div id="errorMessage" style={{color: 'red'}}>{tagError === null ? '' : tagError}</div>
              
              <div>
                <label htmlFor="username">Username*</label>
                <br/>
                <input 
                  type="text" 
                  id="username" 
                  name="username" required
                  value={username}
                  onChange={(e)=> setUserName(e.target.value)}
                  />
                <br/>
              </div>

              <div className="flex-container">
                <button type="submit" id="postQuestion">Post Question</button>
                <p className="mandatoryField">*indicates mandatory fields</p>
                </div>
        </form>
    );
}

export default QuestionForm;