import React, { useState, useEffect } from "react";
import QuestionList from "./questionList";
import TagsList from "./tagsList";
import AnswerList from "./answerList"
import SearchBar from "./searchbar"
import QuestionForm from "./questionForm";
import AnswerForm from "./answerForm";
import axios from "axios";

function MainPage(){
    const [currentView, setCurrentView] = useState('questionList');
    const [activeLink, setActiveLink] = useState('questions');
    const [questionID, setquestionID] = useState([]);
    const [questions, setQuestions] = useState([]);

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

    return(
        <div className='page'>
      <div className="header">
        <SearchBar updatePage = {updateQuestionsView}/>
        <span>
          <h1> FakeStackOverflow </h1>
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
                    <QuestionList Questions = {questions} updatePage={updateQuestionsView} answerPage={updateCurrentView}/>
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