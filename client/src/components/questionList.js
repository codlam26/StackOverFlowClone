import React, {useState, useEffect} from "react";
import axios from "axios";


function formatQuestionDate(askDate2){
    const months = ['January' , 'February', 'March', 'April', 'May', 'June',
         'July', 'August', 'September', 'October', 'November', 'December'];
         const currentDate = new Date();
         const askDate = new Date(askDate2);
       
         const timeDifference = Math.floor((currentDate - askDate) / 1000);
       
         if (timeDifference < 60) {
           return `${timeDifference} second${timeDifference > 1 ? 's' : ''} ago`;
         } 
         else if (timeDifference < 3600) {
           const minutes = Math.floor(timeDifference / 60);
           return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
         } 
         else if (timeDifference < (3600 * 24)) {
           const hours = Math.floor(timeDifference / 3600);
           return `${hours} hour${hours > 1 ? 's' : ''} ago`;
         } 
         else if (timeDifference < (3600 * 24 * 60)) {
           const day = askDate.getDate();
           const hours = askDate.getHours().toString().padStart(2, '0');
           const minutes = askDate.getMinutes().toString().padStart(2, '0');
           return `on ${months[askDate.getMonth()]} ${day} at ${hours}:${minutes}`;
         } else {
           const year = askDate.getFullYear();
           const month = months[askDate.getMonth()];
           const day = askDate.getDate();
           const hours = askDate.getHours().toString().padStart(2, '0');
           const minutes = askDate.getMinutes().toString().padStart(2, '0');
           return `${month} ${day}, ${year} at ${hours}:${minutes}`;
         }
       }

