const CheckWordsInCategory = ({ handleMoveCategory, selectedCategory, words, categories }) => {
    return (
        <div className="manage-word-categories">
            <h4>Слова для категории: <span className="highlight-word">"{selectedCategory.name}"</span></h4>
            <p className="subtitle">Отметьте слова, которые должны находиться в этой категории</p>
            
            <div className="list">
            {words.map(word => {
                const currentLiveCategory = categories.find(c => c.id === selectedCategory.id);
                const isAttached = currentLiveCategory?.words?.some(catWord => catWord.id === word.id) || false;

                return (
                <label key={word.id} className="item">
                    <input 
                    type="checkbox" 
                    checked={isAttached} 
                    onChange={(e) => handleMoveCategory(word.id, e.target.checked)}
                    />
                    <span>{word.name} — <span>{word.translation}</span></span>
                </label>
                );
            })}                    
            </div>
        </div>
    );
}

export default CheckWordsInCategory