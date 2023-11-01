import React from 'react';
import QuestionList from './questionList';

export default class FakeStackOverflow extends React.Component {
  render() {  
  const [currentView, setCurrentView] = useState('questionList');
  const [questions, setQuestions] = useState(model.getAllQstns());
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [activeLink, setActiveLink] = useState('questions');
  const [answers, setAnswers] = useState([]);
  let [tags, setTags] = useState(model.getAllTags());

  const navigateTo = (view) => {
    setCurrentView(view);
  }
  
  const navigateToQuestionList = () => {
    setCurrentView('questionList');
  };

  const navigateToAnswerList = () => {
    setCurrentView('answerList');
  };

  const updateCurrentView = (newView, question) => {
    setCurrentView(newView);
    setSelectedQuestion(question);
    setActiveLink('questions')
  }

  const incrementViewCount = (question) => {
    model.incrementQuestionViews(question.qid);
    const updatedQuestions = model.getAllQstns();
    setQuestions(updatedQuestions)
  }

  const handleQuestionClick = (question) => {
    setSelectedQuestion(question);
    setAnswers(model.getAnswersForQuestion(question.qid))
    incrementViewCount(question)
  }

  const handleAnswer = (newAnswer, question) => {
    const success = model.addNewAnswer(newAnswer.username, newAnswer.answerText, question.qid)
    if(success === true){
      const updatedAnswers = model.getAnswersForQuestion(question.qid);
      setAnswers(updatedAnswers);
      navigateTo('answerList')
    }
  }

  const handleTagClick = (tagId) => {
    const filteredQuestions = model.getQuestionsByTag(tagId);
    setQuestions(filteredQuestions);
    navigateTo('questionList');
    setActiveLink('questions')
  } 

  const handlePostQuestion = (newQuestion) => {
      const success = model.addNewQuestion(newQuestion.title, newQuestion.text, newQuestion.tags, newQuestion.username);
      setTags(model.data.tags);
      
      console.log(model.getAllQstns());
      if(success === true){
        const updatedQuestions = model.getAllQstns();
        setQuestions(updatedQuestions);
        
     }
      else{
        alert('Does not meet requirement');
      }
  }

  const handleSearch = (searchTerm) => {
    const searchedQuestions = model.filterQuestions(searchTerm.toLowerCase());
    setQuestions(searchedQuestions);
    navigateTo('questionList');
    return (
    <div className='page'>
      <div className="header">
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
                  <a href="#" id="questionsLink">Questions</a>  
                </p>
                <p style={{textAlign: 'center'}}>
                  <a href="#" id="tagsLink">Tags</a>  
                </p>
              </div>
            </td>

            <td className="column-right">
              {console.log(questions)}
              {currentView === 'questionList' && 
              <QuestionList questions={questions} tags={tags} onClickQuestion={handleQuestionClick} onAskQuestion={updateCurrentView}/>}
              
              {currentView === 'questionForm' && 
              <QuestionForm onPostQuestion={handlePostQuestion} displayForm={true} onNavigateToQuestionList={navigateToQuestionList}/>}
              
              {currentView === 'answerList' &&
              <AnswerList question={selectedQuestion} answers={answers} onAskQuestion={updateCurrentView} displayForm={true}/>}
              
              {currentView === 'answerForm' && 
              <AnswerForm selectQuestion={selectedQuestion} postAnswer= {handleAnswer} onNavigateToAnswerList={navigateToAnswerList} displayForm={true}/>}
              
              {currentView === 'tagList' && <TagList tags={tags} onTagClick={handleTagClick} onAskQuestion={updateCurrentView}/>}
          </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
  }
}
}