function QuestionList({Questions, updatePage, answerPage, isAuthQ}){
    const [activeButton, setActiveButton] = useState('');
    const [tags, setTags] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [votes, setVotes] = useState({});
    const questionsPerPage = 5;

    useEffect(async () => {
      const fetchData = async () => {
        let response;
        if (activeButton === 'newest') {
          response = await axios.get('http://localhost:8000/questions/newest');
        }
        else if(activeButton === 'active'){
          response = await axios.get('http://localhost:8000/questions/active')
        } 
        else if (activeButton === 'unanswered') {
          response = await axios.get('http://localhost:8000/questions/unanswered');
        }
        if (response) {
          updatePage('questionList', response.data);
        }
        console.log('Response from server:', response);
        if (response && response.data){
          const initialVotes = await Promise.all(
            response.data.map(async (questionEntry) => ({
              questionId: questionEntry._id,
              votes: await getVotes(questionEntry._id),
            }))
          );
    
          setVotes((prevVotes) => {
            const newVotes = { ...prevVotes };
            initialVotes.forEach(({ questionId, votes }) => {
              newVotes[questionId] = votes;
            });
            return newVotes;
          });
        }
        
      }

      

      const findTags = async () => {
        try{
          const tags = await axios.get(`http://localhost:8000/api/tags`)
          setTags(tags.data);
         }
         catch(error){
          console.error(error);
         }
      }
      
      fetchData();
      findTags();
    }, [activeButton, updatePage, currentPage]);

    const paginate = (pageNumber) => {
      setCurrentPage(pageNumber);
    };

    const handleVote = async (questionId, type) => {
      console.log('Voting for questionId:', questionId, 'with type:', type);
      try {
        const response = await axios.post(`http://localhost:8000/questions/vote/${questionId}`, { voteType: type });
        console.log('Response from server:', response);
        setVotes((prevVotes) => ({ ...prevVotes, [questionId]: response.data.question.votes }));
        console.log('After vote - Updated votes state:', votes);
      } catch (error) {
        console.error('Error during vote:', error);
      }
    };
    
    
    
    const getVotes = async (questionId) => {
      try {
        const votesResponse = await axios.get(`http://localhost:8000/questions/votes/${questionId}`);
        console.log('Response from server:', votesResponse);
        return votesResponse.data.votes;
      } catch (error) {
        console.error("Error fetching votes:", error);
        return { upvotes: 0, downvotes: 0 };
      }
    };
    
    const updateVotes = async (question) => {
      const updatedVotes = await Promise.all(
        Questions.map(async (questionEntry) => ({
          questionId: questionEntry._id,
          votes: await getVotes(questionEntry._id),
        }))
      );
    
      setVotes((prevVotes) => {
        const newVotes = { ...prevVotes };
        updatedVotes.forEach(({ questionId, votes }) => {
          newVotes[questionId] = votes;
        });
        if (question && question._id) {
          newVotes[question._id] = question.votes;
        }
        return newVotes;
      });
    };
    
  
      

    const indexOfLastQuestion = currentPage * questionsPerPage;
    const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
    const currentQuestions = Questions.slice(indexOfFirstQuestion, indexOfLastQuestion);

    const getTagNames = (tagIds) => {
      return tagIds.map((tagId) => {
        const tag = tags.find((t) => t._id === tagId);
        return tag ? tag.name: ''
      });
    };

    return(
        <div>
            <div className="flex-container">
              <div><h2>All Questions</h2></div>
                <div>
                  {isAuthQ && (<button id="askQuestionButton" onClick={() => {answerPage("questionForm", Questions)}}>Ask Question</button>)}
                </div>
            </div>

            <div className="flex-container">
                <div id="question-counter"><h2>{Questions.length} Questions</h2></div>
                  <div className="sortingButtons">
                    <button onClick={() => setActiveButton('newest')}
                    className={activeButton === 'newest' ? 'activeButton2' : 'noneActiveButton'}>Newest</button>
                    
                    <button onClick={() => setActiveButton('active')}
                    className={activeButton === 'active' ? 'activeButton2' : 'noneActiveButton'}>Active</button>
                    
                    <button onClick= {() => setActiveButton('unanswered')}
                    className={activeButton === 'unanswered' ? 'activeunansweredButton' : 'unactiveunansweredButton'}>Unanswered</button>
                  </div>
            </div>

        <div className="question-list" >
              {currentQuestions.length > 0 ? (
              currentQuestions.map((questionEntry)=> (
          <div className="question-entry" key={questionEntry._id}>

          <div className="right-column2">
                <div className="question_stats">{questionEntry.views} views </div>
                <div className="question_stats">{questionEntry.answers.length} answers </div>
                <button onClick={() => handleVote(questionEntry._id, 'upvote')}>⬆️</button>
                <span>{(votes[questionEntry._id] && votes[questionEntry._id].upvotes) || 0} - {(votes[questionEntry._id] && votes[questionEntry._id].downvotes) || 0}</span>
                <button onClick={() => handleVote(questionEntry._id, 'downvote')}>⬇️</button>
          </div>
    
          <div className="middle-column">
            <div className= "question_title"> <button 
            className="answersLink" 
            id= {questionEntry._id} 
            key={questionEntry._id}
            onClick = {async () => {await axios.patch('http://localhost:8000/questions/incrementViews/' + questionEntry._id);
            answerPage("answerList", questionEntry._id)
          }}
            >{questionEntry.title}</button></div>
            <div>
              {getTagNames(questionEntry.tags).map((tagName, index) => (
                  <span key={index} className="tag">{tagName}</span>
              ))}
            </div>
          </div>
          
          <div className="left-column2">
            <div className = "question_metadata">
              <span className ="askedBy">
              {questionEntry.asked_by}</span> asked {formatQuestionDate(questionEntry.ask_date_time)}
            </div>  
          </div>

          </div>
              ))
              ) : (
                  <div id="noQuestions">
                      <h1 className="noQuestionHeading">No Questions Found</h1>
                  </div>
              )}
          </div>
          <div className="pagination">
            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
              Previous
            </button>
            
            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === Math.ceil(Questions.length / questionsPerPage)}>
              Next
            </button>
            <span> Page: {currentPage}</span>
          </div>
        </div>
    );
}

export default QuestionList;