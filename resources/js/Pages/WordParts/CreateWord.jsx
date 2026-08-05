import { useState } from "react";
import axios from "axios";

const CreateWord = ({ speakEnglishWord }) => {
    const [newWord, setNewWord] = useState({ name: '', translation: '', audio: null });
    const [isTranslating, setIsTranslating] = useState(false);
    const [existWords, setExistWord] = useState([]);

    const handleAutoTranslate = async () => {
        const wordText = newWord.name.trim();
        if (!wordText) return;

        setIsTranslating(true);
        try {
            const response = await axios.get('/words/get-auto-translation', { params: { word: wordText }});

            const translatedText = response.data?.translation;
            
            if (translatedText) {
                setNewWord(prev => ({
                    ...prev,
                    translation: translatedText.toLowerCase()
                }));
                
                speakEnglishWord(wordText);
            }

            const wordResponse = await axios.get('/words/get-exist-words', { params: { word: wordText }});
            setExistWord(wordResponse.data.words);

        } catch (error) {
            console.error("Ошибка автоперевода:", error);
        } finally {
            setIsTranslating(false);
        }
    };

    const handleCreateWord = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', newWord.name);
        formData.append('translation', newWord.translation);
        
        if (newWord.audio) {
            formData.append('audio', newWord.audio);
        }

        try {
            await axios.post('/words/add-word', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setNewWord({ name: '', translation: '', audio: null });
        } catch (error) {
            console.error("Ошибка при создании слова:", error);
        }
    };

    return (
        <form onSubmit={handleCreateWord}>
            <h4>Добавить новое слово в базу</h4>
            
            <div className="word-voice-btn">
                <input 
                    type="text" 
                    placeholder={isTranslating ? "Переводим..." : "Слово"}
                    value={newWord.name} 
                    onChange={e => setNewWord({...newWord, name: e.target.value})} 
                    onBlur={handleAutoTranslate}
                    disabled={isTranslating}
                    required 
                />
                {newWord.name && (
                    <button 
                        type="button" 
                        onClick={() => speakEnglishWord(newWord.name)}
                        title="Прослушать произношение"
                    >
                        🔊
                    </button>
                )}
            </div>

            {existWords && existWords.length > 0 && (
                <div className="words-in-base">
                    <h5>Слова в базе</h5>
                    <div>
                        {existWords.map((existWord, ind) => (
                            <p key={ind}>{existWord.name} - {existWord.translation}</p>
                        ))}
                    </div>
                </div>
            )}

            <input 
                type="text" 
                placeholder="Перевод" 
                value={newWord.translation} 
                onChange={e => setNewWord({...newWord, translation: e.target.value})} 
                required 
            />

            <input 
                type="file" 
                className='file' 
                accept="audio/mp3, audio/mpeg" 
                onChange={e => setNewWord({...newWord, audio: e.target.files[0]})} 
            />

            <button type="submit" disabled={isTranslating}>
                {isTranslating ? "Ожидание перевода..." : "Создать слово"}
            </button>
        </form>
    );
};

export default CreateWord;
