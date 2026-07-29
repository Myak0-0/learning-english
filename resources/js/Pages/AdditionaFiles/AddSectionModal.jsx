import { useForm } from '@inertiajs/react';
import '../../../css/addSectionModal.scss';

const AddSectionModal = ({ currentFolder, onClose }) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        is_topic: false,
        parent_id: currentFolder?.id || null,
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
                    <div>Текущая папка: {currentFolder.title }</div>
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
