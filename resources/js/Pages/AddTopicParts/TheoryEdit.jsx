import { router } from "@inertiajs/react";
import { useState } from "react";
import '../../../css/theoryEdit.scss';

const TheoryEdit = ({ currentPage, existingBlocks, allWords,
                      mediaTypes, handleMoveBlock, topic, setErrorMessage
 }) => {
    const [mediaType, setMediaType] = useState(null);
    
    const [textContent, setTextContent] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [audioFile, setAudioFile] = useState(null);
    
    const [selectedWordId, setSelectedWordId] = useState("");
    const [wordsList, setWordsList] = useState([]);
    
    const [tableHead, setTableHead] = useState("");
    const [tableRows, setTableRows] = useState("");

    const [isProcessing, setIsProcessing] = useState(false);

    const handleAddWord = (e) => {
        e.preventDefault();
        if (!selectedWordId) return;

        const wordId = parseInt(selectedWordId);
        if (wordsList.includes(wordId)) {
            setErrorMessage("Это слово уже добавлено в блок изучаемых слов!");
            return;
        }

        setWordsList([...wordsList, wordId]);
        setSelectedWordId("");
    };

    const handleRemoveWord = (idToRemove) => {
        setWordsList(wordsList.filter(id => id !== idToRemove));
    };

    const handleDeleteBlock = (blockId) => {
        if (!confirm("Вы уверены, что хотите удалить этот блок теории с контентом?")) return;

        axios.post('/section/theory-block/delete', { block_id: blockId })
            .then(() => {
                setErrorMessage("Блок теории удален");

                router.reload();
            })
            .catch(err => console.error("Ошибка удаления:", err));
    };

    const handleSaveTheory = (e) => {
        e.preventDefault();        

        if (!mediaType) {
            setErrorMessage('Выберите тип');
            return;
        }
        setIsProcessing(true)

        const formData = new FormData();
        formData.append("section_id", topic.id);
        formData.append("page", currentPage);
        formData.append("type", mediaType);

        if (mediaType === "text" || mediaType === "title") {
            formData.append("content", JSON.stringify({ content: textContent }));
        } else if (mediaType === "video") {
            formData.append("content", JSON.stringify({ content: videoUrl }));
        } else if (mediaType === "word") {
            formData.append("content", JSON.stringify({ content: wordsList }));
        } else if (mediaType === "table") {
            const headArray = tableHead.split(";").map(s => s.trim()).filter(Boolean);
            const columnsArray = tableRows.split("\n").map(row => 
                row.split(";").map(cell => cell.trim()).filter(Boolean)
            ).filter(arr => arr.length > 0);

            formData.append("content", JSON.stringify({ head: headArray, columns: columnsArray }));
        } else if (mediaType === "image" && imageFile) {
            formData.append("file", imageFile);
        } else if (mediaType === "audio" && audioFile) {
            formData.append("file", audioFile);
        }                

        axios.post("/section/theory-block/add", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        })
        .then(() => {            
            setTextContent("");
            setVideoUrl("");
            setWordsList([]);
            setTableHead("");
            setTableRows("");
            setImageFile(null);
            setAudioFile(null);
            setIsProcessing(false)
            router.reload();
        })
        .catch(err => console.error("Ошибка сохранения:", err));        
    }

    return (
        <>
        <div className="add-topic-left">
            <h4 className="title">📄 Текущие блоки на странице {currentPage}</h4>
            <div className="list">
                {existingBlocks.length === 0 ? (
                    <p className="no-blocks-msg">На этой странице еще нет теории.</p>
                ) : (
                    existingBlocks.map((block, bIdx) => (
                        <div key={block.id} className="add-topic-block-list">
                            <div className="info">
                                <span>{block.type_of_media.name}</span>

                                    {(block.type_of_media.name === 'text' || block.type_of_media.name === 'title') && (
                                        <p className={`text ${block.type_of_media.name}`}>
                                            {block.content?.content}
                                        </p>
                                    )}

                                    {block.type_of_media.name === 'image' && block.content?.content && (
                                        <div className="image">
                                            <img src={`/images/theory/${block.content.content}`} alt="Preview" />
                                        </div>
                                    )}

                                    {block.type_of_media.name === 'video' && block.content?.content && (
                                        <div className="video">
                                            <iframe src={block.content.content} title="YouTube player" allowFullScreen></iframe>
                                        </div>
                                    )}

                                    {block.type_of_media.name === 'audio' && block.content?.content && (
                                        <div className="audio">
                                            <audio controls src={`/stream-audio/${block.content.content}`} controlsList="nodownload"></audio>
                                        </div>
                                    )}

                                    {block.type_of_media.name === 'word' && Array.isArray(block.content?.content) && (
                                        <div className="words">
                                            📖 Слов в блоке ({block.content.content.length}): {' '}
                                            <span className="list">
                                                {block.content.content.map((id, idx) => {
                                                    const matchWord = allWords.find(w => w.id == id);                                                            
                                                    return matchWord 
                                                        ? `${matchWord.name}${idx < block.content.content.length - 1 ? ', ' : ''}`
                                                        : `ID: ${id}${idx < block.content.content.length - 1 ? ', ' : ''}`;
                                                })}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {block.type_of_media.name === 'table' && block.content && (
                                        <div className="table">
                                            <table>
                                                <thead>
                                                    <tr>
                                                        {block.content.head && block.content.head.map((th, i) => (
                                                            <th key={i}>{th}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {block.content.columns && block.content.columns.map((row, rowIndex) => (
                                                        <tr key={rowIndex}>
                                                            {row.map((cell, cellIndex) => (
                                                                <td key={cellIndex}>{cell}</td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                            </div>
                            <div className="actions">
                                <button className="move" disabled={bIdx === 0} onClick={() => handleMoveBlock(block.id, 'up', 'theory')} title="Выше">▲</button>
                                <button className="move" disabled={bIdx === existingBlocks.length - 1} onClick={() => handleMoveBlock(block.id, 'down', 'theory')} title="Ниже">▼</button>
                                <button className="delete" onClick={() => handleDeleteBlock(block.id)}>Удалить</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>


        <div className="add-topic-right">
            <h3 className="title">➕ Добавить новый элемент</h3>

            <div className="type-selector">
                {mediaTypes.map(type => (
                    <button
                        key={type.id}
                        type="button"
                        className={`${mediaType === type.name ? "active" : ""}`}
                        onClick={() => setMediaType(type.name)}
                    >
                        {type.name}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSaveTheory}>
                {(mediaType === "text" || mediaType === "title") && (
                    <div>
                        <label>Содержимое текста:</label>
                        <textarea
                            placeholder="Введите текст теории..."
                            value={textContent}
                            onChange={(e) => setTextContent(e.target.value)}
                            required
                        />
                    </div>
                )}

                {mediaType === "video" && (
                    <div>
                        <label>Ссылка на YouTube:</label>
                        <input type="url" placeholder="https://..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} required />
                    </div>
                )}

                {mediaType === "image" && (
                    <div>
                        <label>Изображение:</label>
                        <input className="file" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} required />
                    </div>
                )}

                {mediaType === "audio" && (
                    <div>
                        <label>Аудиофайл:</label>
                        <input className="file" type="file" accept="audio/mpeg" onChange={(e) => setAudioFile(e.target.files[0])} required />
                    </div>
                )}

                {mediaType === "word" && (
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
                )}

                {mediaType === "table" && (
                    <div className="add-table">
                        <div className="sub-field-item">
                            <label>Шапка (элементы через точку с запятой):</label>
                            <input 
                                type="text" 
                                placeholder="Кто?; Кого?; Кому?"
                                value={tableHead} 
                                onChange={(e) => setTableHead(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="sub-field-item">
                            <label>Строки (ячейки через точку с запятой, новые строки через Enter):</label>
                            <textarea 
                                placeholder="Я; Меня; Мне&#10;Ты; Тебя; Тебе" 
                                value={tableRows} 
                                onChange={(e) => setTableRows(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>
                )}

                <button className="save" disabled={isProcessing}>
                    {isProcessing ? 'Сохранение...' : '🚀 Сохранить блок теории'}
                </button>
            </form>
        </div>
        </>
    );
}

export default TheoryEdit;