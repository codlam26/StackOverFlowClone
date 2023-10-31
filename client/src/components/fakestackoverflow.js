import React from 'react';
import QuestionList from './questionList';

export default class FakeStackOverflow extends React.Component {
  render() {
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
                <QuestionList/>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
  }
}
