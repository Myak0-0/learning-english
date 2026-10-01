import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import '../../css/topicShow.scss';

import AudioPage from './TopicParts/Audio';
import TextPage from './TopicParts/Text';
import TitlePage from './TopicParts/Title';
import VideoPage from './TopicParts/Video';
import WordPage from './TopicParts/Word';
import TablePage from './TopicParts/Table';
import ImagePage from './TopicParts/Image';
import TasksPage from './TopicParts/Tasks';
import Desk from './TopicParts/Desk';


let currentAudio = null;

const TopicShow = ({ topic, currentPage, currentUserId, listIds, 
    lastUpdated, isAdmin, hasNextPageData }) => {

    const [deskIsHidden, setDeskIsHidden] = useState(true);
    const no_info = topic.theory_blocks.length == 0 && topic.tasks.length == 0;

    const playAudio = (audioFile) => {
        if (!audioFile) return;
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }
        currentAudio = new Audio(`/word-audios/${audioFile}`);
        currentAudio.play().catch(error => console.log('Ошибка воспроизведения:', error));
    };

    const speakEnglishWord = (text) => {
        if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        
        window.speechSynthesis.speak(utterance);
        }
    };

    const handleTheoryAudioPlay = (e) => {
        if (currentAudio && currentAudio !== e.target) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }
        currentAudio = e.target;
    };

    const formatTheoryText = (text) => {
        if (!text) return '';                            
        const parts = text.split(/(\%[^%]+\%|\@[^@]+\@|\#[^#]+\#)/g);
        
        return parts.map((part, index) => {
            if (part.startsWith('%') && part.endsWith('%')) {
                const cleanWord = part.slice(1, -1);
                return <span key={index} className="accent-word one">{cleanWord}</span>;
            }
            if (part.startsWith('@') && part.endsWith('@')) {
                const cleanWord = part.slice(1, -1);
                return <span key={index} className="accent-word two">{cleanWord}</span>;
            }

            if (part.startsWith('#') && part.endsWith('#')) {
                const cleanWord = part.slice(1, -1);
                return <span key={index} className="accent-word three">{cleanWord}</span>;
            }
            return part;
        });
    };

    return (
        <>
            <Head title={topic.title} />

            <Link className='link-go-to-back'
                href={route('lessons', topic.parent_id || '')}                             
            >
                ⬅ Вернуться к разделу
            </Link>
            
            <div className='topic-desk'>
            
                <div className="topic-page">
                    {topic.theory_blocks.length > 0 &&
                        <section className="theory-section">
                            {topic.theory_blocks.map((block) => {
                                const mediaType = block.type_of_media.name;

                                if (mediaType === 'text') {
                                    return <TextPage key={block.id} block={block} command={formatTheoryText}/>
                                }
                                
                                if (mediaType === 'title') {
                                    return <TitlePage key={block.id} block={block} command={formatTheoryText}/>
                                }

                                if (mediaType === 'video' && block.content) {
                                    return <VideoPage key={block.id} block={block}/>
                                }

                                if (mediaType === 'word' && block.word_details) {
                                    return <WordPage key={block.id} block={block} command={playAudio} currentUserId={currentUserId} speakEnglishWord={speakEnglishWord}/>
                                }

                                if (mediaType === "audio" && block.content) {
                                    return <AudioPage key={block.id} block={block} command={handleTheoryAudioPlay}/>                            
                                }

                                if (mediaType === 'table' && block.content) {
                                    return <TablePage key={block.id} block={block} command={formatTheoryText}/>
                                }

                                if (mediaType === 'image') {
                                    return <ImagePage key={block.id} block={block}/>;
                                }
                            })}
                        </section>
                    }

                    {topic.tasks.length > 0 && (
                    <section className="tasks-section">                    
                        <TasksPage tasks={topic.tasks} currentUserId={currentUserId} command={handleTheoryAudioPlay} 
                                listIds={listIds} lastUpdated={lastUpdated} formatTheoryText={formatTheoryText}
                                isAdmin={isAdmin}/>
                    </section>
                    )}

                    {no_info &&
                        <h4 className='no-info'>В данном разделе больше нет информации</h4>
                    }

                    <div className="pagination">
                        <Link onClick={(e) => {if (currentPage <= 1) e.preventDefault()}} href={route('topic', { id: topic.id, page: currentPage - 1 })} className={`${currentPage <= 1 && 'disabled'}`} >
                            Назад
                        </Link>
                        <span>Страница {currentPage}</span>
                        <Link onClick={(e) => {if (no_info || !hasNextPageData) e.preventDefault()}} href={route('topic', { id: topic.id, page: currentPage + 1 })} className={`${(no_info || !hasNextPageData) && 'disabled'}`} >
                            Вперед
                        </Link>
                    </div>
                </div>

                <section className={`${deskIsHidden ? '' : 'active'} edit-desk`}>
                    <div className='desk-border'>
                        <button onClick={() => setDeskIsHidden(!deskIsHidden)} className='desk-button'>{deskIsHidden ? '◀' : '▶'}</button>
                    </div>
                    <Desk topicId={topic.id}/>
                </section>

            </div>
        </>
    );
};

TopicShow.layout = page => {
    const topic = page.props.topic;
    return (
        <AuthenticatedLayout header={topic.title} children={page} />
    )
}

export default TopicShow;
