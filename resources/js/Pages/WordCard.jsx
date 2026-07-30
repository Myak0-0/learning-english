import '../../css/wordCard.scss';
import { useState, useEffect } from 'react';

const WordCard = ({ words, onClose, playAudio, speakEnglishWord }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);

    const currentWord = words[currentIndex];

    useEffect(() => {
        setIsFlipped(false);
        setUserInput('');
        setIsCorrect(false);
    }, [currentIndex]);

    const handleInputChange = (e) => {
        const val = e.target.value;
        setUserInput(val);

        const cleanUserWord = val.trim().toLowerCase();
        const cleanTargetWord = currentWord.name.trim().toLowerCase();

        if (cleanUserWord === cleanTargetWord) {
            setIsCorrect(true);
            setIsFlipped(true);
            
            currentWord.audio ? playAudio(currentWord.audio) : speakEnglishWord(currentWord.name);
        } else {
            setIsCorrect(false);
        }
    };

    const nextCard = () => {
        if (currentIndex < words.length - 1) {
            if (isFlipped) {
                setIsFlipped(false);
                setTimeout(() => {
                    setCurrentIndex(prev => prev + 1);
                }, 300);
            } else {
                setCurrentIndex(prev => prev + 1);
            }            
        }
    };

    const prevCard = () => {
        if (currentIndex > 0) {
            if (isFlipped) {
                setIsFlipped(false);
                setTimeout(() => {
                    setCurrentIndex(prev => prev - 1);
                }, 300); 
            } else {
                setCurrentIndex(prev => prev - 1);
            }
        }
    };

    return (
        <div className="card-backdrop" onClick={onClose}>
            <div className="card-window" onClick={(e) => e.stopPropagation()}>
                {!words || words.length === 0 ? (
                    <div className="game-container empty">
                        <p>В этой категории нет слов для изучения 😢</p>
                    </div>
                ) : (
                    <>
                    <div className="header">
                        <h3>Изучение слов ({currentIndex + 1} / {words.length})</h3>
                        <button className="close" onClick={onClose}>✕ Закрыть</button>
                    </div>

                    <div className="progress-bar">
                        <div className="fill" style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}></div>
                    </div>

                    <div className={`card ${isFlipped ? 'flipped' : ''} ${isCorrect ? 'correct-flash' : ''}`}
                        onClick={() => {
                            !isFlipped && (currentWord.audio ? playAudio(currentWord.audio) : speakEnglishWord(currentWord.name));
                            !isCorrect && setIsFlipped(!isFlipped);                        
                        }}>
                        <div className="card-face card-front">
                            <span className="text">{currentWord.translation}</span>
                            <span className="hint">Кликните, чтобы перевернуть или введите ответ ниже</span>
                        </div>
                        <div className="card-face card-back">
                            <span className="text">{currentWord.name}</span>
                            
                            <button className="btn-audio" onClick={(e) => { 
                                e.stopPropagation();
                                currentWord.audio ? playAudio(currentWord.audio) : speakEnglishWord(currentWord.name);
                            }}>
                                🔊 Озвучить
                            </button>
                        </div>
                    </div>

                    <input 
                        type="text" 
                        placeholder="Напишите перевод на английском..." 
                        value={userInput}
                        onChange={handleInputChange}
                        disabled={isCorrect}
                        className={isCorrect ? 'input-success' : ''}
                    />

                    <div className="controls">
                        <button className="btn-nav" onClick={prevCard} disabled={currentIndex === 0}>
                            ⬅ Назад
                        </button>
                        <button className="btn-nav" onClick={nextCard} disabled={currentIndex === words.length - 1}>
                            Вперед ➡
                        </button>
                    </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default WordCard;
