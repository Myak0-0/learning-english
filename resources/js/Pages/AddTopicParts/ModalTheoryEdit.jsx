import { useState } from 'react';
import pencil from '../../../images/pencil.webp';
import '../../../css/modalTheoryEdit.scss';
import axios from 'axios';
import { router } from '@inertiajs/react';

const ModalTaskEdit = ({ block, allWords, onClose }) => {
    const type_of_media = block?.type_of_media?.name;

    const [content, setContent] = useState(block?.content?.content || "");

    const [tableHead, setTableHead] = useState(() => {
        return type_of_media == "table" && block?.content?.head ? block.content.head : ['', ''];
    });

    const [tableRows, setTableRows] = useState(() => {
        return type_of_media == "table" && block?.content?.columns ? block.content.columns : [['', ''], ['', '']];
    });

    const [selectedWordId, setSelectedWordId] = useState("");
    const [wordsList, setWordsList] = useState(() => {
        const wordsIds = new Set(
            Array.isArray(content) ? content.map(id => Number(id)) : []
        );
        
        return allWords
            .filter(it => wordsIds.has(Number(it.id)))
            .map(it => it.id);
    });


    const handleAddWord = (e) => {
        e.preventDefault();
        if (!selectedWordId) return;

        const wordId = parseInt(selectedWordId);
        if (wordsList.includes(wordId)) {
            return;
        }

        setWordsList([...wordsList, wordId]);
        setSelectedWordId("");
    };

    const handleRemoveWord = (idToRemove) => {
        setWordsList(wordsList.filter(id => id !== idToRemove));
    };

    const handleUpdateTheoryBlock = (e) => {
        e.preventDefault();

        let contentValue = {};

        if (type_of_media === 'table') {
            contentValue = { head: tableHead, columns: tableRows };
        } else if (type_of_media == 'word') {
            contentValue = { content: wordsList }
        } else {
            contentValue = { content: content };
        }

        axios.post("/section/theory-block/update", {
            block_id: block.id,
            content: contentValue
        })
        .then(() => {
            router.reload();
            onClose();
        })
        .catch(err => console.error("Ошибка обновления задачи:", err));
    };

    return (
        <div className="modal-update-task" onClick={onClose}>
            <div className="side-form" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>✕</button>
                <h3 className="title"><img src={pencil} alt="карандаш" /> Редактировать задание №{block.id}</h3>

                <form onSubmit={handleUpdateTheoryBlock}>

                    {type_of_media == "table" ? (
                        <div className="add-table-dynamic">
                            <label className="table-section-title">
                                Редактирование таблицы:
                            </label>
                            
                            <table className="dynamic-inputs-table">
                                <thead>
                                    <tr>
                                        {tableHead.map((headCell, colIdx) => (
                                            <th key={`head-${colIdx}`}>
                                                <input 
                                                    type="text" 
                                                    placeholder={`Колонка ${colIdx + 1}`}
                                                    value={headCell}
                                                    onChange={(e) => {
                                                        const newHead = [...tableHead];
                                                        newHead[colIdx] = e.target.value;
                                                        setTableHead(newHead);
                                                    }}
                                                />
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableRows.map((row, rowIdx) => (
                                        <tr key={`row-${rowIdx}`}>
                                            {row.map((cellValue, colIdx) => (
                                                <td key={`cell-${rowIdx}-${colIdx}`}>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Ячейка"
                                                        value={cellValue}
                                                        onChange={(e) => {
                                                            const newRows = tableRows.map((r, rIdx) => 
                                                                rIdx === rowIdx 
                                                                    ? r.map((c, cIdx) => cIdx === colIdx ? e.target.value : c)
                                                                    : r
                                                            );
                                                            setTableRows(newRows);
                                                        }}
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="table-controls-buttons">
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        const newRow = Array(tableHead.length).fill('');
                                        setTableRows([...tableRows, newRow]);
                                    }}
                                >
                                    ➕ Добавить строку
                                </button>

                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setTableHead([...tableHead, '']);
                                        setTableRows(tableRows.map(row => [...row, '']));
                                    }}
                                >
                                    ➕ Добавить колонку
                                </button>
                            </div>
                        </div>
                    ) : type_of_media == "word" ? (
                        <div>
                            <label>Выбрать слово из базы словаря:</label>
                            <div className="word-input-add">
                                <select 
                                    value={selectedWordId} 
                                    onChange={(e) => setSelectedWordId(e.target.value)}
                                >
                                    <option value="">-- Выберите слово из списка --</option>
                                    {allWords && allWords.map(w => (
                                        <option key={w.id} value={w.id}>
                                            {w.name} [{w.translation}]
                                        </option>
                                    ))}
                                </select>
                                <button type="button" className="btn-add-id" onClick={handleAddWord}>
                                    Добавить
                                </button>
                            </div>

                            <div className="words-block">
                                <h5>Массив ID слов для отправки в JSON:</h5>
                                {wordsList.length === 0 ? (
                                    <p className="empty-array-msg">Слова не добавлены.</p>
                                ) : (
                                    <div className="list">
                                        {wordsList.map(id => {
                                            const wordObject = allWords.find(w => w.id === id);
                                            return (
                                                <span key={id}>
                                                    {wordObject ? `${wordObject.name} (${id})` : `ID: ${id}`}
                                                    <button type="button" onClick={() => handleRemoveWord(id)}>✕</button>
                                                </span>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="form-task-description">
                            <div className="form-item-box">
                                <label>Описание задания:</label>
                                <input placeholder="Description" type="text" value={content} onChange={(e) => setContent(e.target.value)} required />
                            </div>
                        </div>
                    )}

                    <button type="submit" className="save-task-btn">💾 Сохранить изменения</button>
                </form>
            </div>
        </div>
    );
};

export default ModalTaskEdit;