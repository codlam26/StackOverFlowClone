import React, {useState} from 'react';
import axios from 'axios';

function AnswerForm({updatePage, question_id, user, editAnswer}){
      const [username, setUsername] = useState(user.userId);
      const [answerText, setAnswerText] = useState(editAnswer?.text || "");
      const [hyperlinkError, setHyperlinkError] = useState(null);
      
      const extractHyperlinks = (text) => {
        const regex_pattern = /\[([^\]]+)\]\(([^)]+)\)/g;
        const matches = [];
        
        let match;
        while ((match = regex_pattern.exec(text))) {
          const name = match[1];
          const link = match[2];
          matches.push({ name, link });
        }
        console.log(matches);
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

      const handleAnswer = (event) => {
        event.preventDefault();
        if (answerText.trim() === ""){
          alert("All fields required");
          return;
        } 

        const hyperlinks = extractHyperlinks(answerText);
        if (!validateHyperlinks(hyperlinks)) {
          const errorMessage = "Invalid hyperlink format. Hyperlinks must be in the format [name](https://example.com)";  
          setHyperlinkError(errorMessage);
          return;
        }
        
        const newAnswer = {
        qId: question_id,
        username, 
        answerText: answerText,
        };
        if(editAnswer){
          const updatedAnswer = {answerText, username};
          axios.put(`http://localhost:8000/answers/editAnswer/${editAnswer._id}`, updatedAnswer)
            .then(() => {
              updatePage('answerList', question_id);
        });
        }
        else{
          axios.post('http://localhost:8000/api/answers/answerQuestion', newAnswer)
          .then(() => {
            updatePage('answerList', question_id);
        });
        }
        setUsername('');
        setAnswerText('')
        setHyperlinkError(null)
      }


    return(
            <form id="answer-form" onSubmit={handleAnswer}>

              <div>  
                <label htmlFor="answerText">Answer Text*</label>
                <br/>
                <textarea id="answerText" 
                name="answerText" 
                rows = "10" 
                cols="50" required
                value={answerText}
                onChange={(e) => {setAnswerText(e.target.value)}}></textarea>
                <br/>
                <div className="error-Message" id="answer-text-error">{hyperlinkError}</div>
              </div>

              <div className="flex-container">
                <button type="submit" id="postAnswer" 
                >Post Answer</button>
                <p className="mandatoryField">*indicates mandatory fields</p>
                </div>
            </form> 
    );
}

export default AnswerForm