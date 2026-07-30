import { useState } from "react";

const CreateCategory = () => {
    const [newCategoryName, setNewCategoryName] = useState('');
    
    const handleCreateCategory = async (e) => {
        e.preventDefault();
        try {
        await axios.post('/words/add-category', { name: newCategoryName });
        setNewCategoryName('');
        } catch (error) { console.error(error); }
    };

    return (
        <form onSubmit={handleCreateCategory}>
            <h4>Создать новую категорию</h4>
            <input type="text" placeholder="Название категории" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} required />
            <button type="submit">Сохранить</button>
        </form>
    );
}

export default CreateCategory