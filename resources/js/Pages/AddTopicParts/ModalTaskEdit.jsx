import { useState, useEffect } from "react";
import axios from "axios";
import { router } from "@inertiajs/react";
import '../../../css/modalTaskEdit.scss';
import pencil from '../../../images/pencil.webp';

const ModalTaskEdit = ({ task, onClose }) => {
    const [description, setDescription] = useState(task?.description || "");
    const [answerTypeName, setAnswerTypeName] = useState(task?.type_of_answer?.name || "input");
    const [mediaContent, setMediaContent] = useState(task?.content?.content || "");

    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        if (!task || !task.task_options) return;

        const formattedQuestions = task.task_options.map(option => {
            const hasGapInText = option.content && option.content.includes('(___)');
            
            let gapsData = [];

            if (!hasGapInText) {
                gapsData = [];
            } 

            else if (task.type_of_answer.name === "choice" && option.option_for_task_options) {
                gapsData = option.option_for_task_options.sort((a, b) => a.order - b.order).map(opt => {
                    const matchedAnswers = option.answer_options 
                        ? option.answer_options.filter(ans => ans.option_for_task_option_id === opt.id).map(a => a.answer)
                        : [""];

                    return {
                        id: opt.id,
                        options: opt.option,
                        answers: matchedAnswers.length > 0 ? matchedAnswers : [""]
                    };
                });
            } 

            else if (task.type_of_answer.name === "input" && option.answer_options) {
                const allAnswers = option.answer_options.map(a => a.answer);
                gapsData = [{
                    id: null,
                    options: "",
                    answers: allAnswers.length > 0 ? allAnswers : [""]
                }];
            }

            return {
                id: option.id,
                content: option.content,
                gaps: gapsData
            };
        });

        setQuestions(formattedQuestions);
    }, [task]);

    const handleQuestionContentChange = (qIdx, text) => {
        const matches = text.match(/\(___\)/g) || [];
        const gapCount = matches.length;

        setQuestions(prev => prev.map((q, idx) => {
            if (idx !== qIdx) return q;
            const updatedGaps = Array.from({ length: gapCount }, (_, gapIdx) => {
                return q.gaps[gapIdx] || { id: null, options: "", answers: [""] };
            });
            return { ...q, content: text, gaps: updatedGaps };
        }));
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

    const handleUpdateTaskBlock = (e) => {
        e.preventDefault();

        console.log(questions);

        axios.post("/section/task-block/update", {
            task_id: task.id,
            description: description,
            media_content: mediaContent,
            questions: questions
        })
        .then(() => {
            router.reload();
            onClose();
        })
        .catch(err => console.error("Ошибка обновления задачи:", err));
    };

    const handleAddQuestionRow = () => {
        setQuestions([...questions, { id: null, content: "", gaps: [] }]);
    };

    return (
        <div className="modal-update-task" onClick={onClose}>
            <div className="side-form" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>✕</button>
                <h3 className="title"><img src={pencil} alt="карандаш" /> Редактировать задание №{task.id}</h3>

                <form onSubmit={handleUpdateTaskBlock}>
                    <div className="form-task-description">
                        <div className="form-item-box">
                            <label>Описание задания:</label>
                            <input placeholder="Description" type="text" value={description} onChange={(e) => setDescription(e.target.value)} required />
                        </div>
                    </div>

                    <div className="form-task-questions">
                        <h5>Строки вопросов предложений:</h5>
                        {questions.map((question, qIdx) => (
                            <div key={qIdx} className="task-row-question">
                                <span className="number">Вопрос №{qIdx + 1}</span>
                                <div className="form-item-box">
                                    <label>Текст вопроса:</label>
                                    <input 
                                        type="text" 
                                        value={question.content} 
                                        onChange={(e) => handleQuestionContentChange(qIdx, e.target.value)} 
                                        required
                                        placeholder="Yesterday I (___) at home."
                                    />
                                </div>

                                {answerTypeName !== "no-answer" && question.gaps && question.gaps.map((gap, gapIdx) => (
                                    <div key={gapIdx} className="answer-options">
                                        <div className="header">⚙️ Варианты ответа</div>

                                        {answerTypeName === "choice" && (
                                            <div className="form-item-box">
                                                <label className="choose-options">Варианты кнопками (через '/'):</label>
                                                <input 
                                                    type="text" 
                                                    value={gap.options} 
                                                    onChange={(e) => handleGapOptionsChange(qIdx, gapIdx, e.target.value)} 
                                                    required 
                                                    placeholder="was / were"
                                                />
                                            </div>
                                        )}

                                        <div className="input-answer">
                                            <div className="input-list">
                                                {gap.answers.map((ans, ansIdx) => (
                                                    <input 
                                                        key={ansIdx} 
                                                        type="text" 
                                                        value={ans} 
                                                        onChange={(e) => handleAnswerValueChange(qIdx, gapIdx, ansIdx, e.target.value)} 
                                                        required 
                                                        placeholder={`Эталон ${ansIdx + 1}`}
                                                    />
                                                ))}
                                            </div>
                                            <button type="button" className="add-question-row-btn" onClick={() => handleAddAlternativeAnswer(qIdx, gapIdx)}>
                                                + Добавить вариант ответа
                                            </button>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        ))}
                        <button type="button" className="add-question-row-btn" onClick={handleAddQuestionRow}>
                            ➕ Добавить предложение
                        </button>
                    </div>

                    <button type="submit" className="save-task-btn">💾 Сохранить изменения</button>
                </form>
            </div>
        </div>
    );
};

export default ModalTaskEdit;
