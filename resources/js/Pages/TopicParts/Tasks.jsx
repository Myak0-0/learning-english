import { useEffect, useState } from "react";
import axios from "axios";

import Error from "../AdditionaFiles/Error";
import TextPage from "./TaskParts/Text";
import ImagePage from "./TaskParts/Image";
import AudioPage from "./TaskParts/Audio";
import VideoPage from "./TaskParts/Video";

const Tasks = ({ tasks, currentUserId, command: handleTheoryAudioPlay, listIds, lastUpdated }) => {
    const [userAnswers, setUserAnswers] = useState({});    
        
    const [shakingButtons, setShakingButtons] = useState({});
        
    const [answerStates, setAnswerStates] = useState({});
    const [errorHistory, setErrorHistory] = useState({});

    const [errorMessage, setErrorMessage] = useState(null);

    let maxUpdatedAt = lastUpdated;

    useEffect(() => {
        if (!tasks) return;

        const initialAnswers = {};
        const initialStates = {};
        const initialErrors = {};

        tasks.forEach(task => {
            const answerType = task.type_of_answer.name;
            if (!task.task_options) return;
            
            task.task_options.forEach(question => {
                if (!question.task_answers || question.task_answers.length === 0) return;

                const qId = question.id;
                initialAnswers[qId] = {};
                initialStates[qId] = {};
                initialErrors[qId] = {};
                
                question.task_answers.forEach(ansRecord => {
                    const isAnsCorrect = ansRecord.is_correct === true || ansRecord.is_correct === 1;
                    
                    let stateKey;
                    if (answerType === 'choice') {
                        stateKey = ansRecord.option_for_task_option_id;
                    } else {
                        stateKey = 0;
                    }

                    if (!stateKey && answerType === 'choice') return;

                    if (isAnsCorrect) {                        
                        initialAnswers[qId][stateKey] = ansRecord.answer;
                        if (answerType != 'no-answer') {
                            initialStates[qId][stateKey] = 'correct';
                        }
                    } else {                        
                        if (!initialErrors[qId][stateKey]) {
                            initialErrors[qId][stateKey] = [];
                        }
                        const cleanedErrValue = cleanText(ansRecord.answer);
                        if (!initialErrors[qId][stateKey].includes(cleanedErrValue)) {
                            initialErrors[qId][stateKey].push(cleanedErrValue);
                        }
                    }
                });
            });
        });

        setUserAnswers(initialAnswers);
        setAnswerStates(initialStates);
        setErrorHistory(initialErrors);
    }, [tasks]);

     useEffect(() => {
        if (!tasks || tasks.length === 0) return;

        const getAnswerTypeAndQuestion = (qId) => {
            let foundType = 'choice';
            tasks.forEach(task => {
                if (!task.task_options) return;
                if (task.task_options.some(q => q.id === qId)) {
                    foundType = task.type_of_answer?.name || 'choice';
                }
            });
            return foundType;
        };

        const fetchNewAnswers = async () => {
            try {
                const response = await axios.post('/get-new-answers', {
                    list_ids: listIds, 
                    user_id: currentUserId,
                    last_updated: maxUpdatedAt
                });
                
                const newAnswersList = response.data?.new_answers;
                if (!newAnswersList || newAnswersList.length === 0) return;

                const updatedAnswers = {};
                const updatedStates = {};
                const updatedErrors = {};

                newAnswersList.forEach(ansRecord => {
                    maxUpdatedAt = ansRecord.updated_at;
                    
                    const qId = ansRecord.task_option_id; 
                    if (!qId) return;

                    const answerType = getAnswerTypeAndQuestion(qId);
                    const isAnsCorrect = ansRecord.is_correct === true || ansRecord.is_correct === 1;
                    
                    let stateKey = (answerType === 'choice') ? ansRecord.option_for_task_option_id : 0;
                    if (!stateKey && answerType === 'choice') return;

                    if (isAnsCorrect) {
                        if (!updatedAnswers[qId]) updatedAnswers[qId] = {};
                        if (!updatedStates[qId]) updatedStates[qId] = {};
                        
                        updatedAnswers[qId][stateKey] = ansRecord.answer;
                        if (answerType !== 'no-answer') {
                            updatedStates[qId][stateKey] = 'correct';
                        }
                    } else {
                        if (!updatedErrors[qId]) updatedErrors[qId] = {};
                        if (!updatedErrors[qId][stateKey]) updatedErrors[qId][stateKey] = [];
                        
                        const cleanedErrValue = cleanText(ansRecord.answer);
                        if (!updatedErrors[qId][stateKey].includes(cleanedErrValue)) {
                            updatedErrors[qId][stateKey].push(cleanedErrValue);
                        }
                    }
                });

                if (Object.keys(updatedAnswers).length > 0) {
                    setUserAnswers(prev => {
                        const next = { ...prev };
                        Object.keys(updatedAnswers).forEach(qId => {
                            next[qId] = { ...next[qId], ...updatedAnswers[qId] };
                        });
                        return next;
                    });
                }

                if (Object.keys(updatedStates).length > 0) {
                    setAnswerStates(prev => {
                        const next = { ...prev };
                        Object.keys(updatedStates).forEach(qId => {
                            next[qId] = { ...next[qId], ...updatedStates[qId] };
                        });
                        return next;
                    });
                }

                if (Object.keys(updatedErrors).length > 0) {
                    setErrorHistory(prev => {
                        const next = { ...prev };
                        Object.keys(updatedErrors).forEach(qId => {
                            next[qId] = next[qId] || {};
                            Object.keys(updatedErrors[qId]).forEach(stateKey => {
                                const existingErrs = next[qId][stateKey] || [];
                                const newErrs = updatedErrors[qId][stateKey].filter(err => !existingErrs.includes(err));
                                next[qId][stateKey] = [...existingErrs, ...newErrs];
                            });
                        });
                        return next;
                    });
                }

            } catch (error) {
                console.error("Ошибка при получении обновлений ответов:", error);
            }
        };

        const intervalId = setInterval(fetchNewAnswers, 1500);
        return () => clearInterval(intervalId);
        
    }, [tasks, currentUserId]);

    const handleSelectChoice = (questionId, option_for_option_id, user_answer) => {
        setUserAnswers(prev => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                [option_for_option_id]: user_answer
            }
        }));
    };

    const handleInputChange = (questionId, gapIndex, user_answer) => {
        setUserAnswers(prev => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                [gapIndex]: user_answer
            }
        }));
    };

    const cleanText = (text) => {
        if (!text) return '';
        return text.toString()
            .toLowerCase()
            .trim()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    };

    const veritifyAnswer = (task_id, answerType, question, option_for_option_id = null, user_answer) => {
        if (!user_answer) {
            return;
        }
        const questionId = question.id;

        const stateKey = answerType === 'choice' ? option_for_option_id : 0;
        
        let real_answer;
        let isCorrect;
        if (answerType == 'choice') {            
            real_answer = question.answer_options.find(opt => opt.option_for_task_option_id == stateKey);
            isCorrect = cleanText(real_answer.answer) == cleanText(user_answer);
        } else if (answerType == 'input') {
            real_answer = question.answer_options.find(opt => cleanText(opt.answer) == cleanText(user_answer));            
            isCorrect = real_answer;
        } else if (answerType == 'no-answer') {
            isCorrect = 1;
        }

        if (isCorrect) {
            if (answerType != 'no-answer') {
                setAnswerStates(prev => ({
                    ...prev,
                    [questionId]: { ...prev[questionId], [stateKey]: 'correct' }
                }));
            }

            axios.post('/save-task-answer', {
                user_id: currentUserId,
                task_id: task_id,
                task_option_id: questionId,
                option_for_task_option_id: option_for_option_id || null,
                answer: cleanText(user_answer),                
                is_correct: true
            }).catch(err => console.error("Ошибка сохранения ответа:", err));

        } else {
            const pastErrors = errorHistory[questionId]?.[stateKey] || [];
            
            if (pastErrors.includes(cleanText(user_answer))) {
                if (!errorMessage) {
                    setErrorMessage(`Вы уже выбирали вариант "${user_answer}", и он неверный!`);
                    setTimeout(() => {
                        setErrorMessage(null);
                    }, 4000)
                }
                return;
            }

            setErrorHistory(prev => ({
                ...prev,
                [questionId]: { ...prev[questionId], [stateKey]: [...pastErrors, cleanText(user_answer)] }
            }));

            setShakingButtons(prev => ({
                ...prev,
                [questionId]: { ...prev[questionId], [stateKey]: 'shake-error' }
            }));

            axios.post('/save-task-answer', {
                user_id: currentUserId,
                task_id: task_id,
                task_option_id: questionId,
                option_for_task_option_id: option_for_option_id,
                answer: cleanText(user_answer),
                is_correct: false
            }).catch(err => console.error("Ошибка сохранения неверного ответа:", err));

            setTimeout(() => {
                setShakingButtons(prev => ({
                    ...prev,
                    [questionId]: { ...prev[questionId], [stateKey]: '' }
                }));
            }, 400);
        }
    };

    return (
        <>
        {tasks.map((task, taskID) => {
            const mediaType = task.type_of_media.name;
            const taskNumber = taskID + 1;
            const answerType = task.type_of_answer.name;
                        
            if (mediaType === 'text') {
                return (
                    <TextPage 
                        key={task.id} 
                        task={task} taskNumber={taskNumber} answerType={answerType} 
                        handleSelectChoice={handleSelectChoice} 
                        veritifyAnswer={veritifyAnswer}
                        handleInputChange={handleInputChange}
                        userAnswers={userAnswers}
                        shakingButtons={shakingButtons}
                        answerStates={answerStates}
                        errorHistory={errorHistory}/>
                );
            }
            if (mediaType === 'image') {
                return (
                    <ImagePage 
                        key={task.id} 
                        task={task} taskNumber={taskNumber} answerType={answerType}                         
                        veritifyAnswer={veritifyAnswer}
                        handleInputChange={handleInputChange}
                        userAnswers={userAnswers}
                        shakingButtons={shakingButtons}
                        answerStates={answerStates}
                        errorHistory={errorHistory}/>
                );
            }
            if (mediaType === 'audio') {
                const block = task.task_options[0];
                return (
                    <div key={block.id}>
                        <h3 className="title">📝 {taskNumber + '. ' + task.description}</h3>
                        <AudioPage block={block} command={handleTheoryAudioPlay}/>
                    </div>
                );
            }
            if (mediaType === 'video') {
                const block = task.task_options[0];
                return (
                    <div key={block.id}>
                        <h3 className="title">📝 {taskNumber + '. ' + task.description}</h3>                
                        <VideoPage block={block}/>
                    </div>
                );
            }
        })}
        <Error text={errorMessage}/>
        </>
    )
}

export default Tasks;
