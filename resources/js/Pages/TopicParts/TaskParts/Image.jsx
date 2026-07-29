import arrow_answer from '../../../../images/arrow-answer.webp';

const Image = ({task, taskNumber, answerType,
               veritifyAnswer,
               handleInputChange,
               userAnswers,
               shakingButtons,
               answerStates,
               errorHistory
            }) => {
        
    const count_pictures = task.task_options.length;                
    return (
        <div key={task.id}>
            <h3 className="title">📝 {taskNumber + '. ' + task.description}</h3>
            <div className={`image-block ${count_pictures == 1 ? 'one-picture' : ''}`}>

            {task.task_options && task.task_options.map((question) => {
                if (answerType === 'input' || answerType === 'no-answer') {
                    const hasGap = question.content.includes('(___)');
                    const cleanText = question.content.replace(/\(___\)/g, '').trim();
                    const currentInputValue = userAnswers[question.id]?.[0] || '';

                    const inputStateClass = answerStates[question.id]?.[0] || '';
                    const inputEffectClass = shakingButtons[question.id]?.[0] || '';


                    return (
                        <div key={question.id} className="image-column">
                            <div className="image-side">
                                <img src={`/images/task/${cleanText}`}/>
                            </div>
                            
                            {hasGap && (() => {
                                const currentInputErrors = errorHistory[question.id]?.[0] || [];

                                return (
                                    <div className={`input-field ${inputEffectClass}`}>
                                        <input 
                                            className={`${inputStateClass}`}
                                            disabled={inputStateClass === 'correct'}
                                            type="text" 
                                            placeholder="Ответ"
                                            value={currentInputValue}
                                            onChange={(e) => handleInputChange(question.id, 0, e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && 
                                                veritifyAnswer(task.id, answerType, question, null, currentInputValue)}
                                        />
                                        {inputStateClass !== 'correct' && (
                                            <button onClick={() => veritifyAnswer(task.id, answerType, question, null, currentInputValue)}><img src={arrow_answer} alt="arrow" /></button>
                                        )}

                                        {currentInputErrors.length > 0 && (
                                            <ul className="error-box">
                                                {currentInputErrors.map((err, errIdx) => (
                                                    <li key={errIdx} className="error-item">{err}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    );
                }

                return null;
                })}
            </div>
        </div>
    )
}

export default Image;