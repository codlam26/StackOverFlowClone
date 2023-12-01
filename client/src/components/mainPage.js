import React, { useState, useEffect } from "react";
import QuestionList from "./questionList";
import TagsList from "./tagsList";
import AnswerList from "./answerList"
import SearchBar from "./searchbar"
import QuestionForm from "./questionForm";
import AnswerForm from "./answerForm";
import axios from "axios";
import WelcomePage from "./Welcome";

function MainPage({ isAuthenticated, user}){
    const [currentView, setCurrentView] = useState('questionList');
    const [activeLink, setActiveLink] = useState('questions');
    const [questionID, setquestionID] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [redirectWelcome, setRedirectWelcome] = useState(false);
    


    const handleSignUp = () => {
      setRedirectWelcome(true)
    }

    const handleLogOut = () => {

      setRedirectWelcome(true)
    }
    
    const navigateTo = (view) => {
        setCurrentView(view);
    }

    const updateCurrentView = (newView, questionID) => {
        setCurrentView(newView);
        setquestionID(questionID);
        setActiveLink(" ");
    }

    const updateQuestionsView = (newView, questions) => {
        setCurrentView(newView);
        setQuestions(questions);
        setActiveLink("questions");
    }

    const fetchNewestQuestions = async () => {
      try {
        const response = await axios.get('http://localhost:8000/questions/newest');
        setQuestions(response.data);
        setCurrentView('questionList');
        setActiveLink('questions');
      } catch (error) {
        console.error(error);
      }
    };

    useEffect(() => {
      fetchNewestQuestions();
    }, []);

    if(redirectWelcome){
      return <WelcomePage/>;
    } 
    return(
        <div className='page'>
      <div className="header">
        <SearchBar updatePage = {updateQuestionsView}/>
        <span style={{ display: 'flex', alignItems: 'center' , marginLeft: '50px'}}>
          {isAuthenticated ? (
            <button
              onClick={handleLogOut}
              style={{
                backgroundColor: 'rgb(0, 157, 255)',
                color: 'white',
                borderRadius: '10px',
                padding: '10px',
                fontSize: '14px',
                cursor: 'pointer',
                marginRight: '10px', 
              }}
            >
              Log Out
            </button>
          ) : (
            <button
              onClick={handleSignUp}
              style={{
                backgroundColor: 'rgb(0, 157, 255)',
                color: 'white',
                borderRadius: '10px',
                padding: '10px',
                fontSize: '14px',
                cursor: 'pointer',
                marginRight: '10px', 
              }}
            >
              Sign Up
            </button>
          )}
          <h1 style={{ marginLeft: '100px' }}> FakeStackOverflow </h1>
        </span>
      </div>

      <table  className="main">
        <tbody>
          <tr>
            <td className='column-left'>
              <div>
                <p style={{textAlign: 'center'}}>
                  <button id="questionsLink" onClick= {() => {fetchNewestQuestions();}}
                   className= {activeLink === 'questions' ? 'activeLink' : ' '}>Questions</button>  
                </p>
                <p style={{textAlign: 'center'}}>
                  <button href="#" id="tagsLink"
                  onClick={() => {navigateTo('tagsList'); setActiveLink('tags')}}
                  className= {activeLink === 'tags' ? 'activeLink' : ' '}>Tags</button>  
                </p>
              </div>
            </td>

            <td className="column-right">
                {currentView === 'questionList' &&
                    <QuestionList Questions = {questions} updatePage={updateQuestionsView} answerPage={updateCurrentView} isAuthQ={isAuthenticated}/>
                }
                {currentView === 'answerList' &&
                    <AnswerList updatePage = {updateCurrentView} question_id={questionID}/>}

                {currentView === 'tagsList' && 
                    <TagsList updatePage = {updateQuestionsView} answerPage={updateCurrentView}/>}

                {currentView === 'questionForm' &&
                    <QuestionForm updatePage = {updateQuestionsView}/>}

                {currentView === 'answerForm' && 
                    <AnswerForm updatePage = {updateCurrentView} question_id={questionID}/>}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    );
}
export default MainPage