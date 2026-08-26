import { useState } from "react";

const Dialogue = ({task, taskNumber, formatTheoryText, preMediaType}) => {
    const [isOpenTap, setIsOpenTab] = useState(false);
    return (
        <div key={task.id}>
            <div className="dialogue-tab title">
                <h3>📝 {taskNumber + '. ' + task.description}</h3>
                {(preMediaType === 'audio' || preMediaType === 'video') &&
                    <span className="show-tab" onClick={() => setIsOpenTab(!isOpenTap)}>{isOpenTap ? 'Скрыть текст' : 'Показать'}</span>
                }
            </div>
            <div className={`questions-list ${(preMediaType && (preMediaType === 'audio' || preMediaType === 'video')) ? (isOpenTap ? 'open' : 'closed') : ''}`}>
                {task.task_options && task.task_options.map((question) => (
                    <div key={question.id} className="question-row input-row">
                        <div className="text-side">                        
                            <p>{formatTheoryText(question.content)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
export default Dialogue;