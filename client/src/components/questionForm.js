import React, {useState, useEffect} from 'react';
import axios from 'axios';

function QuestionForm({updatePage, user, editQuestion}){
    const [title, setTitle] = useState(editQuestion?.title || '');
    const [text, setText] = useState(editQuestion?.text || '');
    const [tags, setTags] = useState('');
    const [summary, setSummary] = useState(editQuestion?.summary ||'');
    const [username, setUserName] = useState(user);
    const [allTags, setAllTags] = useState([]);
    const [textError, setTexterror] = useState(null);
    const [tagError, setTagerror] = useState(null);
    const [titleError, setTitleError] = useState(null);
    const [summaryError, setSummaryError] = useState(null);

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

    useEffect(() => {
      axios.get(`http://localhost:8000/api/tags`).then(response => {
          setAllTags(response.data);
      }).catch(error => {
          console.error(error);
      });
  }, []);

  useEffect(() => {
      if (editQuestion && editQuestion.tags) {
          const tagNames = getTagNames(editQuestion.tags);
          setTags(tagNames.join(' '));
      }
  }, [editQuestion, allTags]);

  const getTagNames = (tagIds) => {
      return tagIds.map(tagId => {
          const tag = allTags.find(t => t._id === tagId);
          return tag ? tag.name : '';
      });
  };
  
    const handlePostQuestion = (event) => {
      event.preventDefault();
      
      if(title.trim() === '' || text.trim() === '' || tags.trim() === '' || summary.trim() === ''){
        alert('All fields are required');
        return;
      }
      if(title.length > 50){
        setTitleError("The title is longer than 50 characters");
        return;
      }
      if(summary.length > 140 ){
        setSummaryError("The summary is longer than 140 characters")
        return;
      }
      if(user.reputation < 50){
        setTagerror("You have less than 50 reputation");
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
        summary,
        text : text,
        tags,
        username
      };

      if(editQuestion){
        const updatedQuestion = {title, text, tags, summary, username};
        axios.put(`http://localhost:8000/editQuestion/${editQuestion._id}`, updatedQuestion)
        .then(() => {
          axios.get('http://localhost:8000/questions/newest').then(response => {
            console.log(response.data);
            updatePage('questionList', response.data);
          })
          .catch(error => {
            console.error('Error fetching update question:', error);
          });
        })
        .catch(error => {
          console.error('Error posting question:', error);
        });
      }
      else{
        axios.post('http://localhost:8000/api/questions/askQuestion', newQuestion)
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
      }
      
      setTitle('');
      setText('');
      setTags('');
      setUserName('');
      setSummary('');
      setTexterror(null);
      setTagerror(null);
      setSummaryError(null)
      setTitleError(null);
    }
    
    return(
        <form id="question-form" onSubmit={handlePostQuestion}>
              <div>
                <label htmlFor="questionTitle">Question Title*</label>
                <br/>
                <p className="questionReq">Limit title to 50 characters or less</p>
                <input 
                 type="text" 
                 id="questionTitle" 
                 name="QuestionTitle" 
                 value={title}
                 onChange={(e)=> setTitle(e.target.value)}
                 />
                <br/>
              </div>
              <div id="errorMessage" style={{color: 'red'}}>{titleError === null ? '': titleError }</div>

              <div>  
                <label htmlFor="questionSummary">Question Summary*</label>
                <br />
                <p className="questionReq">Limit summary details to 140 characters or less </p>
                <textarea 
                id="questionSummary" 
                name="questionSummary" 
                rows = "10" 
                cols="50" required
                value={summary}
                onChange={(e)=> setSummary(e.target.value)}
                ></textarea>
                <br/>
              </div>
              <div id="errorMessage" style={{color: 'red'}}>{summaryError === null ? '': summaryError }</div>
            
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
                <p className="questionReq">Add keywords seperated by whitespace & reputation needs to be at least 50</p>
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
            
              <div className="flex-container">
                <button type="submit" id="postQuestion">Post Question</button>
                <p className="mandatoryField">*indicates mandatory fields</p>
                </div>
        </form>
    );
}

export default QuestionForm;