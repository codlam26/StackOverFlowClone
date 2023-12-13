import React, { useState, useEffect, useCallback } from "react";
import QuestionList from "./questionList";
import TagsList from "./tagsList";
import AnswerList from "./answerList"
import SearchBar from "./searchbar"
import QuestionForm from "./questionForm";
import AnswerForm from "./answerForm";
import axios from "axios";
import WelcomePage from "./Welcome";
import UserPage from "./userPage";
import AdminPage from "./adminPage";
import TagsForm from "./tagsForm";

function MainPage({ isAuthenticated, username}){
    const [currentView, setCurrentView]= useState('questionList');
    const [activeLink, setActiveLink] = useState('questions');
    const [questionID, setquestionID] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [redirectWelcome, setRedirectWelcome] = useState(false);
    const [userId, setUserId] = useState(username ? username.userId : null);
    const [tags, setTags] = useState([]);
    const [editFeature, setEditFeature] = useState(null);
    const [isLoggedOut, setIsLoggedOut] = useState(false);
    
    useEffect(() => {
      fetchNewestQuestions();
      fetchAllTags();
    }, []); 

    const fetchAllTags = async () => {
      try {
          const response = await axios.get('http://localhost:8000/api/tags/');
          setTags(response.data);
          console.log("Tags fetched:", response.data);
      } catch (error) {
          console.error('Error fetching all tags:', error);
      }
    };

    const fetchNewestQuestions = async () => {
      try {
        const response = await axios.get('http://localhost:8000/questions/newest');
        setQuestions(response.data);
        setCurrentView('questionList');
        setActiveLink('questions');
      } catch (error) {
      }
    };  

    const handleSignUp = useCallback(() => {
      setRedirectWelcome(true)
    },[]);

    const navigateTo = (view) => {
        setCurrentView(view);
    }

    const updateUserView = (newView, newuser) => {
      setCurrentView(newView);
      setUserId(newuser);
    }

    const updateCurrentView = (newView, questionID, editAnswer) => {
        setCurrentView(newView);
        setquestionID(questionID);
        setEditFeature(editAnswer);
        setActiveLink(" ");
    }

    const updateQuestionsView = (newView, data, editQuestion) => {
      if(newView === 'tagsList'){
          setTags(data);
          setActiveLink("tags");
      }
      else if(newView === 'tagsForm'){
          setEditFeature(editQuestion);
      }
      else if (Array.isArray(data)) {
          setQuestions(data);
          setActiveLink("questions");
      } else if (data && typeof data === 'object') {
          const updatedQuestions = questions.map(q => q._id === data._id ? data : q);
          setQuestions(updatedQuestions);
          setActiveLink("questions");
      }
      setCurrentView(newView);
      setEditFeature(editQuestion);
    }
    
    const handleLogOut = async () => {
      try {
        const response = await axios.post('http://localhost:8000/logout', {}, { withCredentials: true });
        if (response.data === 'success') {
          setIsLoggedOut(true);
        }
      } catch (error) {
        console.error('Error during logout:', error);
      }
    };
  
    if (isLoggedOut) {
      return <WelcomePage />;
    }
    
    if(redirectWelcome){
      return <WelcomePage user={username}/>;
    } 

    return(
        <div className='page'>
      <div className="header">
        <SearchBar updatePage = {updateQuestionsView}/>
        <span style={{ display: 'flex', alignItems: 'center' , marginLeft: '50px'}}>
          
          {isAuthenticated && (
          <div className='user-profile'>
            <button className="user-profileButton"  onClick={() => {username.isAdmin ? navigateTo('adminPage') : navigateTo('userPage'); 
            setActiveLink('')}}> {username.username}'s Profile</button> 
          </div>)}

          {isAuthenticated ? (
            <button
              onClick={() =>{handleLogOut()}}
              className="signUpButton"
            >
              Log Out
            </button>
          ) : (
            <button
              onClick={()=> {handleSignUp()}}
              className="signUpButton"
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
                  <button id="tagsLink"
                  onClick={() => {navigateTo('tagsList'); setActiveLink('tags'); fetchAllTags()}}
                  className= {activeLink === 'tags' ? 'activeLink' : ' '}>Tags</button>  
                </p>
              </div>
            </td>

            <td className="column-right">
                {currentView === 'questionList' &&
                    <QuestionList Questions = {questions} updatePage={updateQuestionsView} answerPage={updateCurrentView} isAuthQ={isAuthenticated} user={username}/>
                }
                {currentView === 'answerList' &&
                    <AnswerList updatePage = {updateCurrentView} question_id={questionID} isAuthQ={isAuthenticated} user={username} userId={userId}/>}

                {currentView === 'tagsList' && 
                    <TagsList newTags={tags} updatePage = {updateQuestionsView} answerPage={updateCurrentView} user={username} isAuthQ={isAuthenticated} userId={userId}/>}
  
                 {currentView === 'questionForm' &&
                    <QuestionForm updatePage = {updateQuestionsView} user={username} editQuestion={editFeature}/>}

                {currentView === 'answerForm' && 
                    <AnswerForm updatePage = {updateCurrentView} question_id={questionID} user={username} editAnswer={editFeature}/>}
                
                {currentView === 'tagsForm' &&
                    <TagsForm editTag={editFeature} user={username} userId={userId} sessionUser={username} updatePage={updateQuestionsView}/>}
                
                {currentView === 'userPage' &&
                    <UserPage user_id={userId} sessionUser={username} updatePage={updateQuestionsView}/>}
                
                {currentView === 'adminPage' && username.isAdmin === true &&
                    <AdminPage user={username} updatePage={updateUserView}/>}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    );
}
export default MainPage