import { useForm } from '@inertiajs/react';
import '../../../css/addSectionModal.scss';

const AddSectionModal = ({ currentFolder, onClose, link_topic }) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        is_topic: false,
        parent_id: currentFolder?.id || null,
        link: 'NEW_LESSON'
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        post('/section/add', {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <div className="add-section-modal" onClick={onClose}>
            <div className="add-section-form" onClick={(e) => e.stopPropagation()}>
                
                <div className='title-close'>
                    <h3 className="title">🆕 Добавить секцию</h3>
                    <button onClick={onClose} title="Закрыть">
                        ✕
                    </button>
                </div>

                {currentFolder &&
                    <p className='current-folder'>Текущая папка: <span className='folder-emphasis'>{currentFolder.title }</span></p>
                }

                <form onSubmit={handleSubmit}>
                    <div className="group-item">
                        <label>Название секции</label>
                        <input
                            type="text"
                            placeholder="Например: Present Simple"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            required
                        />
                        {errors.title && <span className="add-section-error">{errors.title}</span>}
                    </div>

                    <div className="group-item">
                        <label>Тип материала</label>
                        <div className="add-section-radio-selector">
                            <label className={`${!data.is_topic ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="is_topic"
                                    checked={data.is_topic === false}
                                    onChange={() => setData('is_topic', false)}
                                />
                                📁 Папка
                            </label>
                            
                            <label className={`${data.is_topic ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="is_topic"
                                    checked={data.is_topic === true}
                                    onChange={() => setData('is_topic', true)}
                                />
                                📄 Тема урока
                            </label>
                        </div>
                    </div>

                    {data.is_topic && (
                    <div className='group-item'>
                        <label>Ссылка на урок</label>
                        <select className='link-select' onChange={(e) => setData('link', e.target.value)}>
                            <option value="NEW_LESSON">Новый урок</option>
                            {link_topic.map((link, $index) => (
                                <option key={$index} value={link.id}>{link.title}</option>
                            ))}
                        </select>
                    </div>
                    )}

                    <button 
                        type="submit" 
                        className="send" 
                        disabled={processing}
                    >
                        {processing ? 'Сохранение...' : 'Создать и сохранить'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddSectionModal;
