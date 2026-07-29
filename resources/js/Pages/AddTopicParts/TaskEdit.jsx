import { useState } from "react";
import '../../../css/TaskEdit.scss';
import { router } from "@inertiajs/react";

const TaskEdit = ({answerTypes, mediaTypes, topic, currentPage, existingTasks, handleMoveBlock, setErrorMessage}) => {    
    const [description, setDescription] = useState("");
    const [answerTypeName, setAnswerTypeName] = useState("input");
    const [mediaTypeName, setMediaTypeName] = useState("text");

    const [questions, setQuestions] = useState([
        { content: "", gaps: [] }
    ]);

    const handleQuestionContentChange = (qIdx, text) => {
        const matches = text.match(/\(___\)/g) || [];
        const gapCount = matches.length;

        setQuestions(prev => prev.map((q, idx) => {
            if (idx !== qIdx) return q;

            const updatedGaps = Array.from({ length: gapCount }, (_, gapIdx) => {
                return q.gaps[gapIdx] || { options: "", answers: [""] };
            });

            return { ...q, content: text, gaps: updatedGaps };
        }));
    };

    const handleAddQuestionRow = () => {
        setQuestions([...questions, { content: "", gaps: [] }]);
    };

    const handleRemoveQuestionRow = (qIdx) => {
        setQuestions(questions.filter((_, idx) => idx !== qIdx));
    };

    const handleGapOptionsChange = (qIdx, gapIdx, val) => {
        setQuestions(prev => prev.map((q, idx) => {
            if (idx !== qIdx) return q;
            const updatedGaps = [...q.gaps];
            updatedGaps[gapIdx].options = val;
            return { ...q, gaps: updatedGaps };
        }));
    };

    const handleAddAlternativeAnswer = (qIdx, gapIdx) => {
        setQuestions(prev => prev.map((q, idx) => {
            if (idx !== qIdx) return q;
            const updatedGaps = [...q.gaps];
            updatedGaps[gapIdx].answers = [...updatedGaps[gapIdx].answers, ""];
            return { ...q, gaps: updatedGaps };
        }));
    };

    const handleAnswerValueChange = (qIdx, gapIdx, ansIdx, val) => {
        setQuestions(prev => prev.map((q, idx) => {
            if (idx !== qIdx) return q;
            const updatedGaps = [...q.gaps];
            updatedGaps[gapIdx].answers[ansIdx] = val;
            return { ...q, gaps: updatedGaps };
        }));
    };

    const handleSaveTaskBlock = (e) => {
        e.preventDefault();

        if (!description.trim()) {
            setErrorMessage("Заполните описание задания!");
            return;
        }

        const formData = new FormData();

        formData.append("section_id", topic.id);
        formData.append("page", currentPage);
        formData.append("description", description);
        formData.append("answer_type", answerTypeName);
        formData.append("media_type", mediaTypeName);
                
        questions.forEach((q, qIndex) => {
            console.log(q);
            formData.append(`questions[${qIndex}][content]`, q.content || "");
            formData.append(`questions[${qIndex}][has_gap]`, q.has_gap ? 'true' : 'false');

            if (q.gaps && Array.isArray(q.gaps)) {
                q.gaps.forEach((gap, gapIndex) => {
                
                if (gap.options !== undefined && gap.options !== null && gap.options !== "") {
                    formData.append(`questions[${qIndex}][gaps][${gapIndex}][options]`, gap.options);
                }

                if (gap.answers && Array.isArray(gap.answers)) {
                    gap.answers.forEach((answer, ansIndex) => {
                    formData.append(`questions[${qIndex}][gaps][${gapIndex}][answers][${ansIndex}]`, answer || "");
                    });
                }
                });
            }
            
            if ((mediaTypeName === 'image' || mediaTypeName === 'audio') && q.file) {
                formData.append(`questions[${qIndex}][file]`, q.file);
            }
        });

        axios.post("/section/task-block/add", formData)        
        .then(() => {
            setDescription("");
            setQuestions([{ content: "", gaps: [] }]);
            router.reload();
        })
        .catch(err => console.error("Ошибка сохранения блока задач:", err));
    };



    const handleDeleteTask = (taskId) => {
        if (!confirm("Вы уверены, что хотите полностью удалить эту карточку задания вместе со всеми строками вопросов и эталонами ответов?")) return;

        axios.post('/section/task-block/delete', { task_id: taskId })
            .then(() => {
                setErrorMessage("Задание успешно удалено!");
                router.reload();
            })
            .catch(err => console.error("Ошибка удаления карточки:", err));
    };

    const handleDeleteQuestionRow = (questionId) => {
        if (!confirm("Удалить эту строчку предложения из задания? Все связанные варианты и эталоны ответов также будут стерты.")) return;

        axios.post('/section/task-option/delete', { question_id: questionId })
            .then(() => {
                alert("Строка вопроса удалена!");
                router.reload();
            })
            .catch(err => console.error("Ошибка удаления строки:", err));
    };

    return (
        <>
        <div className="task-left">
            <h4 className="title">🎮 Созданные упражнения на странице {currentPage}</h4>
            <div className="list">
                {existingTasks && existingTasks.length === 0 ? (
                    <p className="no-tasks-msg">Упражнений на этой странице еще нет. Заполните форму справа.</p>
                ) : (
                    existingTasks.map((task, tIdx) => (
                        <div key={task.id} className="add-task-item">
                            
                            <div className="header">
                                <div className="title">
                                    <span className="number">Задание №{tIdx + 1}</span>
                                    <span className="type-answer">{task.type_of_answer.name}</span>
                                    <p className="description">📝 {task.description}</p>
                                </div>
                                <div className="actions">
                                    <button disabled={tIdx === 0} onClick={() => handleMoveBlock(task.id, 'up', 'task')} title="Карточку выше">▲</button>
                                    <button disabled={tIdx === existingTasks.length - 1} onClick={() => handleMoveBlock(task.id, 'down', 'task')} title="Карточку ниже">▼</button>
                                    <button className="delete" onClick={() => handleDeleteTask(task.id)}>Удалить</button>
                                </div>
                            </div>

                            <div className="questions-list">
                                <div className="title">Вложенные строки предложений ({task.task_options?.length || 0}):</div>
                                
                                {task.task_options && task.task_options.map((question, qIdx) => (
                                    <div key={question.id} className="question-item">
                                        <div className="row">
                                            <div className="question">
                                                <span className="number">{qIdx + 1}.</span>
                                                <p className="content">{question.content}</p>
                                            </div>
                                            <div className="actions">
                                                <button disabled={qIdx === 0} onClick={() => handleMoveBlock(question.id, 'up', 'task-option')} title="Вопрос выше">▲</button>
                                                <button disabled={qIdx === task.task_options.length - 1} onClick={() => handleMoveBlock(question.id, 'down', 'task-option')} title="Вопрос ниже">▼</button>
                                                <button className="delete" onClick={() => handleDeleteQuestionRow(question.id)}>✕</button>
                                            </div>
                                        </div>

                                        {question.answer_options && question.answer_options.length > 0 &&
                                            <div className="answer-block">                                            
                                                <h5 className="title">Варианты ответа</h5>

                                                {task.type_of_answer.name == 'choice' && question.option_for_task_options && question.option_for_task_options.sort((a, b) => a.order - b.order).map((opt_f_opt, opt_f_opt_Idx) => {
                                                    const answer = question.answer_options[opt_f_opt.order];
                                                    return (                                                
                                                        <p key={opt_f_opt_Idx}><span className="number">{opt_f_opt.order}</span> - {opt_f_opt.option} - {answer.answer}</p>                                                
                                                    )
                                                })}
                                                {task.type_of_answer.name == 'input' && question.answer_options && question.answer_options.map((answer, answer_Idx) => (                                            
                                                    <p key={answer_Idx}><span className="number">{answer_Idx}</span> - {answer.answer}</p>                                            
                                                ))}
                                            </div>
                                        }
                                    </div>
                                ))}
                            </div>

                        </div>
                    ))
                )}
            </div>
        </div>
        

        <div className="task-right">
            <h3 className="title">🎮 Конструктор интерактивных заданий</h3>

            <form onSubmit={handleSaveTaskBlock}>

                <div className="form-task-description">
                    <div className="form-item-box">
                        <label>Описание / Инструкция задания:</label>
                        <input 
                            type="text" 
                            placeholder="Описание..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="form-task-input">
                        <div className="form-item-box">
                            <label>Проверка (Тип ответа):</label>
                            <select value={answerTypeName} onChange={(e) => setAnswerTypeName(e.target.value)}>
                                {answerTypes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                            </select>
                        </div>

                        <div className="form-item-box">
                            <label>Медиа-контент задачи:</label>
                            <select value={mediaTypeName} onChange={(e) => setMediaTypeName(e.target.value)}>
                                {mediaTypes.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="form-task-questions">
                    <h5>строки вопросов предложений:</h5>
                    
                    {questions.map((question, qIdx) => (
                        <div key={qIdx} className="task-row-question">
                            <div className="header">
                                <span className="number">Вопрос №{qIdx + 1}</span>
                                {questions.length > 1 && (
                                    <button type="button" className="remove-row" onClick={() => handleRemoveQuestionRow(qIdx)}>✕ Удалить строку</button>
                                )}
                            </div>

                            <div className="form-item-box">
                                <label>Контент вопроса:</label>
                                
                                {(mediaTypeName === "text" || mediaTypeName === "video") && (
                                    <input 
                                        type="text"
                                        placeholder="Yesterday I (___) at home."
                                        value={question.content}
                                        onChange={(e) => handleQuestionContentChange(qIdx, e.target.value)}
                                        required
                                    />
                                )}

                                {mediaTypeName === "image" && (
                                    <div className="media-file">
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            required={!question.file}
                                            onChange={(e) => {
                                                const file = e.target.files[0];                                                
                                                setQuestions(prev => prev.map((q, idx) => idx === qIdx ? { ...q, file: file } : q));                                                
                                                handleQuestionContentChange(qIdx, question.has_gap ? "(___)" : "");
                                            }}
                                        />
                                        
                                        <label className="checkbox">
                                            <input 
                                                type="checkbox"
                                                checked={question.has_gap || false}
                                                onChange={(e) => {
                                                    const isChecked = e.target.checked;
                                                    setQuestions(prev => prev.map((q, idx) => idx === qIdx ? { ...q, has_gap: isChecked } : q));                                                    
                                                    handleQuestionContentChange(qIdx, isChecked ? "(___)" : "");
                                                }}
                                            />
                                            <span>Фото предусматривает ответ</span>
                                        </label>
                                    </div>
                                )}

                                {mediaTypeName === "audio" && (
                                    <div className="media-file-builder-block">
                                        <input 
                                            type="file" 
                                            accept="audio/*"
                                            required={!question.file}
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                setQuestions(prev => prev.map((q, idx) => idx === qIdx ? { ...q, file: file } : q));
                                                handleQuestionContentChange(qIdx, question.has_gap ? "(___)" : "");
                                            }}
                                        />
                                    </div>
                                )}
                            </div>


                            {answerTypeName !== "no-answer" && (
                                question.gaps.map((gap, gapIdx) => (
                                    <div key={gapIdx} className="answer-options">
                                        <div className="header">⚙️ Варианты ответа</div>
                                        
                                        {answerTypeName === "choice" && (
                                            <div className="form-item-box">
                                                <label className="choose-options">Варианты выбора кнопки (через '/'):</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="was / were"
                                                    value={gap.options}
                                                    onChange={(e) => handleGapOptionsChange(qIdx, gapIdx, e.target.value)}
                                                    required
                                                />
                                            </div>
                                        )}
                                        
                                        <div className="input-answer">
                                            <div className="input-list">
                                                {gap.answers.map((ans, ansIdx) => (
                                                    <input 
                                                        key={ansIdx}
                                                        type="text"
                                                        placeholder={`Эталон ответа ${ansIdx + 1}`}
                                                        value={ans}
                                                        onChange={(e) => handleAnswerValueChange(qIdx, gapIdx, ansIdx, e.target.value)}
                                                        required
                                                    />
                                                ))}
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={() => handleAddAlternativeAnswer(qIdx, gapIdx)}
                                            >
                                                + Добавить правильный ответ
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ))}

                    <button type="button" className="add-question-row-btn" onClick={handleAddQuestionRow}>
                        ➕ Добавить предложение
                    </button>
                </div>

                <button className="save-task-btn">
                    🚀 Сохранить задание
                </button>
            </form>
        </div>
        </>
    );
};

export default TaskEdit;