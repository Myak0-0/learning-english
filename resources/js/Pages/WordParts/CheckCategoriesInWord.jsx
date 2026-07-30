const CheckCategoriesInWord = ({handleMoveCategory, selectedWord, categories}) => {
    return (
        <div className="manage-word-categories">
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
    );
}

export default CheckCategoriesInWord