import axios from "axios";
import { useState } from "react";

const Word = ({ block, command: playAudio, currentUserId }) => {
    const [words, setWords] = useState(block.word_details || []);

    const addWords = async (wordIds) => {
        if (!wordIds || wordIds.length === 0) return;
        
        try {
            await axios.post('/user/add-word', { word_ids: wordIds, currentUserId: currentUserId });
        } catch (error) {
            console.error("Ошибка при добавлении слов:", error);
        }

        setWords(prevWords => 
            prevWords.map(word => 
                wordIds.includes(word.id) ? { ...word, isRepeating: true } : word
            )
        );
    };

    const deleteWord = async (wordId) => {
        if (!wordId) return;
        
        try {
            await axios.post('/user/delete-word', { word_id: wordId, currentUserId: currentUserId });
        } catch (error) {
            console.error("Ошибка при удалении слова:", error);
        }

        setWords(prevWords => 
            prevWords.map(word => 
                word.id === wordId ? { ...word, isRepeating: false } : word
            )
        );
    };

    return (
        <div key={block.id} className="words-container">
            <div className="title">
                <h4>Слова для изучения</h4>
                <button className="btn-circle btn-add" title="Добавить в свои слова" onClick={() => addWords(block.word_details.map(word => word.id))}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>
            </div>

            <div className="grid">
            {words.map((word) => (
                <div key={word.id} className="word-card">
                    <div className="lexicon">
                        <span className="foreign">{word.name}</span>
                        <span className="separator">—</span>
                        <span className="translation">{word.translation}</span>
                    </div>
                    <div className="buttons">
                        <button className="btn-circle btn-play" onClick={() => playAudio(word.audio)} title="Послушать">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                        </button>
                        {word.isRepeating ? (
                            <button className="btn-circle btn-delete" title="Удалить из слов" onClick={() => deleteWord(word.id)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">     
                                    <line x1="18" y1="6" x2="6" y2="18"></line> 
                                    <line x1="6" y1="6" x2="18" y2="18"></line> 
                                </svg> 
                            </button>                            
                        ) : (
                            <button className="btn-circle btn-add" title="Добавить в свои слова" onClick={() => addWords([word.id])}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            ))}
            </div>
        </div>
    )
}

export default Word;
