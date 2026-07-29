import '../../css/lessons.scss';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AddSectionModal from './AdditionaFiles/AddSectionModal';
import Error from "./AdditionaFiles/Error";

import pencil from '../../images/pencil.webp';

import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';

const Lessons = ({ items, currentFolder, is_admin }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const handle_deliting = (e, section_id) => {
        e.preventDefault();

        if (!confirm('Вы уверены, что хотите удалить эту секцию?')) return;

        axios.post('/section/delete', { section_id: section_id })
            .then(res => {                                
                window.location.reload(); 
            })
            .catch(err => {                
                setErrorMessage(err?.response?.data?.message || 'Произошла ошибка при удалении.');
                setTimeout(() => {
                    setErrorMessage(null);
                }, 4000)
            });
    }

    const handle_editing = (e, topic_id) => {
        e.preventDefault();
        
        router.visit(`/add-topic?section_id=${topic_id}&page=1`);
    }

    return (
        <>
            <Head title={currentFolder?.title || 'Занятия'} />
            <div className="lessons-page">
                
                <div className="navigation">
                    <div className='folder-button'>
                        {currentFolder ? (
                            <Link 
                                href={route('lessons', currentFolder.parent_id || '')}                             
                            >
                                ⬅ Назад в {currentFolder.parent_id ? 'папку' : 'корень'}
                            </Link>
                        ) : (
                            <div className="welcome-lessons">
                                <h3>👋 Рады вас видеть!</h3>
                                <p>Здесь отображаются ваши папки и темы.</p>
                            </div>
                        )}
                        {is_admin &&
                            <button onClick={() => setIsModalOpen(!isModalOpen)}>+ Добавить секцию</button>
                        }
                    </div>
                    
                    {currentFolder && <h2 className="current-folder-title">📁 {currentFolder.title}</h2>}
                </div>

                <div className="lessons-grid">
                    {items.length === 0 ? (
                        <p className="empty-message">В этой папке пока ничего нет.</p>
                    ) : (
                        items.map((item) => {
                            const isTopic = item.is_topic === 1;
                            const targetUrl = isTopic 
                                ? route('topic', {id: item.id, page: 1}) 
                                : route('lessons', item.id);

                            return (
                                <Link 
                                    key={item.id} 
                                    href={targetUrl} 
                                    className={`card ${isTopic ? 'topic' : 'folder'}`}
                                >
                                    <div className="icon">
                                        {isTopic ? '🎯' : '📁'}
                                    </div>                                    
                                    
                                    <p className="info">{item.title}</p>

                                    {is_admin &&
                                        <>
                                        <button className='delete' onClick={(e) => handle_deliting(e, item.id)}>✕</button>
                                        
                                        {isTopic &&
                                            <button className='edit' onClick={(e) => handle_editing(e, item.id)}><img src={pencil} alt="pencil"/></button>
                                        }
                                        </>
                                    }
                                </Link>
                            );
                        })
                    )}
                </div>
                
                {isModalOpen && (
                    <AddSectionModal 
                        currentFolder={currentFolder}
                        onClose={() => setIsModalOpen(false)}
                    />
                )}
                <Error text={errorMessage}/>
            </div>
        </>
    );
}

Lessons.layout = page => <AuthenticatedLayout header="Занятия" children={page} />

export default Lessons;
