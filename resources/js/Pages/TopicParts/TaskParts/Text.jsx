import { useEffect } from 'react';
import arrow_answer from '../../../../images/arrow-answer.webp';
import { router } from '@inertiajs/react';

const Text = ({task, taskNumber, answerType, 
               handleSelectChoice,
               veritifyAnswer,
               handleInputChange,
               userAnswers,
               shakingButtons,
               answerStates,
               errorHistory,
               isAdmin
            }) => {

    useEffect(() => {
        const checkAdmin = async () => {
            if (isAdmin) {
                try {
                    await axios.post('/check-user-right', { user_right: isAdmin });
                } catch {
                    router.visit('/login');
                }
            }
        }
        checkAdmin();
    }, [isAdmin]);

    return (
    <div key={task.id}>
        <h3 className="title">📝 {taskNumber + '. ' + task.description}</h3>
        <div className="questions-list">
            {task.task_options && task.task_options.map((question, index) => {
                
                if (answerType === 'choice') {
                    const textParts = question.content.split('(___)');
                    
                    return (
                        <div key={question.id} className="question-row choice-row">
                            <span className="question-number">{index + 1}.</span>
                            <div>
                                {textParts.map((part, partIndex) => {
                                    const hasGapAfter = partIndex < textParts.length - 1;
                                    
                                    const currentOptionObj = question.option_for_task_options?.find(
                                        optObj => optObj.order === partIndex
                                    );
                                    
                                    const rawOptionString = currentOptionObj ? currentOptionObj.option : '';
                                    const availableOptions = rawOptionString 
                                        ? rawOptionString.split('/').map(s => s.trim()) 
                                        : [];

                                    const current_id = currentOptionObj?.id;

                                    const currentSelectedValue = userAnswers[question.id]?.[current_id] || '';                                                

                                    return (
                                        <span key={partIndex}>
                                            {part}
                                            {hasGapAfter && (() => {
                                                const currentChoiceErrors = errorHistory[question.id]?.[current_id] || [];                                                            

                                                return (
                                                    <span className="choice-picker">
                                                        {availableOptions.map((option, optionInd) => {
                                                            const isButtonActive = currentSelectedValue === option;

                                                            const currentFieldState = answerStates[question.id]?.[current_id] || '';
                                                            const currentFieldEffect = shakingButtons[question.id]?.[current_id] || '';

                                                            const buttonStateClass = (currentFieldState === 'correct' && isButtonActive) ? 'correct' : '';
                                                            const temporaryEffectClass = (currentFieldEffect === 'shake-error' && isButtonActive) ? 'shake-error' : '';

                                                            return (
                                                                <span key={optionInd}>
                                                                    <button
                                                                        className={`${isButtonActive ? 'active' : ''} ${buttonStateClass} ${temporaryEffectClass}`}                                                                                
                                                                        disabled={currentFieldState === 'correct'}
                                                                        onClick={() => {
                                                                            handleSelectChoice(question.id, current_id, option);
                                                                            veritifyAnswer(task.id, answerType, question, current_id, option);
                                                                        }}
                                                                    >
                                                                        {option}
                                                                    </button>
                                                                    {availableOptions.length > optionInd + 1 && <span className="slash">/</span>}
                                                                </span>
                                                            );
                                                        })}

                                                        {currentChoiceErrors.length > 0 && (
                                                            <ul className="error-box">
                                                                {currentChoiceErrors.map((err, errIdx) => (
                                                                    <li key={errIdx} className="error-item">{err}</li>
                                                                ))}
                                                            </ul>
                                                        )}

                                                        {question.answer_options && isAdmin && (
                                                            <ul className="answer-box">
                                                                {question.answer_options.filter((answ_opt) => answ_opt.option_for_task_option_id === current_id).map((answer, answerId) => (                                                    
                                                                    <li key={answerId}>{answer.answer}</li>                                                    
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </span>
                                                );
                                            })()}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    );
                }
                
                if (answerType === 'input' || answerType === 'no-answer') {
                    const hasGap = question.content.includes('(___)');
                    const cleanText = question.content.replace(/\(___\)/g, '').trim();
                    const hasOwnNumeration = /^\d+\./.test(task.task_options[0].content);
                    const currentInputValue = userAnswers[question.id]?.[0] || '';

                    const inputStateClass = answerStates[question.id]?.[0] || '';
                    const inputEffectClass = shakingButtons[question.id]?.[0] || '';


                    return (
                        <div key={question.id} className="question-row input-row">
                            <div className="text-side">                                            
                                {!hasOwnNumeration && (
                                    <span className="question-number">{index + 1}.</span>
                                )}
                                <p>{cleanText}</p>
                            </div>
                            
                            {hasGap && (() => {
                                const currentInputErrors = errorHistory[question.id]?.[0] || [];

                                return (
                                    <div className='input-field'>
                                        <input 
                                            className={`${inputStateClass} ${inputEffectClass}`}
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

                                        {question.answer_options && isAdmin && (
                                            <ul className="answer-box">
                                                {question.answer_options.map((answer, answerId) => (                                                    
                                                    <li key={answerId}>{answer.answer}</li>                                                    
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

export default Text;