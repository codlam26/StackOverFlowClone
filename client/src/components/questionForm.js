import React, { useState } from 'react';

function QuestionForm({onPostQuestion, displayForm, onNavigateToQuestionList}){
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [tags, setTags] = useState('');
    const [username, setUserName] = useState('');
    
    const extractHyperlinks = (text) => {
      const regex_pattern = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
      const matches = [];
      
      let match;
      while ((match = regex_pattern.exec(text))) {
        const name = match[1];
        const link = match[2];
        matches.push({ name, link });
      }
  
      return matches;
    };
    
    const renderTextWithHyperlinks = (text, hyperlinks) => {
      const components = text.split(/(\[.*?\]\(.*?\))/g);
      return components.map((part, index) => {
        if (part.match(/^\[.*\]\(.*\)$/)) {
          const hyperlink = hyperlinks.find((link) => {
            return part === `[${link.name}](${link.link})`;
          });
  
          if (hyperlink) {
            return (
              <a key={index} href={hyperlink.link} target="_blank">
                {hyperlink.name}
              </a>
            );
          }
        }
        return part;
      });
    };  

    const handlePostQuestion = () => {
      if(title.trim() === '' || text.trim() === '' || tags.trim() === '' || username.trim() === ''){
        alert('All fields are required');
        return;
      }
      const hyperlinks = extractHyperlinks(text);
      const updatedQuestionText = renderTextWithHyperlinks(text, hyperlinks)
      const newQuestion = {
        title,
        text : updatedQuestionText,
        tags,
        username
      };
      
      onPostQuestion(newQuestion);
      onNavigateToQuestionList()
      setTitle('');
      setText('');
      setTags('');
      setUserName('');
    }

    return(
        <form id="question-form" style={{display: displayForm ? 'block' : 'none'}} onSubmit={handlePostQuestion}>
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
                <button type="button" id="postQuestion" onClick={handlePostQuestion}>Post Question</button>
                <p className="mandatoryField">*indicates mandatory fields</p>
                </div>
                <div id="errorMessage" style={{color: 'red'}}></div>
        </form>
    );
}

export default QuestionForm;