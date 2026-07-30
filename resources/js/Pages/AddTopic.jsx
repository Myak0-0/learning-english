import { useEffect, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import axios from "axios";
import '../../css/addTopic.scss';

import Error from "./AdditionaFiles/Error";
import TheoryEdit from "./AddTopicParts/TheoryEdit";
import TaskEdit from "./AddTopicParts/TaskEdit";


const AddTopic = ({ topic, currentPage, existingBlocks, mediaTypes, allWords, existingTasks, answerTypes }) => {        
    const [errorMessage, setErrorMessage] = useState(null);
    const [isTheory, setIsTheory] = useState(true);

    const handleRoute = (e, page) => {
        e.preventDefault();
        if (page < 1) {
            return;
        }
        router.visit(`/add-topic?section_id=${topic.id}&page=${page}`);    
    }

    useEffect(() => {
        if (!errorMessage) {
            setTimeout(() => {
                setErrorMessage(null);
            }, 4000)
        }
    }, [errorMessage])

    const handleMoveBlock = (blockId, direction, object) => {
        axios.post('/section/topic/move', { block_id: blockId, direction: direction, object: object })
            .then(() => router.reload())
            .catch(err => console.error("Ошибка сортировки:", err));
    };    

    return (
        <div className="add-topic-container">
            <Head title={`Редактирование: ${topic.title}`} />

            {isTheory ? (
            <TheoryEdit currentPage={currentPage} existingBlocks={existingBlocks} allWords={allWords}
                        mediaTypes={mediaTypes} handleMoveBlock={handleMoveBlock} topic={topic}
                        setErrorMessage={setErrorMessage}/>
            ) : (
            <TaskEdit answerTypes={answerTypes} mediaTypes={mediaTypes} topic={topic}
                      existingTasks={existingTasks} currentPage={currentPage} handleMoveBlock={handleMoveBlock}
                      setErrorMessage={setErrorMessage}/>
            )}

            <div className="pagination">
                <Link onClick={(e) => handleRoute(e, currentPage - 1)} className={`${currentPage <= 1 && 'disabled'}`}>
                    Назад
                </Link>
                <span>Страница {currentPage}</span>
                <Link onClick={(e) => handleRoute(e, currentPage + 1)}>
                    Вперед
                </Link>
            </div>

            <div className="switch-blocks">
                <button onClick={() => setIsTheory(true)} className={isTheory ? 'active' : ''}>Теории</button>
                <button onClick={() => setIsTheory(false)} className={!isTheory ? 'active' : ''}>Задачи</button>
            </div>

            <Error text={errorMessage}/>
        </div>
    );
}

AddTopic.layout = page => {
    const title = page.props.topic?.title || 'темы';

    return (<AuthenticatedLayout header={`Редактирование: '${title}'`} children={page} />)
};

export default AddTopic;
