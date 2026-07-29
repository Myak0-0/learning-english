const Dialogue = ({task, taskNumber, formatTheoryText}) => {
    return (
        <div key={task.id}>
        <h3 className="title">📝 {taskNumber + '. ' + task.description}</h3>
        <div className="questions-list">
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