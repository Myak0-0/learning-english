import axios from "axios";
import { useState } from "react";

const CheckCategoriesInWord = ({handleMoveCategory, selectedWord, categories}) => {
    const [translation, setTranslation] = useState(selectedWord.translation);
    const [wordName, setWordName] = useState(selectedWord.name);

    const handleUpdateTranslation = async (e) => {
        e.preventDefault();

        if (translation != "" && wordName != "") {
            await axios.post('/words/update-translation', {
                word_id: selectedWord.id,
                word_name: wordName,
                translation
            });
        }
        window.location.reload();
    }

    return (
        <div className="manage-word-categories">
            <form onSubmit={handleUpdateTranslation} className="update-translation-form">
                <h3>Редактировать слово: <span className="highlight-word">"{selectedWord.name}"</span></h3>
                <input type="text" value={wordName} onChange={(e) => setWordName(e.target.value)}/>
                <input type="text" value={translation} onChange={(e) => setTranslation(e.target.value)}/>
                <button>Изменить перевод слова</button>
            </form>
            <div>
                <h4>Категории для слова: <span className="highlight-word">"{selectedWord.name}"</span></h4>
                <p className="subtitle">Отметьте папки, в которых должно находиться слово</p>
                
                <div className="list">
                {categories
                    .filter(c => c.id !== 0)
                    .map(cat => {
                    const isAttached = cat.words?.some(w => w.id === selectedWord.id);

                    return (
                        <label key={cat.id} className="item">
                        <input 
                            type="checkbox" 
                            checked={isAttached} 
                            onChange={(e) => handleMoveCategory(cat.id, e.target.checked)}
                        />
                        <span>📁 {cat.name}</span>
                        </label>
                    );
                })}
                </div>
            </div>
        </div>
    );
}

export default CheckCategoriesInWord